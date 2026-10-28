'use strict';
// Tests for the ID deduplication and orchestration logic in deleteDrawPrizes (delete.js).
//
// Production code (delete.js):
//   const uniqueIds = [...new Set(drawPrizeIds)].filter(Boolean);
//   if (uniqueIds.length === 0) return true;
//   const results = await Promise.all(uniqueIds.map((id) => softDeleteDrawPrizeById(id)));
//   return results.every(Boolean);
//
// This guards against regressions in batch-delete logic without touching Firestore.

const test = require('node:test');
const assert = require('node:assert/strict');
const { describe } = require('node:test');

const { orchestrateDeleteDrawPrizes } = require('../src/controllers/DrawPrizes/helpers');

describe('deleteDrawPrizes orchestration', () => {
    test('returns true immediately for empty array (no Firestore call)', async () => {
        let callCount = 0;
        const result = await orchestrateDeleteDrawPrizes([], () => { callCount++; return true; });
        assert.equal(result, true);
        assert.equal(callCount, 0);
    });

    test('returns true immediately when all ids are null/undefined/empty (filter(Boolean))', async () => {
        let callCount = 0;
        const result = await orchestrateDeleteDrawPrizes(
            [null, undefined, '', false],
            () => { callCount++; return true; }
        );
        assert.equal(result, true);
        assert.equal(callCount, 0);
    });

    test('deduplicates ids before calling softDelete — each id called exactly once', async () => {
        const called = [];
        await orchestrateDeleteDrawPrizes(
            ['id-1', 'id-2', 'id-1', 'id-2', 'id-1'],
            async (id) => { called.push(id); return true; }
        );
        assert.equal(called.filter((id) => id === 'id-1').length, 1, 'id-1 called once');
        assert.equal(called.filter((id) => id === 'id-2').length, 1, 'id-2 called once');
        assert.equal(called.length, 2);
    });

    test('returns true when all softDeletes succeed', async () => {
        const result = await orchestrateDeleteDrawPrizes(
            ['a', 'b', 'c'],
            async () => true
        );
        assert.equal(result, true);
    });

    test('returns false when any softDelete fails — regression: partial failure must not return true', async () => {
        const result = await orchestrateDeleteDrawPrizes(
            ['ok-1', 'fail', 'ok-2'],
            async (id) => id !== 'fail'
        );
        assert.equal(result, false);
    });

    test('filters out falsy ids but keeps valid string ids alongside them', async () => {
        const called = [];
        await orchestrateDeleteDrawPrizes(
            ['valid-id', null, '', 'another-id', undefined],
            async (id) => { called.push(id); return true; }
        );
        assert.deepEqual(called.sort(), ['another-id', 'valid-id']);
    });

    test('single valid id: makes exactly one softDelete call', async () => {
        const called = [];
        await orchestrateDeleteDrawPrizes(
            ['only-one'],
            async (id) => { called.push(id); return true; }
        );
        assert.deepEqual(called, ['only-one']);
    });
});
