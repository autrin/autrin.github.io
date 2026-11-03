/* All character reactions run locally. No microphone, tracking, or API calls. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const hero = $('.hero-mascot');
  const dock = $('.companion-dock');
  const toggle = $('#companion-toggle');
  const panel = $('#companion-panel');
  const restore = $('#restore-companion');
  const motionButtons = document.querySelectorAll('[data-action="motion"]');
  const walker = $('#walker');
  let walking = false, heroVisible = true, hovered = false;
  let walkFrame = 0, lastTime = 0, walkX = 16, direction = 1, walkClock = 0;
  let outfit = 'shorts';
  try { outfit = ['shorts','linen','yellow'].includes(localStorage.getItem('autrin-outfit')) ? localStorage.getItem('autrin-outfit') : 'shorts'; } catch {}
  const dialog = $('.puzzle-dialog');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  let poseTimer;
  let joke = 0;
  let opener;
  const jokes = [
    'Hi! Full-size Autrin built the systems. I handle waving.',
    'The curls are not a particle simulation. Yet.',
    'Yes, the mustache made it into production.',
    'I was told this was a remote position. I am now 120 pixels tall.',
    'Thanks for stopping by my small corner of the internet.'
  ];
  const projectNotes = [
    '64 GPUs. Still only one mustache.',
    'Getting hardware and software to agree. A full-time occupation.',
    'Finding the right part. My glasses are purely supervisory.',
    'One more pipeline. One less manual step.',
    'Spotting defects. My glasses are purely supervisory.',
    'A robot that plays chess. My poker face needs work.',
    'A whole neighborhood. You should see the electricity bill.',
    'Everybody gets a turn. The scheduler insists.',
    'Five threads. No room for tangled curls.',
    'Lost a packet? We can go back.',
    'Campus life, now with fewer browser tabs.',
    'Making connections. Literally.'
  ];
  function say(message) {
    $('#hero-speech').textContent = message;
    $('#companion-speech').textContent = message;
  }
  function setPose(pose) {
    hero.dataset.pose = pose;
    toggle.dataset.pose = pose;
  }
  function react(pose) {
    clearTimeout(poseTimer);
    setPose(pose);
    poseTimer = setTimeout(() => setPose('idle'), 2200);
  }
  function hello() { say(jokes[joke++ % jokes.length]); react(joke % 2 ? 'wave' : 'wink'); }
  function setPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} Mini Autrin`);
    updateDock();
  }
  function updateDock() {
    dock.style.visibility = walking || (heroVisible && panel.hidden) ? 'hidden' : 'visible';
  }
  function chooseOutfit(value) {
    outfit = value;
    document.body.dataset.outfit = value;
    document.querySelectorAll('.outfit-choice').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.outfit === value));
    });
    try { localStorage.setItem('autrin-outfit', value); } catch {}
  }
  chooseOutfit(outfit);
  document.querySelectorAll('.outfit-choice').forEach(button => button.addEventListener('click', () => chooseOutfit(button.dataset.outfit)));
  $('#change-outfit').addEventListener('click', () => {
    chooseOutfit(['shorts','linen','yellow'][(['shorts','linen','yellow'].indexOf(outfit) + 1) % 3]);
    say({shorts:'Shirt and shorts. Much more me.',linen:'Patterned shirt. Comfortable trousers. Ready.',yellow:'The yellow outfit is back.'}[outfit]);
  });
  function drawWalk(time) {
    if (!walking || paused || document.hidden) { lastTime = 0; walkFrame = 0; return; }
    const elapsed = lastTime ? Math.min(time - lastTime, 50) : 0;
    lastTime = time;
    const end = Math.max(16, window.innerWidth - 105);
    if (!hovered) {
      walkClock += elapsed;
      walkX += direction * elapsed * .045;
      if (walkX >= end) { walkX = end; direction = -1; }
      if (walkX <= 16) { walkX = 16; direction = 1; }
    }
    walkX = Math.min(walkX,end);
    walker.style.transform = `translateX(${walkX}px)`;
    const sprite = walker.querySelector('span');
    sprite.style.transform = `scaleX(${direction})`;
    sprite.style.backgroundPositionX = `${Math.floor(walkClock / 150) % 4 * 100 / 3}%`;
    walkFrame = requestAnimationFrame(drawWalk);
  }
  function startWalkLoop() {
    if (walking && !paused && !document.hidden && !walkFrame) walkFrame = requestAnimationFrame(drawWalk);
  }
  function setWalking(value) {
    walking = value; walker.hidden = !value;
    document.querySelectorAll('[data-action="walk"]').forEach(button => {
      button.setAttribute('aria-pressed', String(value));
      button.textContent = value ? 'Park here ↗' : 'Take a walk ↗';
    });
    if (!value) { cancelAnimationFrame(walkFrame); walkFrame = 0; lastTime = 0; }
    else { dock.hidden = false; restore.hidden = true; setPanel(false); startWalkLoop(); }
    updateDock();
  }
  function syncMotion() {
    document.body.classList.toggle('companion-paused', paused);
    motionButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Resume motion' : 'Pause motion';
    });
    hero.style.setProperty('--lean', '0deg');
    startWalkLoop();
  }
  syncMotion();
  reduced.addEventListener('change', event => { paused = event.matches; syncMotion(); });
  motionButtons.forEach(button => button.addEventListener('click', () => { paused = !paused; syncMotion(); }));
  walker.addEventListener('pointerenter', () => { hovered = true; });
  walker.addEventListener('pointerleave', () => { hovered = false; });
  walker.addEventListener('focus', () => { hovered = true; });
  walker.addEventListener('blur', () => { hovered = false; });
  walker.addEventListener('click', () => { setWalking(false); setPanel(true); toggle.focus(); });
  document.addEventListener('visibilitychange', startWalkLoop);
  toggle.addEventListener('click', () => { setPanel(panel.hidden); react('wave'); });
  hero.addEventListener('click', hello);
  $('#hide-companion').addEventListener('click', () => {
    setWalking(false); dock.hidden = true; restore.hidden = false; setPanel(false); restore.focus();
  });
  restore.addEventListener('click', () => { dock.hidden = false; restore.hidden = true; toggle.focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { setPanel(false); toggle.focus(); }
  });
  // A deliberate head turn on the stage, with a dead zone to avoid flicker.
  $('.mascot-stage').addEventListener('pointermove', event => {
    if (paused || event.pointerType === 'touch') return;
    clearTimeout(poseTimer);
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    hero.dataset.pose = x < -.28 ? 'left' : x > .28 ? 'right' : 'idle';
    hero.style.setProperty('--lean', `${Math.max(-4, Math.min(4, x * 6))}deg`);
  });
  $('.mascot-stage').addEventListener('pointerleave', () => {
    hero.dataset.pose = 'idle'; hero.style.setProperty('--lean', '0deg');
  });
  document.querySelectorAll('.project-card').forEach((card, index) => {
    const title = card.querySelector('h3').textContent;
    const actor = document.createElement('button');
    actor.className = 'project-mascot mascot'; actor.dataset.pose = 'idle';
    actor.setAttribute('aria-label', `Mini Autrin's take on ${title}`);
    actor.setAttribute('aria-expanded', 'false');
    const note = document.createElement('p');
    note.className = 'project-aside'; note.id = `autrin-note-${index}`; note.hidden = true;
    note.textContent = projectNotes[index] || 'A little curiosity turned into a project.';
    actor.setAttribute('aria-controls', note.id);
    card.querySelector('.project-header').after(note); card.append(actor);
    let timer;
    function point() {
      if (paused) return;
      clearTimeout(timer); actor.dataset.pose = 'left';
      timer = setTimeout(() => { actor.dataset.pose = 'wink'; }, 1100);
    }
    function reset() { clearTimeout(timer); actor.dataset.pose = 'idle'; }
    card.addEventListener('pointerenter', point);
    card.addEventListener('pointerleave', reset);
    card.addEventListener('focusin', point);
    card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) reset(); });
    actor.addEventListener('click', () => {
      note.hidden = !note.hidden;
      actor.setAttribute('aria-expanded', String(!note.hidden)); actor.dataset.pose = 'wink';
    });
  });
  const puzzle = window.AutrinPuzzle;
  const grid = $('#circuit-grid');
  let initialBoard, board, moves = [], hinted = null;
  function renderPuzzle() {
    let count = 0;
    grid.querySelectorAll('button').forEach((button,index) => {
      const on = Boolean(board & (1 << index));
      count += Number(on);
      button.classList.toggle('lit', on);
      button.classList.toggle('hinted', index === hinted);
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', `Row ${Math.floor(index / 4) + 1}, column ${index % 4 + 1}: ${on ? 'on' : 'off'}${index === hinted ? ', suggested move' : ''}`);
      button.disabled = board === puzzle.goal;
    });
    $('#puzzle-status').textContent = `${count} / 16 lights on · ${moves.length} ${moves.length === 1 ? 'move' : 'moves'}${board === puzzle.goal ? ' · Circuit complete!' : ''}`;
    $('#undo-move').disabled = !moves.length;
    $('#puzzle-hint').disabled = board === puzzle.goal;
    $('.game-mascot').dataset.pose = board === puzzle.goal ? 'wave' : 'left';
    if (board === puzzle.goal) $('#game-comment').textContent = 'All connected. Nicely done.';
  }
  for (let i = 0; i < 16; i++) {
    const button = document.createElement('button');
    button.className = 'circuit-switch'; button.type = 'button'; button.textContent = String(i + 1).padStart(2,'0');
    button.addEventListener('click', () => {
      if (board === puzzle.goal) return;
      board = puzzle.press(board,i); moves.push(i); hinted = null;
      $('#game-comment').textContent = 'A switch affects its neighbors. Think one step ahead.';
      renderPuzzle();
      if (board === puzzle.goal) $('#new-puzzle').focus();
    });
    button.addEventListener('keydown', event => {
      const offsets = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-4,ArrowDown:4};
      if (!(event.key in offsets)) return;
      event.preventDefault();
      const next = i + offsets[event.key];
      if (next < 0 || next > 15 || (Math.abs(offsets[event.key]) === 1 && (next >> 2) !== (i >> 2))) return;
      grid.children[next].focus();
    });
    grid.append(button);
  }
  function resetPuzzle(fresh = false) {
    if (fresh || initialBoard === undefined) initialBoard = puzzle.create();
    board = initialBoard; moves = []; hinted = null;
    $('#game-comment').textContent = 'One switch. Five consequences. Seems familiar.';
    renderPuzzle();
  }
  $('#undo-move').addEventListener('click', () => {
    if (!moves.length) return;
    board = puzzle.press(board,moves.pop()); hinted = null; renderPuzzle();
    $('#game-comment').textContent = 'A little room to rethink.';
  });
  $('#puzzle-hint').addEventListener('click', () => {
    const solution = puzzle.solve(board);
    if (!solution?.length) return;
    hinted = solution[0]; renderPuzzle();
    $('#game-comment').textContent = `Try row ${Math.floor(hinted / 4) + 1}, column ${hinted % 4 + 1}. ${solution.length} switches remain in a shortest solution.`;
  });
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.action === 'hello') hello();
    if (button.dataset.action === 'walk') setWalking(!walking);
    if (button.dataset.action === 'game') { opener = button; if (initialBoard === undefined) resetPuzzle(); dialog.showModal(); }
  }));
  $('#close-game').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  $('#restart-game').addEventListener('click', () => { resetPuzzle(); grid.children[0].focus(); });
  $('#new-puzzle').addEventListener('click', () => { resetPuzzle(true); grid.children[0].focus(); });
  // The dock appears after the homepage character leaves view.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting; updateDock();
    }, { threshold: .15 }).observe($('.autrin-studio'));
  }
})();
