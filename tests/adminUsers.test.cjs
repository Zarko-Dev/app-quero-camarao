'use strict';

const nodeTest = typeof jest === 'undefined' ? require('node:test') : null;
const test = typeof jest === 'undefined' ? nodeTest.test : global.test;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const babel = require('@babel/core');

// ---------------------------------------------------------------------------
// 1. Transpile Modules via Babel
// ---------------------------------------------------------------------------

function transpileCode(filePath) {
    const rawCode = fs.readFileSync(filePath, 'utf8');
    return babel.transformSync(rawCode, {
        configFile: path.resolve('babel.config.js'),
        filename: filePath,
    }).code;
}

const useUsersCode = transpileCode(
    path.resolve('src/pages/Admin/Users/useUsers.js')
);
const usersScreenCode = transpileCode(
    path.resolve('src/pages/Admin/Users/index.jsx')
);

// ---------------------------------------------------------------------------
// 2. Load Direct Exports from useUsers.js
// ---------------------------------------------------------------------------

function loadUseUsersModule() {
    const mockToast = { show: () => {} };
    const toastExport = {
        __esModule: true,
        default: mockToast,
        show: mockToast.show,
    };

    const customRequire = (id) => {
        if (id === 'react') return { useState: (v) => [v, () => {}], useEffect: () => {} };
        if (id === 'react-native-toast-message') return toastExport;
        if (id.includes('getAll')) return { getAllUsers: async () => [] };
        if (id.includes('dataRoutes')) {
            return {
                dataRoutes: {
                    admin: {
                        usersList: 'AdminUsersList',
                        userProductorClientList: 'AdminUserProductorClientList',
                    },
                },
            };
        }
        return require(id);
    };

    const exports = {};
    const module = { exports };
    const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', useUsersCode);
    fn(exports, customRequire, module, 'useUsers.js', __dirname);
    return module.exports;
}

const {
    normalizeLabel,
    compareLabels,
    groupUsersWithStateCity,
    withTimeout,
    wait,
    executeWithRetry,
} = loadUseUsersModule();

// ---------------------------------------------------------------------------
// 3. Harness to Test useUsers Hook
// ---------------------------------------------------------------------------

function createHookHarness({
    getAllUsersResult = null,
    navigation = null,
} = {}) {
    const hookState = [];
    let effectCallbacks = [];
    let hookIndex = 0;
    let result = null;

    const toastCalls = [];
    const navigationCalls = [];

    const mockToast = {
        show: (payload) => {
            toastCalls.push(payload);
        },
    };
    const toastExport = {
        __esModule: true,
        default: mockToast,
        show: (payload) => mockToast.show(payload),
    };

    const mockNav = navigation || {
        navigate: (route, params) => {
            navigationCalls.push({ route, params });
        },
    };

    const mockGetAllUsers = async () => {
        if (typeof getAllUsersResult === 'function') {
            return getAllUsersResult();
        }
        if (getAllUsersResult !== null) {
            return getAllUsersResult;
        }
        return [];
    };

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
        useEffect(fn) {
            effectCallbacks.push(fn);
        },
    };

    const customRequire = (id) => {
        if (id === 'react') return mockReact;
        if (id === 'react-native-toast-message') return toastExport;
        if (id.includes('getAll')) return { getAllUsers: mockGetAllUsers };
        if (id.includes('dataRoutes')) {
            return {
                dataRoutes: {
                    admin: {
                        usersList: 'AdminUsersList',
                        userProductorClientList: 'AdminUserProductorClientList',
                    },
                },
            };
        }
        return require(id);
    };

    // Fast timer for tests
    const fastSetTimeout = (fn) => setTimeout(fn, 1);

    const exports = {};
    const module = { exports };
    const fn = new Function(
        'exports',
        'require',
        'module',
        '__filename',
        '__dirname',
        'setTimeout',
        useUsersCode
    );
    fn(exports, customRequire, module, 'useUsers.js', __dirname, fastSetTimeout);

    function render() {
        hookIndex = 0;
        result = module.exports.useUsers({ navigation: mockNav });
    }

    // Initial render
    render();

    // Trigger mount effects
    const registered = [...effectCallbacks];
    effectCallbacks = [];
    for (const cb of registered) {
        cb();
    }

    async function waitForLoaded(maxWaitMs = 3000) {
        const start = Date.now();
        while (result && result.isLoading) {
            if (Date.now() - start > maxWaitMs) {
                throw new Error('Timeout waiting for useUsers hook to finish loading');
            }
            await new Promise((res) => setTimeout(res, 5));
        }
        // Brief settle for react state propagation
        await new Promise((res) => setImmediate(res));
    }

    return {
        get result() {
            return result;
        },
        render,
        waitForLoaded,
        toastCalls,
        navigationCalls,
        exports: module.exports,
    };
}

// ---------------------------------------------------------------------------
// 4. Component Render Helper
// ---------------------------------------------------------------------------

function renderScreenComponent(mockHookData) {
    const mockTheme = {
        colors: {
            primary: '#007bff',
            quaternary: '#f0f0f0',
            black: '#000',
            white: '#fff',
        },
        size: {
            fontSize: (s) => `${s}px`,
            componentSize: (s) => `${s}px`,
            dimentionsSize: (s) => `${s}px`,
        },
    };

    const customRequire = (id) => {
        if (id === 'react') return require('react');
        if (id === 'react/jsx-runtime') return require('react/jsx-runtime');
        if (id === 'styled-components') return { useTheme: () => mockTheme };
        if (id === 'react-native-paper') return { ActivityIndicator: 'ActivityIndicator' };
        if (id === '@expo/vector-icons') return { Feather: 'Feather' };
        if (id === 'react-native') {
            return {
                View: 'View',
                Text: 'Text',
                TouchableOpacity: 'TouchableOpacity',
                ScrollView: 'ScrollView',
            };
        }
        if (id.includes('useUsers')) return { useUsers: () => mockHookData };
        if (id.includes('UserDivideList')) return { UserDivideList: 'UserDivideList' };
        if (id.includes('IosShadow')) return { BoxShadowIos: {} };
        if (id.includes('styles')) return new Proxy({}, { get: (_, prop) => prop });
        return require(id);
    };

    const exports = {};
    const module = { exports };
    const fn = new Function(
        'exports',
        'require',
        'module',
        '__filename',
        '__dirname',
        usersScreenCode
    );
    fn(exports, customRequire, module, 'index.jsx', __dirname);
    return module.exports.Users({ navigation: {} });
}

// ===========================================================================
// TEST SUITE 1: normalizeLabel & compareLabels
// ===========================================================================

test('normalizeLabel: trims valid string labels', () => {
    assert.strictEqual(normalizeLabel('  Ceará  '), 'Ceará');
    assert.strictEqual(normalizeLabel('Fortaleza'), 'Fortaleza');
});

test('normalizeLabel: returns "Não Identificado" for empty, null, undefined or whitespace', () => {
    assert.strictEqual(normalizeLabel(null), 'Não Identificado');
    assert.strictEqual(normalizeLabel(undefined), 'Não Identificado');
    assert.strictEqual(normalizeLabel(''), 'Não Identificado');
    assert.strictEqual(normalizeLabel('   '), 'Não Identificado');
});

test('compareLabels: places "Não Identificado" after standard labels', () => {
    assert.strictEqual(compareLabels('Não Identificado', 'Ceará'), 1);
    assert.strictEqual(compareLabels('Ceará', 'Não Identificado'), -1);
    assert.strictEqual(compareLabels('Não Identificado', 'Não Identificado'), 0);
});

test('compareLabels: compares two valid labels alphabetically', () => {
    assert.strictEqual(compareLabels('Bahia', 'Ceará') < 0, true);
    assert.strictEqual(compareLabels('Pernambuco', 'Alagoas') > 0, true);
    assert.strictEqual(compareLabels('Ceará', 'Ceará'), 0);
});

// ===========================================================================
// TEST SUITE 2: groupUsersWithStateCity (Address bug fix verification)
// ===========================================================================

test('groupUsersWithStateCity: handles users with complete address', () => {
    const users = [
        { id: '1', name: 'User 1', address: { state: 'CE', city: 'Fortaleza' } },
        { id: '2', name: 'User 2', address: { state: 'CE', city: 'Sobral' } },
        { id: '3', name: 'User 3', address: { state: 'RN', city: 'Natal' } },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 2);
    assert.strictEqual(grouped[0].state, 'CE');
    assert.strictEqual(grouped[0].count, 2);
    assert.strictEqual(grouped[0].data.length, 2);
    assert.strictEqual(grouped[0].data[0].city, 'Fortaleza');
    assert.strictEqual(grouped[0].data[1].city, 'Sobral');

    assert.strictEqual(grouped[1].state, 'RN');
    assert.strictEqual(grouped[1].count, 1);
    assert.strictEqual(grouped[1].data[0].city, 'Natal');
});

test('groupUsersWithStateCity: handles user.address without state or city (empty address object)', () => {
    const users = [
        { id: '1', name: 'Sem Endereço Completo', address: {} },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 1);
    assert.strictEqual(grouped[0].state, 'Não Identificado');
    assert.strictEqual(grouped[0].count, 1);
    assert.strictEqual(grouped[0].data.length, 1);
    assert.strictEqual(grouped[0].data[0].city, 'Não Identificado');
    assert.strictEqual(grouped[0].data[0].count, 1);
    assert.strictEqual(grouped[0].data[0].dataUser[0].name, 'Sem Endereço Completo');
});

test('groupUsersWithStateCity: handles user.address with cep only (no state and no city)', () => {
    const users = [
        { id: '1', name: 'Apenas CEP', address: { cep: '60873-652' } },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 1);
    assert.strictEqual(grouped[0].state, 'Não Identificado');
    assert.strictEqual(grouped[0].data[0].city, 'Não Identificado');
    assert.strictEqual(grouped[0].data[0].dataUser[0].id, '1');
});

test('groupUsersWithStateCity: handles user.address lacking state but having city', () => {
    const users = [
        { id: '1', name: 'Apenas Cidade', address: { city: 'Fortaleza' } },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 1);
    assert.strictEqual(grouped[0].state, 'Não Identificado');
    assert.strictEqual(grouped[0].data[0].city, 'Fortaleza');
    assert.strictEqual(grouped[0].data[0].count, 1);
});

test('groupUsersWithStateCity: handles user.address lacking city but having state', () => {
    const users = [
        { id: '1', name: 'Apenas Estado', address: { state: 'CE' } },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 1);
    assert.strictEqual(grouped[0].state, 'CE');
    assert.strictEqual(grouped[0].data[0].city, 'Não Identificado');
    assert.strictEqual(grouped[0].data[0].count, 1);
});

test('groupUsersWithStateCity: handles user with missing address property (undefined)', () => {
    const users = [
        { id: '1', name: 'Sem Campo Address' },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 1);
    assert.strictEqual(grouped[0].state, 'Não Identificado');
    assert.strictEqual(grouped[0].data[0].city, 'Não Identificado');
    assert.strictEqual(grouped[0].data[0].count, 1);
});

test('groupUsersWithStateCity: handles user with address having null/undefined/empty string properties', () => {
    const users = [
        { id: '1', name: 'Null Values', address: { state: null, city: null } },
        { id: '2', name: 'Empty String Values', address: { state: '', city: '' } },
        { id: '3', name: 'Whitespace Values', address: { state: '   ', city: '   ' } },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 1);
    assert.strictEqual(grouped[0].state, 'Não Identificado');
    assert.strictEqual(grouped[0].count, 3);
    assert.strictEqual(grouped[0].data[0].city, 'Não Identificado');
    assert.strictEqual(grouped[0].data[0].count, 3);
});

test('groupUsersWithStateCity: falls back to top-level user.state and user.city when address missing', () => {
    const users = [
        { id: '1', name: 'Flat Props', state: 'PI', city: 'Teresina' },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 1);
    assert.strictEqual(grouped[0].state, 'PI');
    assert.strictEqual(grouped[0].data[0].city, 'Teresina');
});

test('groupUsersWithStateCity: falls back to flat props when address exists but has no state/city', () => {
    const users = [
        { id: '1', name: 'Mixed Fallback', address: { cep: '64000-000' }, state: 'PI', city: 'Parnaíba' },
    ];

    const grouped = groupUsersWithStateCity(users);

    assert.strictEqual(grouped.length, 1);
    assert.strictEqual(grouped[0].state, 'PI');
    assert.strictEqual(grouped[0].data[0].city, 'Parnaíba');
});

test('groupUsersWithStateCity: sorts states alphabetically and always places "Não Identificado" last', () => {
    const users = [
        { name: 'Unknown', address: {} },
        { name: 'RN User', address: { state: 'RN', city: 'Natal' } },
        { name: 'BA User', address: { state: 'BA', city: 'Salvador' } },
        { name: 'CE User', address: { state: 'CE', city: 'Fortaleza' } },
    ];

    const grouped = groupUsersWithStateCity(users);

    const states = grouped.map((g) => g.state);
    assert.deepEqual(states, ['BA', 'CE', 'RN', 'Não Identificado']);
});

test('groupUsersWithStateCity: sorts cities alphabetically inside state and places "Não Identificado" last', () => {
    const users = [
        { name: 'Unknown City', address: { state: 'CE' } },
        { name: 'Sobral User', address: { state: 'CE', city: 'Sobral' } },
        { name: 'Caucaia User', address: { state: 'CE', city: 'Caucaia' } },
        { name: 'Fortaleza User', address: { state: 'CE', city: 'Fortaleza' } },
    ];

    const grouped = groupUsersWithStateCity(users);
    const ce = grouped.find((g) => g.state === 'CE');

    assert.ok(ce);
    const cities = ce.data.map((c) => c.city);
    assert.deepEqual(cities, ['Caucaia', 'Fortaleza', 'Sobral', 'Não Identificado']);
});

test('groupUsersWithStateCity: handles empty array, null, or undefined input gracefully', () => {
    assert.deepEqual(groupUsersWithStateCity([]), []);
    assert.deepEqual(groupUsersWithStateCity(null), []);
    assert.deepEqual(groupUsersWithStateCity(undefined), []);
});

test('groupUsersWithStateCity: preserves complete user object in dataUser', () => {
    const sampleUser = {
        id: 'u-99',
        name: 'Camarão Silva',
        email: 'camarao@test.com',
        userType: 'productor',
        address: { state: 'CE', city: 'Acaraú' },
    };

    const grouped = groupUsersWithStateCity([sampleUser]);
    assert.strictEqual(grouped[0].data[0].dataUser[0], sampleUser);
});

// ===========================================================================
// TEST SUITE 3: withTimeout, wait & executeWithRetry
// ===========================================================================

test('withTimeout: resolves when promise finishes before timeout', async () => {
    const result = await withTimeout(Promise.resolve('OK'), 1000);
    assert.strictEqual(result, 'OK');
});

test('withTimeout: rejects with ADMIN_USERS_TIMEOUT when timeout expires', async () => {
    await assert.rejects(
        () => withTimeout(new Promise((res) => setTimeout(res, 50)), 10),
        { message: 'ADMIN_USERS_TIMEOUT' }
    );
});

test('wait: resolves after requested milliseconds', async () => {
    const start = Date.now();
    await wait(20);
    assert.strictEqual(Date.now() - start >= 15, true);
});

test('executeWithRetry: resolves on first attempt when request succeeds', async () => {
    let calls = 0;
    const result = await executeWithRetry(async () => {
        calls++;
        return 'SUCCESS';
    }, 2, 0);

    assert.strictEqual(result, 'SUCCESS');
    assert.strictEqual(calls, 1);
});

test('executeWithRetry: retries and succeeds on subsequent attempt', async () => {
    let calls = 0;
    const result = await executeWithRetry(async () => {
        calls++;
        if (calls === 1) throw new Error('TEMPORARY_NETWORK_FAILURE');
        return 'RETRY_SUCCESS';
    }, 1, 0);

    assert.strictEqual(result, 'RETRY_SUCCESS');
    assert.strictEqual(calls, 2);
});

test('executeWithRetry: throws error when retries are exhausted', async () => {
    let calls = 0;
    await assert.rejects(
        () =>
            executeWithRetry(async () => {
                calls++;
                throw new Error('PERSISTENT_ERROR');
            }, 1, 0),
        { message: 'PERSISTENT_ERROR' }
    );

    assert.strictEqual(calls, 2);
});

// ===========================================================================
// TEST SUITE 4: useUsers Hook
// ===========================================================================

test('useUsers: starts with isLoading true on initial mount', () => {
    const harness = createHookHarness({
        getAllUsersResult: new Promise(() => {}), // never resolves
    });

    assert.strictEqual(harness.result.isLoading, true);
    assert.deepEqual(harness.result.listUsers, []);
    assert.deepEqual(harness.result.dataUsers, []);
});

test('useUsers: successfully loads users, sets listUsers and groups dataUsers', async () => {
    const mockUsers = [
        { id: '1', name: 'Produtor 1', userType: 'productor', address: { state: 'CE', city: 'Fortaleza' } },
        { id: '2', name: 'Cliente 1', userType: 'client', address: { state: 'CE', city: 'Fortaleza' } },
        { id: '3', name: 'Cliente 2', userType: 'client', address: {} },
    ];

    const harness = createHookHarness({
        getAllUsersResult: async () => mockUsers,
    });

    await harness.waitForLoaded();

    assert.strictEqual(harness.result.isLoading, false);
    assert.strictEqual(harness.result.listUsers.length, 3);
    assert.strictEqual(harness.result.dataUsers.length, 2);

    const ceState = harness.result.dataUsers.find((d) => d.state === 'CE');
    assert.ok(ceState);
    assert.strictEqual(ceState.count, 2);

    const unknownState = harness.result.dataUsers.find((d) => d.state === 'Não Identificado');
    assert.ok(unknownState);
    assert.strictEqual(unknownState.count, 1);
});

test('useUsers: shows info Toast when getAllUsers returns empty array', async () => {
    const harness = createHookHarness({
        getAllUsersResult: async () => [],
    });

    await harness.waitForLoaded();

    assert.strictEqual(harness.result.isLoading, false);
    assert.strictEqual(harness.result.listUsers.length, 0);
    assert.strictEqual(harness.result.dataUsers.length, 0);

    assert.strictEqual(harness.toastCalls.length, 1);
    assert.strictEqual(harness.toastCalls[0].type, 'info');
    assert.strictEqual(harness.toastCalls[0].text1, 'Nenhum usuário encontrado');
});

test('useUsers: shows error Toast on ADMIN_USERS_TIMEOUT', async () => {
    const harness = createHookHarness({
        getAllUsersResult: async () => {
            throw new Error('ADMIN_USERS_TIMEOUT');
        },
    });

    await harness.waitForLoaded();

    assert.strictEqual(harness.result.isLoading, false);
    assert.strictEqual(harness.toastCalls.length, 1);
    assert.strictEqual(harness.toastCalls[0].type, 'error');
    assert.strictEqual(harness.toastCalls[0].text1, 'Erro ao carregar usuários');
    assert.strictEqual(harness.toastCalls[0].text2, 'Tempo limite da consulta.');
});

test('useUsers: shows generic error Toast on general failure', async () => {
    const harness = createHookHarness({
        getAllUsersResult: async () => {
            throw new Error('FIRESTORE_INTERNAL_ERROR');
        },
    });

    await harness.waitForLoaded();

    assert.strictEqual(harness.result.isLoading, false);
    assert.strictEqual(harness.toastCalls.length, 1);
    assert.strictEqual(harness.toastCalls[0].type, 'error');
    assert.strictEqual(harness.toastCalls[0].text1, 'Erro ao carregar usuários');
    assert.strictEqual(harness.toastCalls[0].text2, 'Falha ao buscar dados.');
});

test('useUsers: handleRedirectListUsers navigates with list of users', async () => {
    const harness = createHookHarness({
        getAllUsersResult: async () => [],
    });
    await harness.waitForLoaded();

    const users = [{ id: 'u1' }, { id: 'u2' }];
    harness.result.handleRedirectListUsers(users);

    assert.strictEqual(harness.navigationCalls.length, 1);
    assert.strictEqual(harness.navigationCalls[0].route, 'AdminUsersList');
    assert.deepEqual(harness.navigationCalls[0].params, { dataListUsers: users });
});

test('useUsers: handleRedirectProductorClientList navigates with grouped dataUsers', async () => {
    const harness = createHookHarness({
        getAllUsersResult: async () => [],
    });
    await harness.waitForLoaded();

    const users = [
        { id: 'u1', address: { state: 'CE', city: 'Fortaleza' } },
        { id: 'u2', address: {} },
    ];

    harness.result.handleRedirectProductorClientList(users);

    assert.strictEqual(harness.navigationCalls.length, 1);
    assert.strictEqual(harness.navigationCalls[0].route, 'AdminUserProductorClientList');
    assert.strictEqual(harness.navigationCalls[0].params.dataUsers.length, 2);
    assert.strictEqual(harness.navigationCalls[0].params.dataUsers[0].state, 'CE');
    assert.strictEqual(harness.navigationCalls[0].params.dataUsers[1].state, 'Não Identificado');
});

test('useUsers: getUsersByUserType filters correctly and handles empty lists', async () => {
    const harness = createHookHarness({
        getAllUsersResult: async () => [],
    });
    await harness.waitForLoaded();

    const users = [
        { id: '1', userType: 'productor' },
        { id: '2', userType: 'client' },
        { id: '3', userType: 'productor' },
    ];

    const producers = harness.result.getUsersByUserType(users, 'productor');
    const clients = harness.result.getUsersByUserType(users, 'client');

    assert.strictEqual(producers.length, 2);
    assert.strictEqual(clients.length, 1);
    assert.deepEqual(harness.result.getUsersByUserType([], 'productor'), []);
    assert.deepEqual(harness.result.getUsersByUserType(null, 'client'), []);
});

test('useUsers: returns groupUsersWithStateCity function in hook return object', async () => {
    const harness = createHookHarness({
        getAllUsersResult: async () => [],
    });
    await harness.waitForLoaded();

    assert.strictEqual(typeof harness.result.groupUsersWithStateCity, 'function');
});

// ===========================================================================
// TEST SUITE 5: Users Screen Component UI & Glow-up Verification
// ===========================================================================

test('Users Component: renders ActivityIndicator when isLoading is true', () => {
    const element = renderScreenComponent({
        isLoading: true,
        listUsers: [],
        dataUsers: [],
        handleRedirectListUsers: () => {},
        handleRedirectProductorClientList: () => {},
        getUsersByUserType: () => [],
    });

    assert.strictEqual(element.type, 'Container');
    const contentLoading = element.props.children;
    assert.strictEqual(contentLoading.type, 'ContentLoading');

    const activityIndicator = contentLoading.props.children;
    assert.strictEqual(activityIndicator.type, 'ActivityIndicator');
    assert.strictEqual(activityIndicator.props.animating, true);
    assert.strictEqual(activityIndicator.props.color, '#007bff');
    assert.strictEqual(activityIndicator.props.size, 50);
});

test('Users Component: renders full dashboard content when isLoading is false', () => {
    const mockUsers = [
        { id: '1', userType: 'productor' },
        { id: '2', userType: 'client' },
        { id: '3', userType: 'client' },
    ];
    const mockDataUsers = [
        { state: 'CE', count: 3, data: [{ city: 'Fortaleza', count: 3, dataUser: mockUsers }] },
    ];

    let redirectedToList = null;
    let redirectedToProductorClient = null;

    const element = renderScreenComponent({
        isLoading: false,
        listUsers: mockUsers,
        dataUsers: mockDataUsers,
        handleRedirectListUsers: (users) => {
            redirectedToList = users;
        },
        handleRedirectProductorClientList: (users) => {
            redirectedToProductorClient = users;
        },
        getUsersByUserType: (users, type) => users.filter((u) => u.userType === type),
    });

    const content = element.props.children;
    assert.strictEqual(content.type, 'Content');

    // 1. Header Title & Subtitle
    const headerView = content.props.children[0];
    const titleText = headerView.props.children[0];
    const subtitleText = headerView.props.children[1];
    assert.strictEqual(titleText.props.children, 'Dashboard de Usuários');
    assert.strictEqual(subtitleText.props.children, 'Gerencie toda a rede da plataforma');

    // 2. Card: Total da Base
    const totalCard = content.props.children[1];
    assert.strictEqual(totalCard.type, 'CardCountUser');
    const totalRow = totalCard.props.children;
    const totalInfoCol = totalRow.props.children[0];
    const totalTitle = totalInfoCol.props.children[0];
    const totalCount = totalInfoCol.props.children[1];
    const totalIcon = totalRow.props.children[1];

    assert.strictEqual(totalTitle.props.children, 'Total da Base');
    assert.strictEqual(totalCount.props.children, 3);
    assert.strictEqual(totalIcon.props.name, 'users');

    // 3. Cards: Produtores and Clientes
    const typeCardsRow = content.props.children[2];
    assert.strictEqual(typeCardsRow.type, 'ContentCardTypeUserCount');
    const [prodCard, clientCard] = typeCardsRow.props.children;

    // Produtores Card
    assert.strictEqual(prodCard.type, 'CardCountUserUserType');
    const prodIcon = prodCard.props.children[0].props.children;
    const prodTitle = prodCard.props.children[1];
    const prodCount = prodCard.props.children[2];
    assert.strictEqual(prodIcon.props.name, 'anchor');
    assert.strictEqual(prodTitle.props.children, 'Produtores');
    assert.strictEqual(prodCount.props.children, 1);

    prodCard.props.onPress();
    assert.strictEqual(redirectedToProductorClient.length, 1);

    // Clientes Card
    assert.strictEqual(clientCard.type, 'CardCountUserUserType');
    const clientIcon = clientCard.props.children[0].props.children;
    const clientTitle = clientCard.props.children[1];
    const clientCount = clientCard.props.children[2];
    assert.strictEqual(clientIcon.props.name, 'shopping-bag');
    assert.strictEqual(clientTitle.props.children, 'Clientes');
    assert.strictEqual(clientCount.props.children, 2);

    clientCard.props.onPress();
    assert.strictEqual(redirectedToProductorClient.length, 2);

    // 4. Button: Visualizar Lista Completa
    const buttonList = content.props.children[3];
    assert.strictEqual(buttonList.type, 'ButtonListUsers');
    const buttonTitle = buttonList.props.children;
    assert.strictEqual(buttonTitle.props.children, 'Visualizar Lista Completa');

    buttonList.props.onPress();
    assert.strictEqual(redirectedToList, mockUsers);

    // 5. Region Distribution Section Header
    const regionSectionHeader = content.props.children[4];
    const mapPinIcon = regionSectionHeader.props.children[0];
    const regionTitle = regionSectionHeader.props.children[1];
    assert.strictEqual(mapPinIcon.props.name, 'map-pin');
    assert.strictEqual(regionTitle.props.children, 'Distribuição por Região');

    // 6. UserDivideList for each state
    const regionLists = content.props.children[5];
    assert.strictEqual(regionLists.length, 1);
    const userDivideWrapper = regionLists[0];
    const userDivideComponent = userDivideWrapper.props.children;
    assert.strictEqual(userDivideComponent.type, 'UserDivideList');
    assert.strictEqual(userDivideComponent.props.listUsers, mockDataUsers[0]);
    assert.strictEqual(typeof userDivideComponent.props.redirectAction, 'function');
});
