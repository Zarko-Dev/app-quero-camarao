'use strict';
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Reproduces the race condition in DrawPrizeLive's useFocusEffect.
//
// Scenario: admin returns from DrawPrizeWinnersResult → screen regains focus →
// useFocusEffect starts async fetch → admin clicks '+' (handleCreateNewDraw sets
// isCreatingNewDraw.current=true and clears state) → BUT the ongoing async
// already passed the first guard → fetch completes → state is restored → UI
// snaps back to "Sorteio Ativo" loop.
//
// Fix: add a second guard AFTER the await inside the async function.

const createFetchSimulator = ({ secondGuard }) => {
    const ctx = { isCreating: false, stateRestored: false };

    const fetch = async () => {
        // First guard (already existed)
        if (ctx.isCreating) return;

        // Simulate async Firestore fetch
        await new Promise((r) => setImmediate(r));

        // Second guard (the fix)
        if (secondGuard && ctx.isCreating) return;

        ctx.stateRestored = true; // simulates setDrawerCodeFixed(...)
    };

    return { ctx, fetch };
};

describe('DrawPrizeLive isCreatingNewDraw guard — race condition', () => {
    test('without second guard: completed fetch restores state even after handleCreateNewDraw', async () => {
        const { ctx, fetch } = createFetchSimulator({ secondGuard: false });

        // Fetch starts, first guard passes (isCreating=false at this point)
        const inflight = fetch();

        // User clicks '+' mid-flight
        ctx.isCreating = true;

        await inflight;

        // BUG: state is restored despite the guard — UI loops back
        assert.equal(ctx.stateRestored, true);
    });

    test('with second guard: in-flight fetch does NOT restore state after handleCreateNewDraw', async () => {
        const { ctx, fetch } = createFetchSimulator({ secondGuard: true });

        // Fetch starts, first guard passes (isCreating=false at this point)
        const inflight = fetch();

        // User clicks '+' mid-flight
        ctx.isCreating = true;

        await inflight;

        // FIX: state is NOT restored — UI stays on "Informe o código do sorteio"
        assert.equal(ctx.stateRestored, false);
    });
});
