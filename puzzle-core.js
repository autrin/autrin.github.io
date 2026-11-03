/* A 4x4 Lights Out board. Scrambling with legal moves guarantees solvability. */
(function (root) {
  'use strict';
  const goal = 0xffff;
  const masks = Array.from({ length: 16 }, (_, i) => {
    const row = i >> 2, col = i % 4;
    return [[row,col],[row-1,col],[row+1,col],[row,col-1],[row,col+1]]
      .filter(([r,c]) => r >= 0 && r < 4 && c >= 0 && c < 4)
      .reduce((mask,[r,c]) => mask | (1 << (r * 4 + c)),0);
  });
  function press(board, index) { return board ^ masks[index]; }
  function solve(board) {
    // Gray-code enumeration changes one switch at a time; choose a shortest solution.
    let state = board, previous = 0, best = null;
    for (let n = 0; n < 65536; n++) {
      const gray = n ^ (n >> 1);
      if (n) state ^= masks[31 - Math.clz32(gray ^ previous)];
      previous = gray;
      if (state !== goal) continue;
      const steps = masks.map((_,i) => i).filter(i => gray & (1 << i));
      if (!best || steps.length < best.length) best = steps;
    }
    return best;
  }
  function create(random = Math.random) {
    let board = goal;
    const choices = Array.from({length:16},(_,i)=>i);
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [choices[i],choices[j]] = [choices[j],choices[i]];
    }
    for (const i of choices.slice(0,7)) board = press(board,i);
    return board === goal ? press(board,5) : board;
  }
  const api = Object.freeze({goal,press,solve,create});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AutrinPuzzle = api;
})(typeof window !== 'undefined' ? window : globalThis);
