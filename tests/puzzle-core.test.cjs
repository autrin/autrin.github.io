const assert = require('node:assert/strict');
const puzzle = require('../puzzle-core.js');

// Edge switches must never wrap across a row or column.
assert.equal(puzzle.press(0,0), (1<<0) | (1<<1) | (1<<4));
assert.equal(puzzle.press(0,3), (1<<2) | (1<<3) | (1<<7));
assert.equal(puzzle.press(0,5), (1<<1) | (1<<4) | (1<<5) | (1<<6) | (1<<9));
assert.deepEqual(puzzle.solve(puzzle.goal), []);
assert.deepEqual(puzzle.solve(puzzle.press(puzzle.goal,5)), [5]);
let seed = 19;
function random() { seed = (Math.imul(seed,1664525) + 1013904223) >>> 0; return seed / 4294967296; }
for (let n = 0; n < 100; n++) {
  let board = puzzle.create(random);
  assert.notEqual(board,puzzle.goal);
  const solution = puzzle.solve(board);
  assert.ok(solution && solution.length <= 7, 'Legal seven-move scramble must have a solution of at most seven moves');
  for (const step of solution) board = puzzle.press(board,step);
  assert.equal(board,puzzle.goal);
  // An arbitrary extra player move must still leave a solvable board.
  board = puzzle.press(board,n % 16);
  const next = puzzle.solve(board);
  assert.ok(next);
  for (const step of next) board = puzzle.press(board,step);
  assert.equal(board,puzzle.goal);
}
console.log('PASS: edge rules, exact one-move solution, 100 reproducible solvable puzzles and recovery after extra moves.');
