'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const {
    toggleDrawPrizeSelection,
    toggleAllDrawPrizeSelections,
    areAllDrawPrizeSelectionsSelected,
} = require('../src/utils/drawPrizeSelection');

// ---------------------------------------------------------------------------
// toggleDrawPrizeSelection — null/falsy drawPrizeId returns copy of selectedIds
// ---------------------------------------------------------------------------

test('toggleDrawPrizeSelection with null drawPrizeId returns copy of selectedIds', () => {
    const original = ['a', 'b'];
    const result = toggleDrawPrizeSelection(original, null);
    assert.deepEqual(result, ['a', 'b']);
    // must be a copy, not the same reference
    assert.notEqual(result, original);
});

test('toggleDrawPrizeSelection with undefined drawPrizeId returns copy of selectedIds', () => {
    const result = toggleDrawPrizeSelection(['x'], undefined);
    assert.deepEqual(result, ['x']);
});

test('toggleDrawPrizeSelection with empty string drawPrizeId returns copy (empty string is falsy)', () => {
    const result = toggleDrawPrizeSelection(['a'], '');
    assert.deepEqual(result, ['a']);
});

test('toggleDrawPrizeSelection with empty selectedIds and valid id adds it', () => {
    assert.deepEqual(toggleDrawPrizeSelection([], 'newId'), ['newId']);
});

test('toggleDrawPrizeSelection does not mutate original selectedIds', () => {
    const original = ['a', 'b'];
    toggleDrawPrizeSelection(original, 'c');
    assert.deepEqual(original, ['a', 'b']);
});

// ---------------------------------------------------------------------------
// areAllDrawPrizeSelectionsSelected — edge cases
// ---------------------------------------------------------------------------

test('areAllDrawPrizeSelectionsSelected returns false for empty drawPrizeIds', () => {
    assert.equal(areAllDrawPrizeSelectionsSelected([], ['a', 'b']), false);
});

test('areAllDrawPrizeSelectionsSelected returns false when selectedIds is empty', () => {
    assert.equal(areAllDrawPrizeSelectionsSelected(['a', 'b'], []), false);
});

test('areAllDrawPrizeSelectionsSelected returns true when selectedIds is a superset', () => {
    // selectedIds contains more items than drawPrizeIds — all drawPrizeIds are still selected
    assert.equal(areAllDrawPrizeSelectionsSelected(['a', 'b'], ['a', 'b', 'c']), true);
});

// ---------------------------------------------------------------------------
// toggleAllDrawPrizeSelections — edge cases
// ---------------------------------------------------------------------------

test('toggleAllDrawPrizeSelections with empty drawPrizeIds returns unchanged selectedIds', () => {
    // areAllSelected([]) → false, so we try to select all… but nothing to add
    const result = toggleAllDrawPrizeSelections([], ['x', 'y']);
    assert.deepEqual(result, ['x', 'y']);
});

test('toggleAllDrawPrizeSelections preserves IDs not in drawPrizeIds when deselecting', () => {
    // All of ['a','b'] are already selected. Deselecting should keep 'c'.
    const result = toggleAllDrawPrizeSelections(['a', 'b'], ['a', 'b', 'c']);
    assert.deepEqual(result, ['c']);
});

test('toggleAllDrawPrizeSelections avoids duplicates when adding to partially-selected list', () => {
    // 'a' already in selectedIds, add 'b' and 'c'
    const result = toggleAllDrawPrizeSelections(['a', 'b', 'c'], ['a']);
    const unique = new Set(result);
    assert.equal(unique.size, result.length, 'no duplicates');
    assert.ok(result.includes('a'));
    assert.ok(result.includes('b'));
    assert.ok(result.includes('c'));
});
