'use strict';

const nodeTest = typeof jest === 'undefined' ? require('node:test') : null;
const test = typeof jest === 'undefined' ? nodeTest.test : global.test;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const babel = require('@babel/core');

// ---------------------------------------------------------------------------
// Helpers to load and transpile modules with isolated mocks
// ---------------------------------------------------------------------------

function transpileCode(filePath) {
    const rawCode = fs.readFileSync(filePath, 'utf8');
    return babel.transformSync(rawCode, {
        configFile: path.resolve('babel.config.js'),
        filename: filePath,
    }).code;
}

const useDrawerPrizeLiveCode = transpileCode(
    path.resolve('src/pages/DrawerPrizeLiveClient/useDrawerPrizeLive.js')
);
const drawerPrizeLiveClientCode = transpileCode(
    path.resolve('src/pages/DrawerPrizeLiveClient/index.jsx')
);

/**
 * Creates an isolated harness around useDrawerPrizeLive.
 */
function createHookHarness({
    user = { email: 'client@test.com', rules: ['Client'] },
    draws = [],
    getAllResult = null,
    findByCodeResult = { error: false, data: { id: 'draw-1', name: 'Sorteio Camará' } },
    setParticipantResult = true,
    deleteResult = true,
    navigation = null,
} = {}) {
    let hookState = [];
    let hookRefs = [];
    let hookCallbacks = [];
    let focusEffect = null;
    let hookIndex = 0;
    let refIndex = 0;
    let callbackIndex = 0;
    let result = null;

    let inFlight = 0;
    let idleWaiters = [];

    function track(promise) {
        inFlight++;
        return Promise.resolve(promise).finally(() => {
            inFlight--;
            if (inFlight === 0) {
                const waiters = [...idleWaiters];
                idleWaiters = [];
                waiters.forEach((w) => w());
            }
        });
    }

    function waitForIdle() {
        return new Promise((resolve) => {
            if (inFlight === 0) {
                setImmediate(resolve);
            } else {
                idleWaiters.push(() => setImmediate(resolve));
            }
        });
    }

    const toastCalls = [];
    const navigationCalls = [];
    const animationCalls = [];
    const pendingTimers = [];

    const mockReact = {
        useState(initialValue) {
            const idx = hookIndex++;
            if (hookState.length <= idx) {
                hookState[idx] = typeof initialValue === 'function' ? initialValue() : initialValue;
            }
            const setter = (val) => {
                hookState[idx] = typeof val === 'function' ? val(hookState[idx]) : val;
                render();
            };
            return [hookState[idx], setter];
        },
        useRef(initialValue) {
            const idx = refIndex++;
            if (hookRefs.length <= idx) {
                hookRefs[idx] = { current: initialValue };
            }
            return hookRefs[idx];
        },
        useCallback(fn, deps) {
            const idx = callbackIndex++;
            if (hookCallbacks.length <= idx) {
                hookCallbacks[idx] = { fn, deps };
            } else {
                const prev = hookCallbacks[idx];
                const changed = !prev.deps || !deps || deps.some((d, i) => d !== prev.deps[i]);
                if (changed) hookCallbacks[idx] = { fn, deps };
            }
            return hookCallbacks[idx].fn;
        },
    };

    const mockAnimated = {
        Value: class {
            constructor(v) {
                this.value = v;
            }
            setValue(v) {
                this.value = v;
                animationCalls.push({ action: 'setValue', value: v });
            }
        },
        spring: (anim, config) => ({
            start: (cb) => {
                animationCalls.push({ action: 'spring', config });
                anim.setValue(config.toValue);
                if (cb) cb();
            },
        }),
    };

    const mockNavigation = navigation || {
        navigate: (route, params) => navigationCalls.push({ route, params }),
    };

    const mockToast = {
        show: (opts) => toastCalls.push(opts),
    };

    const mockControllers = {
        deleteDrawPrizeLiveById: (id) =>
            track(
                (async () => {
                    if (typeof deleteResult === 'function') return deleteResult(id);
                    return deleteResult;
                })()
            ),
        findDrawPrizeLiveByCode: (code, email) =>
            track(
                (async () => {
                    if (typeof findByCodeResult === 'function') return findByCodeResult(code, email);
                    return findByCodeResult;
                })()
            ),
        getAllDrawPrizesLiveWhereParticipant: (email, isAdmin) =>
            track(
                (async () => {
                    if (getAllResult) return getAllResult(email, isAdmin);
                    return { error: false, data: draws };
                })()
            ),
        setParticipantDrawPrizeLive: (id, email) =>
            track(
                (async () => {
                    if (typeof setParticipantResult === 'function') return setParticipantResult(id, email);
                    return setParticipantResult;
                })()
            ),
    };

    const mockStorage = {
        GetUserStorage: () =>
            track(
                (async () => {
                    return typeof user === 'function' ? user() : user;
                })()
            ),
    };

    const mockRoutes = {
        dataRoutes: {
            admin: {
                drawPrizeWinnerResult: 'Draw Prize Winner Result',
            },
        },
    };

    const mockNav = {
        useFocusEffect: (cb) => {
            focusEffect = cb;
        },
    };

    const mockSetTimeout = (fn, delay) => {
        const timer = { fn, delay };
        pendingTimers.push(timer);
        return timer;
    };

    const customRequire = (id) => {
        if (id === 'react') return mockReact;
        if (id === 'react-native') return { Animated: mockAnimated };
        if (id === 'react-native-toast-message') return mockToast;
        if (id === '@react-navigation/native') return mockNav;
        if (id.includes('DrawPrizes/live')) return mockControllers;
        if (id.includes('Storage/UserStorage')) return mockStorage;
        if (id.includes('routes/dataRoutes')) return mockRoutes;
        return require(id);
    };

    const exports = {};
    const module = { exports };
    const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', 'setTimeout', useDrawerPrizeLiveCode);
    fn(exports, customRequire, module, 'useDrawerPrizeLive.js', __dirname, mockSetTimeout);

    const hookFn = module.exports.useDrawerPrizeLive;

    function render() {
        hookIndex = 0;
        refIndex = 0;
        callbackIndex = 0;
        result = hookFn({ navigation: mockNavigation });
        return result;
    }

    // Initial render
    render();

    return {
        get result() {
            return result;
        },
        render,
        triggerFocus: async () => {
            if (focusEffect) focusEffect();
            await waitForIdle();
        },
        waitForIdle,
        runAllTimers: async () => {
            const timers = [...pendingTimers];
            pendingTimers.length = 0;
            for (const t of timers) {
                await t.fn();
            }
            await waitForIdle();
        },
        pendingTimers,
        toastCalls,
        navigationCalls,
        animationCalls,
        mockControllers,
    };
}

/**
 * Renders DrawerPrizeLiveClient with mocked useDrawerPrizeLive.
 */
function renderScreenComponent(mockHookData) {
    const mockTheme = {
        colors: {
            primary: '#007bff',
            green: '#28a745',
            red: '#dc3545',
            black: '#000',
            white: '#fff',
            lightGray: '#eee',
        },
        size: {
            fontSize: (s) => s,
            componentSize: (s) => s,
            dimentionsSize: (s) => s,
        },
    };

    const customRequire = (id) => {
        if (id === 'react') return require('react');
        if (id === 'react/jsx-runtime') return require('react/jsx-runtime');
        if (id === 'styled-components') return { useTheme: () => mockTheme };
        if (id === 'react-native-paper') return { ActivityIndicator: 'ActivityIndicator', Modal: 'Modal' };
        if (id === '@expo/vector-icons') return { Feather: 'Feather' };
        if (id === 'react-native') {
            return {
                Animated: { View: 'Animated.View' },
                View: 'View',
                TouchableOpacity: 'TouchableOpacity',
                Text: 'Text',
            };
        }
        if (id.includes('Dialog')) return { DialogComponent: 'DialogComponent' };
        if (id.includes('Input')) return { Input: 'Input' };
        if (id.includes('useDrawerPrizeLive')) return { useDrawerPrizeLive: () => mockHookData };
        if (id.includes('styles')) return new Proxy({}, { get: (_, prop) => prop });
        return require(id);
    };

    const exports = {};
    const module = { exports };
    const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', drawerPrizeLiveClientCode);
    fn(exports, customRequire, module, 'index.jsx', __dirname);
    return module.exports.DrawerPrizeLiveClient({ navigation: {} });
}

// ===========================================================================
// SECTION 1: useDrawerPrizeLive Hook - Initial States and Defaults
// ===========================================================================

test('useDrawerPrizeLive returns correct initial default states before network resolution', () => {
    const harness = createHookHarness();
    const state = harness.result;

    assert.strictEqual(state.loadingInitialData, true, 'loadingInitialData must start as true');
    assert.strictEqual(state.activeTab, 'ativos', 'activeTab must default to "ativos"');
    assert.strictEqual(state.dialogInputVisible, false, 'dialogInputVisible must default to false');
    assert.strictEqual(state.showAlertVisible, false, 'showAlertVisible must default to false');
    assert.strictEqual(state.itemValue, '', 'itemValue must default to empty string');
    assert.strictEqual(state.showSuccess, false, 'showSuccess must default to false');
    assert.strictEqual(state.scaleAnim.value, 1, 'scaleAnim initial value must be 1');
    assert.deepEqual(state.filteredDraws, [], 'filteredDraws must initially be empty');
});

test('useDrawerPrizeLive handles null user gracefully and defaults userRules to empty array', async () => {
    const harness = createHookHarness({ user: null });
    await harness.triggerFocus();

    assert.strictEqual(harness.result.dataUser, null);
    assert.deepEqual(harness.result.userRules, []);
    assert.strictEqual(harness.result.loadingInitialData, false);
});

test('useDrawerPrizeLive handles user with missing rules property', async () => {
    const harness = createHookHarness({ user: { email: 'norules@test.com' } });
    await harness.triggerFocus();

    assert.strictEqual(harness.result.dataUser.email, 'norules@test.com');
    assert.deepEqual(harness.result.userRules, []);
});

// ===========================================================================
// SECTION 2: useDrawerPrizeLive Hook - Network Calls & Initial Data Loading
// ===========================================================================

test('useDrawerPrizeLive loads initial draws for non-admin user passing isAdmin=false', async () => {
    let capturedArgs = null;
    const mockDraws = [
        { id: 'd1', name: 'Sorteio 1', status: true },
        { id: 'd2', name: 'Sorteio 2', status: false },
    ];

    const harness = createHookHarness({
        user: { email: 'client@test.com', rules: ['Client'] },
        draws: mockDraws,
        getAllResult: async (email, isAdmin) => {
            capturedArgs = { email, isAdmin };
            return { error: false, data: mockDraws };
        },
    });

    await harness.triggerFocus();

    assert.deepEqual(capturedArgs, { email: 'client@test.com', isAdmin: false });
    assert.strictEqual(harness.result.loadingInitialData, false);
    assert.strictEqual(harness.result.filteredDraws.length, 1, 'Only active draws appear in "ativos" tab');
    assert.strictEqual(harness.result.filteredDraws[0].id, 'd1');
});

test('useDrawerPrizeLive loads initial draws for admin user passing isAdmin=true', async () => {
    let capturedArgs = null;
    const harness = createHookHarness({
        user: { email: 'admin@test.com', rules: ['Admin'] },
        getAllResult: async (email, isAdmin) => {
            capturedArgs = { email, isAdmin };
            return { error: false, data: [{ id: 'admin-d1', status: true }] };
        },
    });

    await harness.triggerFocus();

    assert.deepEqual(capturedArgs, { email: 'admin@test.com', isAdmin: true });
    assert.ok(harness.result.userRules.includes('Admin'));
    assert.strictEqual(harness.result.loadingInitialData, false);
});

test('useDrawerPrizeLive shows error Toast when getAllDrawPrizesLive returns error for client', async () => {
    const harness = createHookHarness({
        user: { email: 'client@test.com', rules: ['Client'] },
        getAllResult: async () => ({ error: true, data: [] }),
    });

    await harness.triggerFocus();

    assert.strictEqual(harness.result.loadingInitialData, false);
    assert.strictEqual(harness.toastCalls.length, 1);
    assert.strictEqual(harness.toastCalls[0].type, 'error');
    assert.strictEqual(harness.toastCalls[0].text1, 'Você não possui sorteios ao vivo');
    assert.strictEqual(harness.toastCalls[0].text2, 'Participe de sorteios para visualizá-los aqui');
});

test('useDrawerPrizeLive shows admin-specific error Toast when getAllDrawPrizesLive returns error for admin', async () => {
    const harness = createHookHarness({
        user: { email: 'admin@test.com', rules: ['Admin'] },
        getAllResult: async () => ({ error: true, data: [] }),
    });

    await harness.triggerFocus();

    assert.strictEqual(harness.result.loadingInitialData, false);
    assert.strictEqual(harness.toastCalls.length, 1);
    assert.strictEqual(harness.toastCalls[0].type, 'error');
    assert.strictEqual(harness.toastCalls[0].text1, 'Não há sorteios a serem listados!');
    assert.strictEqual(harness.toastCalls[0].text2, 'Realize a criação de um sorteio ao vivo!');
});

// ===========================================================================
// SECTION 3: useDrawerPrizeLive Hook - Tab Switching & In-Memory Filtering
// ===========================================================================

test('useDrawerPrizeLive filters draws based on activeTab state ("ativos" vs "encerrados")', async () => {
    const mockDraws = [
        { id: '1', name: 'Ativo 1', status: true },
        { id: '2', name: 'Encerrado 1', status: false },
        { id: '3', name: 'Ativo 2', status: true },
        { id: '4', name: 'Encerrado 2', status: false },
    ];

    const harness = createHookHarness({ draws: mockDraws });
    await harness.triggerFocus();

    // Default tab is "ativos"
    assert.strictEqual(harness.result.activeTab, 'ativos');
    assert.strictEqual(harness.result.filteredDraws.length, 2);
    assert.deepEqual(
        harness.result.filteredDraws.map((d) => d.id),
        ['1', '3']
    );

    // Switch to "encerrados"
    harness.result.setActiveTab('encerrados');
    assert.strictEqual(harness.result.activeTab, 'encerrados');
    assert.strictEqual(harness.result.filteredDraws.length, 2);
    assert.deepEqual(
        harness.result.filteredDraws.map((d) => d.id),
        ['2', '4']
    );

    // Switch back to "ativos"
    harness.result.setActiveTab('ativos');
    assert.strictEqual(harness.result.activeTab, 'ativos');
    assert.strictEqual(harness.result.filteredDraws.length, 2);
    assert.deepEqual(
        harness.result.filteredDraws.map((d) => d.id),
        ['1', '3']
    );
});

// ===========================================================================
// SECTION 4: useDrawerPrizeLive Hook - Participation Flow & Animation
// ===========================================================================

test('handleParticipateDrawPriseLive shows error toast when code is empty', async () => {
    const harness = createHookHarness();
    await harness.triggerFocus();

    harness.result.setItemValue('');
    await harness.result.handleParticipateDrawPriseLive();

    assert.strictEqual(harness.toastCalls.length, 1);
    assert.strictEqual(harness.toastCalls[0].type, 'error');
    assert.strictEqual(harness.toastCalls[0].text1, 'Código inválido');
    assert.strictEqual(harness.toastCalls[0].text2, 'Informe o código do sorteio');
});

test('handleParticipateDrawPriseLive shows error toast when draw code is not found', async () => {
    const harness = createHookHarness({
        findByCodeResult: { error: true, data: null },
    });
    await harness.triggerFocus();

    harness.result.setDialogInputVisible(true);
    harness.result.setItemValue('INVALID_CODE');

    await harness.result.handleParticipateDrawPriseLive();

    assert.strictEqual(harness.toastCalls.length, 1);
    assert.strictEqual(harness.toastCalls[0].type, 'error');
    assert.strictEqual(harness.toastCalls[0].text1, 'Sorteio não encontrado');
    assert.strictEqual(harness.result.dialogInputVisible, false, 'Closes dialog on error');
    assert.strictEqual(harness.result.itemValue, '', 'Resets code input on error');
});

test('handleParticipateDrawPriseLive shows error toast when setParticipantDrawPrizeLive fails', async () => {
    const harness = createHookHarness({
        findByCodeResult: { error: false, data: { id: 'd-1', name: 'Camarão Fest' } },
        setParticipantResult: false, // Network failure adding participant
    });
    await harness.triggerFocus();

    harness.result.setDialogInputVisible(true);
    harness.result.setItemValue('CAMARAO10');

    await harness.result.handleParticipateDrawPriseLive();

    assert.strictEqual(harness.toastCalls.length, 1);
    assert.strictEqual(harness.toastCalls[0].type, 'error');
    assert.strictEqual(harness.toastCalls[0].text1, 'Erro ao participar do sorteio');
    assert.strictEqual(harness.toastCalls[0].text2, 'Tente novamente em instantes');
    assert.strictEqual(harness.result.dialogInputVisible, false);
    assert.strictEqual(harness.result.itemValue, '');
});

test('handleParticipateDrawPriseLive succeeds: triggers spring animation, reveals success state, then closes after 1800ms', async () => {
    let initialDataCalls = 0;
    const harness = createHookHarness({
        user: { email: 'vencedor@test.com', rules: [] },
        findByCodeResult: { error: false, data: { id: 'live-99', name: 'Grande Sorteio' } },
        setParticipantResult: true,
        getAllResult: async () => {
            initialDataCalls++;
            return { error: false, data: [{ id: 'live-99', name: 'Grande Sorteio', status: true }] };
        },
    });

    await harness.triggerFocus();
    assert.strictEqual(initialDataCalls, 1, 'Initial data fetched on mount');

    harness.result.setDialogInputVisible(true);
    harness.result.setItemValue('LIVE99');

    await harness.result.handleParticipateDrawPriseLive();

    // 1. Success state should be set immediately
    assert.strictEqual(harness.result.showSuccess, true, 'showSuccess should be true during celebration');

    // 2. Spring animation should be triggered
    const resetAnim = harness.animationCalls.find((c) => c.action === 'setValue' && c.value === 0);
    const springAnim = harness.animationCalls.find((c) => c.action === 'spring');
    assert.ok(resetAnim, 'scaleAnim should be reset to 0');
    assert.ok(springAnim, 'Animated.spring should be called');
    assert.strictEqual(springAnim.config.toValue, 1);
    assert.strictEqual(springAnim.config.friction, 3);
    assert.strictEqual(springAnim.config.tension, 150);
    assert.strictEqual(springAnim.config.useNativeDriver, true);

    // 3. Dialog should still be open before timer fires
    assert.strictEqual(harness.result.dialogInputVisible, true);
    assert.strictEqual(harness.pendingTimers.length, 1);
    assert.strictEqual(harness.pendingTimers[0].delay, 1800);

    // 4. Run the 1800ms timer
    await harness.runAllTimers();

    // 5. After timer: dialog closes, input resets, success Toast shown, initial data refreshed
    assert.strictEqual(harness.result.dialogInputVisible, false);
    assert.strictEqual(harness.result.itemValue, '');
    assert.strictEqual(harness.result.showSuccess, false);
    assert.strictEqual(initialDataCalls, 2, 'handleGetInitialData called again after success');

    const successToast = harness.toastCalls.find((t) => t.type === 'success');
    assert.ok(successToast);
    assert.strictEqual(successToast.text1, 'Você está participando do sorteio Grande Sorteio!');
    assert.strictEqual(successToast.text2, 'Boa sorte!');
});

test('handleParticipateDrawPriseLive uses fallback text when draw name is missing', async () => {
    const harness = createHookHarness({
        findByCodeResult: { error: false, data: { id: 'live-no-name' } },
        setParticipantResult: true,
    });
    await harness.triggerFocus();

    harness.result.setItemValue('NONAME');
    await harness.result.handleParticipateDrawPriseLive();
    await harness.runAllTimers();

    const successToast = harness.toastCalls.find((t) => t.type === 'success');
    assert.ok(successToast);
    assert.strictEqual(successToast.text1, 'Participação realizada com sucesso');
});

// ===========================================================================
// SECTION 5: useDrawerPrizeLive Hook - Delete Flow & Winners Navigation
// ===========================================================================

test('handleDeleteDrawPrizeLive deletes live draw successfully and refreshes list after 2000ms delay', async () => {
    let deletedId = null;
    let refreshCalls = 0;

    const harness = createHookHarness({
        deleteResult: async (id) => {
            deletedId = id;
            return true;
        },
        getAllResult: async () => {
            refreshCalls++;
            return { error: false, data: [] };
        },
    });
    await harness.triggerFocus();
    assert.strictEqual(refreshCalls, 1);

    harness.result.setDeleteDrawPrizeLiveId('target-draw-id');
    harness.result.setShowAlertVisible(true);

    await harness.result.handleDeleteDrawPrizeLive();

    assert.strictEqual(deletedId, 'target-draw-id');
    assert.strictEqual(harness.result.showAlertVisible, false, 'Alert dialog closed immediately');
    assert.strictEqual(harness.pendingTimers.length, 1);
    assert.strictEqual(harness.pendingTimers[0].delay, 2000);

    // Fire timer
    await harness.runAllTimers();
    assert.strictEqual(refreshCalls, 2, 'Refreshes draws list after 2000ms');
    assert.strictEqual(harness.result.loadingInitialData, false, 'loadingInitialData false after refresh');
});

test('handleDeleteDrawPrizeLive shows error toast when deleteDrawPrizeLiveById fails', async () => {
    const harness = createHookHarness({
        deleteResult: async () => false,
    });
    await harness.triggerFocus();

    harness.result.setDeleteDrawPrizeLiveId('fail-id');
    harness.result.setShowAlertVisible(true);

    await harness.result.handleDeleteDrawPrizeLive();

    assert.strictEqual(harness.result.showAlertVisible, false);
    const errorToast = harness.toastCalls.find((t) => t.type === 'error');
    assert.ok(errorToast);
    assert.strictEqual(errorToast.text1, 'Erro ao excluir sorteio');
    assert.strictEqual(errorToast.text2, 'Tente novamente em instantes');
});

test('handleShowWinners navigates to drawPrizeWinnerResult with correct params', () => {
    const harness = createHookHarness();
    harness.result.handleShowWinners('draw-xyz');

    assert.strictEqual(harness.navigationCalls.length, 1);
    assert.deepEqual(harness.navigationCalls[0], {
        route: 'Draw Prize Winner Result',
        params: {
            drawerPrizeLiveId: 'draw-xyz',
            showOnlyResults: false,
        },
    });
});

// ===========================================================================
// SECTION 6: DrawerPrizeLiveClient UI Component - Render & State Mapping
// ===========================================================================

test('DrawerPrizeLiveClient renders tabs and switches between "ativos" and "encerrados"', () => {
    let chosenTab = null;
    const element = renderScreenComponent({
        loadingInitialData: false,
        activeTab: 'ativos',
        setActiveTab: (t) => {
            chosenTab = t;
        },
        filteredDraws: [],
        dialogInputVisible: false,
        showAlertVisible: false,
        scaleAnim: { value: 1 },
    });

    const containerScreen = element.props.children[0];
    const tabSelector = containerScreen.props.children[0];
    const [tabAtivos, tabEncerrados] = tabSelector.props.children;

    assert.strictEqual(tabAtivos.props.children.props.children, 'Sorteios Atuais');
    assert.strictEqual(tabEncerrados.props.children.props.children, 'Encerrados');
    assert.strictEqual(tabAtivos.props.children.props.style.fontWeight, 'bold');
    assert.strictEqual(tabEncerrados.props.children.props.style.fontWeight, 'normal');

    tabEncerrados.props.onPress();
    assert.strictEqual(chosenTab, 'encerrados');

    tabAtivos.props.onPress();
    assert.strictEqual(chosenTab, 'ativos');
});

test('DrawerPrizeLiveClient renders ActivityIndicator when loadingInitialData is true', () => {
    const element = renderScreenComponent({
        loadingInitialData: true,
        activeTab: 'ativos',
        filteredDraws: [],
        dialogInputVisible: false,
        showAlertVisible: false,
        scaleAnim: { value: 1 },
    });

    const containerScreen = element.props.children[0];
    const indicator = containerScreen.props.children[1];
    assert.strictEqual(indicator.type, 'ActivityIndicator');
    assert.strictEqual(indicator.props.animating, true);
    assert.strictEqual(indicator.props.color, 'black');
    assert.strictEqual(indicator.props.size, 50);
});

test('DrawerPrizeLiveClient FlatList renders active card where user is already participating', () => {
    const userEmail = 'participant@test.com';
    const mockDraw = {
        id: 'd1',
        name: 'Sorteio Premium',
        status: true,
        participants: [userEmail],
        createdAt: { toDate: () => new Date('2026-09-10T15:00:00Z') },
    };

    const element = renderScreenComponent({
        loadingInitialData: false,
        activeTab: 'ativos',
        filteredDraws: [mockDraw],
        dataUser: { email: userEmail },
        userRules: ['Client'],
        dialogInputVisible: false,
        showAlertVisible: false,
        scaleAnim: { value: 1 },
    });

    const containerScreen = element.props.children[0];
    const [listContainer] = containerScreen.props.children[1].props.children;
    const flatList = listContainer.props.children;

    assert.strictEqual(flatList.props.data.length, 1);
    const card = flatList.props.renderItem({ item: mockDraw });

    // Header badge
    const header = card.props.children[0];
    const badge = header.props.children;
    assert.strictEqual(badge.props.status, true);
    assert.strictEqual(badge.props.children.props.children, 'Ativo');

    // Title
    const title = card.props.children[1];
    assert.strictEqual(title.props.children, 'Sorteio Premium');

    // Body: participating message
    const body = card.props.children[2];
    const participatingContent = body.props.children;
    assert.strictEqual(
        participatingContent.props.children.props.children,
        'Você já está participando deste sorteio'
    );
});

test('DrawerPrizeLiveClient FlatList renders active card where user is NOT yet participating', () => {
    const mockDraw = {
        id: 'd2',
        name: 'Sorteio Aberto',
        status: true,
        participants: ['other@test.com'],
        createdAt: { seconds: 1770000000 },
    };

    const element = renderScreenComponent({
        loadingInitialData: false,
        activeTab: 'ativos',
        filteredDraws: [mockDraw],
        dataUser: { email: 'client@test.com' },
        userRules: ['Client'],
        dialogInputVisible: false,
        showAlertVisible: false,
        scaleAnim: { value: 1 },
    });

    const containerScreen = element.props.children[0];
    const flatList = containerScreen.props.children[1].props.children[0].props.children;
    const card = flatList.props.renderItem({ item: mockDraw });

    const body = card.props.children[2];
    const participatingContent = body.props.children;
    assert.strictEqual(participatingContent.props.notParticipant, true);
    assert.strictEqual(
        participatingContent.props.children.props.children,
        'Clique em participar do sorteio e informe o código'
    );
});

test('DrawerPrizeLiveClient FlatList renders closed card with "Ver ganhadores" button', () => {
    let clickedDrawId = null;
    const mockDraw = {
        id: 'closed-99',
        name: 'Sorteio Finalizado',
        status: false,
        participants: [],
        createdAt: null,
    };

    const element = renderScreenComponent({
        loadingInitialData: false,
        activeTab: 'encerrados',
        filteredDraws: [mockDraw],
        handleShowWinners: (id) => {
            clickedDrawId = id;
        },
        userRules: ['Client'],
        dialogInputVisible: false,
        showAlertVisible: false,
        scaleAnim: { value: 1 },
    });

    const containerScreen = element.props.children[0];
    const flatList = containerScreen.props.children[1].props.children[0].props.children;
    const card = flatList.props.renderItem({ item: mockDraw });

    // Badge
    const badge = card.props.children[0].props.children;
    assert.strictEqual(badge.props.status, false);
    assert.strictEqual(badge.props.children.props.children, 'Encerrado');

    // Body: ButtonWinners
    const body = card.props.children[2];
    const buttonWinners = body.props.children;
    assert.strictEqual(buttonWinners.props.children.props.children, 'Ver ganhadores');

    buttonWinners.props.onPress();
    assert.strictEqual(clickedDrawId, 'closed-99');

    // Footer date fallback (index 2 is the fallback text '—')
    const footer = card.props.children[3];
    assert.strictEqual(footer.props.children.props.children[2], '—');
});

test('DrawerPrizeLiveClient renders admin delete button only when user has Admin rule', () => {
    let deleteClickedId = null;
    let alertOpened = false;

    const mockDraw = { id: 'admin-target', status: true };

    // 1. As Admin: button must be rendered
    const adminElement = renderScreenComponent({
        loadingInitialData: false,
        activeTab: 'ativos',
        filteredDraws: [mockDraw],
        userRules: ['Admin'],
        setDeleteDrawPrizeLiveId: (id) => {
            deleteClickedId = id;
        },
        setShowAlertVisible: (v) => {
            alertOpened = v;
        },
        dialogInputVisible: false,
        showAlertVisible: false,
        scaleAnim: { value: 1 },
    });

    const adminFlatList = adminElement.props.children[0].props.children[1].props.children[0].props.children;
    const adminCard = adminFlatList.props.renderItem({ item: mockDraw });
    const deleteActionContent = adminCard.props.children[4];

    assert.ok(deleteActionContent, 'Admin must see delete action container');
    const deleteButton = deleteActionContent.props.children;
    assert.strictEqual(deleteButton.props.children.props.children, 'Excluir Sorteio ao vivo');

    deleteButton.props.onPress();
    assert.strictEqual(deleteClickedId, 'admin-target');
    assert.strictEqual(alertOpened, true);

    // 2. As Regular Client: button must not be rendered
    const clientElement = renderScreenComponent({
        loadingInitialData: false,
        activeTab: 'ativos',
        filteredDraws: [mockDraw],
        userRules: ['Client'],
        dialogInputVisible: false,
        showAlertVisible: false,
        scaleAnim: { value: 1 },
    });

    const clientFlatList = clientElement.props.children[0].props.children[1].props.children[0].props.children;
    const clientCard = clientFlatList.props.renderItem({ item: mockDraw });
    assert.strictEqual(clientCard.props.children[4], false, 'Delete button omitted for regular user');
});

test('DrawerPrizeLiveClient CTA button triggers dialogInputVisible', () => {
    let dialogOpened = false;
    const element = renderScreenComponent({
        loadingInitialData: false,
        filteredDraws: [],
        setDialogInputVisible: (v) => {
            dialogOpened = v;
        },
        dialogInputVisible: false,
        showAlertVisible: false,
        scaleAnim: { value: 1 },
    });

    const [, buttonParticipate] = element.props.children[0].props.children[1].props.children;
    assert.strictEqual(buttonParticipate.props.children.props.children, 'Participar do sorteio ao vivo');

    buttonParticipate.props.onPress();
    assert.strictEqual(dialogOpened, true);
});

test('DrawerPrizeLiveClient renders participation Modal in normal input state (showSuccess=false)', () => {
    let cancelTriggered = false;
    let participateTriggered = false;
    let inputCaptured = null;

    const element = renderScreenComponent({
        loadingInitialData: false,
        filteredDraws: [],
        dialogInputVisible: true,
        showSuccess: false,
        itemValue: 'TESTCODE',
        setItemValue: (v) => {
            inputCaptured = v;
        },
        setDialogInputVisible: (v) => {
            if (!v) cancelTriggered = true;
        },
        handleParticipateDrawPriseLive: () => {
            participateTriggered = true;
        },
        scaleAnim: { value: 1 },
        showAlertVisible: false,
    });

    const modal = element.props.children[0].props.children[1].props.children[2];
    assert.strictEqual(modal.props.visible, true);

    const modalContent = modal.props.children;
    const [, animView, formFragment] = modalContent.props.children;

    // Badge icon: gift
    const featherIcon = animView.props.children.props.children;
    assert.strictEqual(featherIcon.props.name, 'gift');

    // Form: Title and SubTitle
    const [titleModal, subTitleModal, input, actions] = formFragment.props.children;
    assert.strictEqual(titleModal.props.children, 'Informe o código do sorteio');
    assert.strictEqual(
        subTitleModal.props.children,
        'Digite o código informado pelo produtor para participar do sorteio ao vivo'
    );

    // Input props
    assert.strictEqual(input.props.label, 'Código do sorteio');
    assert.strictEqual(input.props.icon, 'hash');
    assert.strictEqual(input.props.value, 'TESTCODE');
    assert.strictEqual(input.props.autoCapitalize, 'characters');
    input.props.onChange('NEWCODE');
    assert.strictEqual(inputCaptured, 'NEWCODE');

    // Actions
    const [cancelBtn, confirmBtn] = actions.props.children;
    cancelBtn.props.onPress();
    assert.strictEqual(cancelTriggered, true);

    confirmBtn.props.onPress();
    assert.strictEqual(participateTriggered, true);
});

test('DrawerPrizeLiveClient renders participation Modal in celebration state (showSuccess=true)', () => {
    const element = renderScreenComponent({
        loadingInitialData: false,
        filteredDraws: [],
        dialogInputVisible: true,
        showSuccess: true,
        scaleAnim: { value: 1 },
        showAlertVisible: false,
    });

    const modal = element.props.children[0].props.children[1].props.children[2];
    const modalContent = modal.props.children;
    const [, animView, successFragment] = modalContent.props.children;

    // Badge icon: check-circle with success styling
    const badge = animView.props.children;
    assert.strictEqual(badge.props.success, true);
    assert.strictEqual(badge.props.children.props.name, 'check-circle');

    // Success text
    const [titleModal, subTitleModal] = successFragment.props.children;
    assert.strictEqual(titleModal.props.children, 'Você está participando!');
    assert.strictEqual(subTitleModal.props.children, 'Boa sorte no sorteio 🎉');
});

test('DrawerPrizeLiveClient renders delete DialogComponent with confirmation actions', () => {
    let hideDialogCalled = false;
    let deleteActionCalled = false;

    const element = renderScreenComponent({
        loadingInitialData: false,
        filteredDraws: [],
        dialogInputVisible: false,
        showAlertVisible: true,
        setShowAlertVisible: (v) => {
            if (!v) hideDialogCalled = true;
        },
        handleDeleteDrawPrizeLive: () => {
            deleteActionCalled = true;
        },
        scaleAnim: { value: 1 },
    });

    const dialog = element.props.children[1];
    assert.strictEqual(dialog.props.visible, true);
    assert.strictEqual(dialog.props.title, 'Excluir Sorteio?');
    assert.strictEqual(dialog.props.text, 'Deseja excluir este sorteio ao vivo?');
    assert.strictEqual(dialog.props.textActionButton, 'Excluir Sorteio');

    dialog.props.hideDialog();
    assert.strictEqual(hideDialogCalled, true);

    dialog.props.actionButton();
    assert.strictEqual(deleteActionCalled, true);
});
