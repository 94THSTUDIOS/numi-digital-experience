// ============================================================
// NUMI — Level 1: Learn to Count 1–5
// levels/level1.js
//
// SEQUENCE PER NUMBER:
//   1. Gesture step  — child holds up N fingers → celebrate → "THIS IS N = N"
//   2. Count With Me — animated SVG hand shows N, plays audio, auto-advances
//   3. Your Turn     — overlay dimmed off (camera visible), child must BOTH
//                      show N fingers AND say the number aloud (ml5 audio).
//                      Only advances when both detections are confirmed.
// ============================================================

window.level1 = (() => {

  // ── HAND SVG GENERATOR ────────────────────────────────────
  // Returns an inline SVG of a hand showing `count` fingers raised (1–5).
  // Fingers raise in standard child-counting order:
  //   1=index, 2=+middle, 3=+ring, 4=+pinky, 5=+thumb
  function getHandSVG(count) {
    const SKIN    = '#FFCB74';
    const OUTLINE = '#C07820';
    const NAIL    = 'rgba(255,255,255,0.38)';

    // [cx, tipY_raised, tipY_curled, fingerWidth]
    const FINGER_DEFS = [
      [35, 14, 61, 14],   // index
      [50,  6, 56, 14],   // middle
      [65, 14, 61, 13],   // ring
      [78, 27, 64, 11],   // pinky
    ];
    const PALM_TOP = 72;

    const parts = [];

    // ── Curled fingers first (drawn behind palm) ──
    FINGER_DEFS.forEach(([cx, tipUp, tipDown, w], i) => {
      if (i >= Math.min(count, 4)) {
        const tipY = tipDown;
        const h    = PALM_TOP + 8 - tipY;
        parts.push(
          `<rect x="${cx - w / 2}" y="${tipY}" width="${w}" height="${h}" rx="${Math.floor(w / 2)}" ` +
          `fill="${SKIN}" stroke="${OUTLINE}" stroke-width="2"/>`
        );
      }
    });

    // ── Palm ──
    parts.push(
      `<rect x="16" y="${PALM_TOP}" width="70" height="56" rx="13" ` +
      `fill="${SKIN}" stroke="${OUTLINE}" stroke-width="2.5"/>`
    );

    // ── Raised fingers (drawn on top of palm) ──
    FINGER_DEFS.forEach(([cx, tipUp, tipDown, w], i) => {
      if (i < Math.min(count, 4)) {
        const tipY = tipUp;
        const h    = PALM_TOP + 12 - tipY;
        parts.push(
          `<rect x="${cx - w / 2}" y="${tipY}" width="${w}" height="${h}" rx="${Math.floor(w / 2)}" ` +
          `fill="${SKIN}" stroke="${OUTLINE}" stroke-width="2.5"/>`
        );
        // Fingernail accent
        parts.push(
          `<rect x="${cx - w / 2 + 2}" y="${tipY + 3}" width="${w - 4}" height="${Math.round((w - 4) * 0.65)}" rx="3" fill="${NAIL}"/>`
        );
      }
    });

    // ── Thumb ──
    if (count >= 5) {
      parts.push(
        `<rect x="4" y="52" width="16" height="36" rx="8" fill="${SKIN}" stroke="${OUTLINE}" stroke-width="2.5"/>` +
        `<rect x="6" y="55" width="9" height="6" rx="3" fill="${NAIL}"/>`
      );
    } else {
      parts.push(
        `<rect x="7" y="74" width="13" height="20" rx="6.5" fill="${SKIN}" stroke="${OUTLINE}" stroke-width="2"/>`
      );
    }

    return (
      `<svg viewBox="0 0 104 134" xmlns="http://www.w3.org/2000/svg" ` +
      `style="filter:drop-shadow(0 8px 18px rgba(0,0,0,0.38))">${parts.join('')}</svg>`
    );
  }

  // ── CONSTANTS ─────────────────────────────────────────────
  const NUM_WORDS  = ['', 'one', 'two', 'three', 'four', 'five'];

  const FRAMES_TO_CONFIRM      = 60;      // ~1.0 s at 60 fps hold (Increased from 40)
  const CELEBRATION_DURATION   = 2000;    // Increased from 1200
  const NUMBER_SHOW_DURATION   = 3000;    // Increased from 1800
  const COUNT_WITH_ME_DURATION = 4200;    // auto-advance from Count-With-Me (fallback)
  const AUDIO_CONFIDENCE_MIN   = 0.45;    // Lowered for better accessibility/testing

  // ── SEQUENCE DEFINITION ───────────────────────────────────
  // kind: 'gesture' | 'count_with_me' | 'your_turn'
  const STEPS = [
    // ── Setup ────────────────────────────────────────────────
    {
      kind: 'gesture',
      title: 'SHOW A COUNTING\nHAND',
      emoji: '🖐️',
      instructionAudio: 'l1_show_hand',
      detect: (f, h) => h >= 1 && f >= 5,
    },
    {
      kind: 'gesture',
      title: 'MAKE A ROCK',
      emoji: '✊',
      instructionAudio: 'l1_make_rock',
      detect: (f, h) => h >= 1 && f === 0,
    },

    // ── Number 1 ─────────────────────────────────────────────
    {
      kind: 'gesture',
      title: 'NOW, LIFT A FINGER',
      emoji: '☝️',
      instructionAudio: 'l1_lift_finger',
      numberText: 'THIS IS ONE = 1',
      numberAudio: 'l1_this_is_one',
      number: 1,
      detect: (f, h) => h >= 1 && f === 1,
    },
    // ── Number 2 ─────────────────────────────────────────────
    {
      kind: 'gesture',
      title: 'NOW, LIFT ANOTHER FINGER',
      emoji: '✌️',
      instructionAudio: 'l1_lift_another_2',
      numberText: 'THIS IS TWO = 2',
      numberAudio: 'l1_this_is_two',
      number: 2,
      detect: (f, h) => h >= 1 && f === 2,
    },
    { kind: 'count_with_me', number: 2 },
    { kind: 'your_turn',     number: 2 },

    // ── Number 3 ─────────────────────────────────────────────
    {
      kind: 'gesture',
      title: 'NOW, LIFT ANOTHER FINGER',
      emoji: '🤟',
      instructionAudio: 'l1_lift_another_3',
      numberText: 'THIS IS THREE = 3',
      numberAudio: 'l1_this_is_three',
      number: 3,
      detect: (f, h) => h >= 1 && f === 3,
    },
    { kind: 'count_with_me', number: 3 },
    { kind: 'your_turn',     number: 3 },

    // ── Number 4 ─────────────────────────────────────────────
    {
      kind: 'gesture',
      title: 'NOW, LIFT ANOTHER FINGER',
      emoji: '🖖',
      instructionAudio: 'l1_lift_another_4',
      numberText: 'THIS IS FOUR = 4',
      numberAudio: 'l1_this_is_four',
      number: 4,
      detect: (f, h) => h >= 1 && f === 4,
    },
    { kind: 'count_with_me', number: 4 },
    { kind: 'your_turn',     number: 4 },

    // ── Number 5 ─────────────────────────────────────────────
    {
      kind: 'gesture',
      title: 'NOW, LIFT ANOTHER FINGER',
      emoji: '🖐️',
      instructionAudio: 'l1_lift_another_5',
      numberText: 'THIS IS FIVE = 5',
      numberAudio: 'l1_this_is_five',
      number: 5,
      detect: (f, h) => h >= 1 && f >= 5,
    },
    { kind: 'count_with_me', number: 5 },
    { kind: 'your_turn',     number: 5 },
  ];

  // ── STATE ─────────────────────────────────────────────────
  let overlay         = null;
  let currentStep     = 0;
  // 'waiting' | 'celebrating' | 'showing_number' | 'auto' | 'your_turn'
  let phase           = 'waiting';
  let isPaused        = false;
  let stableCount     = 0;
  let transitionTimer = null;

  let expectedSubCount = 1;      // Tracking 1 -> 2 -> 3... in Your Turn
  let gestureOk        = false;

  // ── HELPER: id shorthand ──────────────────────────────────
  const el = (id) => document.getElementById(id);

  // ── DOM CONSTRUCTION ──────────────────────────────────────
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'l1-overlay';
    Object.assign(overlay.style, {
      position        : 'absolute',
      inset           : '0',
      zIndex          : '10',
      background      : 'rgba(14, 12, 28, 0.52)',
      backdropFilter  : 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
      display         : 'flex',
      flexDirection   : 'column',
      alignItems      : 'center',
      justifyContent  : 'center',
    });

    overlay.innerHTML = `
      <style>
        @keyframes num-pop    { from { transform:scale(0.5);  opacity:0 } to { transform:scale(1); opacity:1 } }
        @keyframes celeb-pop  { from { transform:scale(0.4) rotate(-8deg); opacity:0 } to { transform:scale(1) rotate(0); opacity:1 } }
        @keyframes hand-float { 0%,100% { transform:translateY(0)    } 50% { transform:translateY(-14px) } }
        @keyframes badge-in   { from { transform:scale(0) rotate(-20deg); opacity:0 } to { transform:scale(1) rotate(0); opacity:1 } }
        @keyframes pulse-ring { 0%,100% { box-shadow:0 0 0 0 rgba(107,203,119,0.55) } 60% { box-shadow:0 0 0 10px rgba(107,203,119,0) } }

        #l1-cwm-hand { animation: hand-float 2s ease-in-out infinite; }
        .l1-ind-ok   { border-color:#6BCB77 !important; animation: pulse-ring 1.6s ease-out infinite; }
      </style>

      <!-- ── Gesture Instruction (steps 0-1 + numbered gesture steps) ── -->
      <div id="l1-content" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:2rem;">
        <h2 id="l1-title"
            style="font-family:var(--font-display);font-size:clamp(2rem,4vw,3rem);font-weight:900;
                   color:#fff;letter-spacing:0.05em;text-transform:uppercase;"></h2>
        <div style="font-size:10rem;line-height:1;filter:drop-shadow(0px 8px 16px rgba(0,0,0,0.4));">
          <span id="l1-emoji"></span>
        </div>
      </div>

      <!-- ── Gesture hold-arc ── -->
      <div id="l1-hold-ring" style="position:absolute;bottom:85px;left:50%;transform:translateX(-50%);width:60px;height:60px;">
        <svg viewBox="0 0 60 60" style="position:absolute;inset:0;transform:rotate(-90deg);">
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="5"/>
          <circle id="l1-ring-arc" cx="30" cy="30" r="24" fill="none" stroke="#FF6B6F"
                  stroke-width="5" stroke-linecap="round"
                  stroke-dasharray="150.8" stroke-dashoffset="150.8"
                  style="transition:stroke-dashoffset 0.1s linear;"/>
        </svg>
      </div>

      <!-- ── "THIS IS X = X" Screen ── -->
      <div id="l1-number-screen"
           style="display:none;position:absolute;inset:0;flex-direction:column;
                  align-items:center;justify-content:center;z-index:6;">
        <h1 id="l1-num-text"
            style="font-family:var(--font-display);font-size:clamp(3rem,7vw,6rem);
                   color:white;text-shadow:0 0 30px rgba(0,0,0,0.6);
                   animation:num-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;"></h1>
      </div>

      <!-- ── "COUNT WITH ME" Screen ── -->
      <div id="l1-cwm-screen"
           style="display:none;position:absolute;inset:0;flex-direction:column;
                  align-items:center;justify-content:center;gap:1.4rem;z-index:6;">
        <h2 style="font-family:var(--font-display);font-size:clamp(2rem,4.5vw,3.2rem);
                   font-weight:900;color:#fff;text-transform:uppercase;
                   text-shadow:0 2px 14px rgba(0,0,0,0.5);letter-spacing:0.06em;">
          COUNT WITH ME
        </h2>
        <div id="l1-cwm-hand" style="width:160px;height:200px;display:flex;align-items:center;justify-content:center;"></div>
        <div id="l1-cwm-numtext"
             style="font-family:var(--font-display);font-size:clamp(2rem,4vw,2.8rem);
                    font-weight:900;color:#FFD93D;
                    text-shadow:0 2px 18px rgba(0,0,0,0.55);letter-spacing:0.04em;"></div>
      </div>

      <!-- ── "YOUR TURN" Screen ── -->
      <!-- Overlay bg is removed in JS so the live camera feed shows through.    -->
      <!-- All UI here uses semi-opaque pills so it stays readable over video.   -->
      <div id="l1-yt-screen"
           style="display:none;position:absolute;inset:0;flex-direction:column;
                  align-items:center;justify-content:space-between;
                  padding:1.2rem 1rem;z-index:6;">

        <!-- Top banner -->
        <div style="display:flex;justify-content:center;width:100%;padding-top:0.3rem;">
          <h2 style="font-family:var(--font-display);font-size:clamp(1.8rem,4vw,2.8rem);
                     font-weight:900;color:#fff;text-transform:uppercase;
                     text-shadow:0 2px 10px rgba(0,0,0,0.9);
                     background:rgba(0,0,0,0.40);padding:0.45rem 2rem;
                     border-radius:999px;letter-spacing:0.06em;margin:0;">
            YOUR TURN
          </h2>
        </div>

        <!-- Centre prompt -->
        <p id="l1-yt-prompt"
           style="font-family:var(--font-display);font-size:clamp(1.1rem,2.2vw,1.6rem);
                  font-weight:700;color:#fff;text-align:center;
                  text-shadow:0 2px 8px rgba(0,0,0,0.95);
                  background:rgba(0,0,0,0.48);padding:0.6rem 1.4rem;
                  border-radius:14px;margin:0;max-width:80%;"></p>

        <!-- Bottom detection indicators -->
        <!-- Bottom detection indicator -->
        <div style="display:flex;flex-direction:column;gap:0.9rem;justify-content:center;
                    width:100%;padding-bottom:1.5rem;align-items:center;">
          
          <!-- Iterative Progress -->
          <div id="l1-yt-progress"
               style="font-family:var(--font-display);font-size:4.5rem;color:#FFD93D;
                      line-height:1;font-weight:900;text-shadow:0 4px 20px rgba(0,0,0,0.8);"></div>

          <!-- Hold-arc ring -->
          <div id="l1-yt-ring" style="width:70px;height:70px;flex-shrink:0;">
            <svg viewBox="0 0 60 60" style="width:70px;height:70px;transform:rotate(-90deg);">
              <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="5"/>
              <circle id="l1-yt-arc" cx="30" cy="30" r="24" fill="none" stroke="#6BCB77"
                      stroke-width="5" stroke-linecap="round"
                      stroke-dasharray="150.8" stroke-dashoffset="150.8"
                      style="transition:stroke-dashoffset 0.1s linear;"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- ── Pause Menu ── -->
      <div id="l1-pause-menu"
           style="display:none;position:absolute;inset:0;flex-direction:column;
                  align-items:center;justify-content:center;gap:2rem;
                  background:rgba(14, 12, 28, 0.88);backdrop-filter:blur(10px);
                  -webkit-backdrop-filter:blur(10px);z-index:100;">
        <h1 style="font-family:var(--font-display);font-size:4rem;color:#fff;
                   text-transform:uppercase;letter-spacing:0.1em;">Paused</h1>
        
        <div style="display:flex;flex-direction:column;gap:1rem;width:240px;">
          <button id="l1-resume"
                  style="font-family:var(--font-display);font-size:1.8rem;font-weight:900;
                         color:white;background:#6c5ce7;border:none;padding:1rem;
                         border-radius:12px;cursor:pointer;text-transform:uppercase;
                         box-shadow:0 10px 20px rgba(108,92,231,0.3);">
            Resume
          </button>
        </div>
      </div>

      <!-- ── Celebration overlay ── -->
      <div id="l1-celebration"
           style="opacity:0;pointer-events:none;position:absolute;inset:0;
                  display:flex;justify-content:center;align-items:center;
                  z-index:8;transition:opacity 0.3s ease;">
        <span id="l1-celeb-word"
              style="font-family:var(--font-display);font-size:clamp(3.5rem,8vw,6rem);
                     font-weight:900;color:#fff;
                     text-shadow:0 4px 30px rgba(0,0,0,0.6),0 0 60px rgba(255,107,111,0.5);
                     animation:celeb-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both;"></span>
      </div>

      <!-- ── Controls ── -->
      <button id="l1-close"
              style="position:absolute;top:15px;left:15px;width:32px;height:32px;border-radius:50%;
                     border:none;background:#6c5ce7;font-weight:bold;color:white;cursor:pointer;
                     box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:20;">✕</button>
      <div id="l1-controls" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
                                    display:flex;align-items:center;gap:15px;z-index:20;">
        <button id="l1-skip-back"
                style="width:36px;height:36px;border-radius:50%;border:none;background:rgba(108,92,231,0.6);
                       font-size:1rem;color:white;cursor:pointer;
                       box-shadow:0 2px 8px rgba(0,0,0,0.3);">⏮</button>
        <button id="l1-pause"
                style="width:48px;height:48px;border-radius:50%;border:none;background:#6c5ce7;
                       font-size:1.4rem;color:white;cursor:pointer;
                       box-shadow:0 4px 12px rgba(0,0,0,0.4);">⏸</button>
        <button id="l1-skip-forward"
                style="width:36px;height:36px;border-radius:50%;border:none;background:rgba(108,92,231,0.6);
                       font-size:1rem;color:white;cursor:pointer;
                       box-shadow:0 2px 8px rgba(0,0,0,0.3);">⏭</button>
      </div>
    `;

    document.getElementById('player-frame').appendChild(overlay);
    el('l1-close').addEventListener('click', () => gameState.transitionTo('level0'));
    el('l1-pause').addEventListener('click', togglePause);
    el('l1-resume').addEventListener('click', togglePause);
    el('l1-skip-back').addEventListener('click', () => {
      window.stopAllSounds?.();
      gameState.transitionTo('level0');
    });
    el('l1-skip-forward').addEventListener('click', () => {
      window.stopAllSounds?.();
      gameState.transitionTo('level2');
    });

    renderStep();
  }

  function togglePause() {
    isPaused = !isPaused;
    const menu = el('l1-pause-menu');
    if (!menu) return;

    if (isPaused) {
      menu.style.display = 'flex';
      // Pause all audio
      for (let key in window.sounds) {
        if (window.sounds[key]) window.sounds[key].pause();
      }
    } else {
      menu.style.display = 'none';
      // Resume could be tricky; we'll let the user manually trigger audio if needed
      // but for "Auto" phases, we might want to resume the current sound.
    }
  }

  // ── OVERLAY TRANSPARENCY HELPERS ──────────────────────────
  function setOverlayDim(on) {
    if (!overlay) return;
    if (on) {
      overlay.style.background           = 'rgba(14, 12, 28, 0.52)';
      overlay.style.backdropFilter       = 'blur(3px)';
      overlay.style.WebkitBackdropFilter = 'blur(3px)';
    } else {
      // Remove dim so the camera feed shows through
      overlay.style.background           = 'transparent';
      overlay.style.backdropFilter       = 'none';
      overlay.style.WebkitBackdropFilter = 'none';
    }
  }

  // ── HIDE ALL CONTENT PANELS ───────────────────────────────
  function hideAllPanels() {
    el('l1-content').style.display       = 'flex'; // gesture default
    el('l1-hold-ring').style.display     = 'flex';
    el('l1-number-screen').style.display = 'none';
    el('l1-cwm-screen').style.display    = 'none';
    el('l1-yt-screen').style.display     = 'none';
    el('l1-celebration').style.opacity   = '0';
    updateGestureArc(0);
    setOverlayDim(true);
  }

  // ── RENDER STEP (dispatcher) ──────────────────────────────
  function renderStep() {
    phase       = 'waiting';
    stableCount = 0;
    gestureOk   = false;
    window.stopAllSounds?.();
    gameState.hideMagicRings();
    clearTimeout(transitionTimer);
    hideAllPanels();

    const step = STEPS[currentStep];
    if      (step.kind === 'gesture')       renderGestureStep(step);
    else if (step.kind === 'count_with_me') renderCountWithMeStep(step);
    else if (step.kind === 'your_turn')     renderYourTurnStep(step);
  }

  // ── RENDER: GESTURE STEP ──────────────────────────────────
  function renderGestureStep(step) {
    el('l1-title').innerHTML   = step.title.replace(/\n/g, '<br>');
    el('l1-emoji').textContent = step.emoji;
    playSound(step.instructionAudio);
  }

  // ── RENDER: COUNT WITH ME ─────────────────────────────────
  function renderCountWithMeStep(step) {
    el('l1-content').style.display   = 'none';
    el('l1-hold-ring').style.display = 'none';

    const screen = el('l1-cwm-screen');
    screen.style.display = 'flex';

    el('l1-cwm-hand').innerHTML    = getHandSVG(step.number);
    el('l1-cwm-numtext').textContent =
      NUM_WORDS[step.number].toUpperCase() + ' = ' + step.number;

    // Play the specific counting audio for this number
    const s = playSound('l1_counting_' + step.number);

    phase = 'auto';
    
    // Safety fallback timeout, but ideally we wait for the sound to finish
    const duration = (s && s.duration && s.duration > 0) ? (s.duration * 1000 + 800) : COUNT_WITH_ME_DURATION;
    
    if (s) {
      s.onended = () => { if (phase === 'auto') advanceStep(); };
    } else {
      transitionTimer = setTimeout(advanceStep, duration);
    }
  }

  // ── RENDER: YOUR TURN ─────────────────────────────────────
  function renderYourTurnStep(step) {
    el('l1-content').style.display   = 'none';
    el('l1-hold-ring').style.display = 'none';

    // Remove dim — camera shows through the overlay
    setOverlayDim(false);

    const screen = el('l1-yt-screen');
    screen.style.display = 'flex';

    el('l1-yt-prompt').innerHTML =
      `Count from one to ${NUM_WORDS[step.number]}`;

    // Reset indicators
    expectedSubCount = 1;
    el('l1-yt-progress').textContent = '';
    el('l1-yt-arc').style.opacity = '1';
    updateYourTurnArc(0);

    // Play the "Your Turn" prompt
    playSound('l1_your_turn');

    phase = 'your_turn';
  }

  // ── ARC HELPERS ───────────────────────────────────────────
  function updateGestureArc(frames) {
    const arc = el('l1-ring-arc');
    if (!arc) return;
    arc.style.strokeDashoffset = 150.8 * (1 - Math.min(frames / FRAMES_TO_CONFIRM, 1));
  }

  function updateYourTurnArc(frames) {
    const arc = el('l1-yt-arc');
    if (!arc) return;
    arc.style.strokeDashoffset = 150.8 * (1 - Math.min(frames / FRAMES_TO_CONFIRM, 1));
  }

  // ── SOUND HELPER ──────────────────────────────────────────
  function playSound(key) {
    if (!key || !window.sounds?.[key]) return null;
    const s = window.sounds[key];
    s.currentTime = 0;
    s.play().catch(() => {});
    return s;
  }

  // ── CELEBRATE ─────────────────────────────────────────────
  function onCelebrate() {
    phase       = 'celebrating';
    stableCount = 0;
    const step  = STEPS[currentStep];

    window.stopAllSounds?.();
    setOverlayDim(true); // re-dim so confetti is visible

    // Hide all instructional panels before showing celebration
    if (el('l1-yt-screen')) el('l1-yt-screen').style.display = 'none';
    if (el('l1-content')) el('l1-content').style.display = 'none';
    if (el('l1-hold-ring')) el('l1-hold-ring').style.display = 'none';

    gameState.showMagicRings();
    el('l1-celebration').style.opacity    = '1';
    
    // Starting from number 2, show the number itself. Otherwise "SUPERB!"
    if (step.number && step.number >= 2) {
      el('l1-celeb-word').textContent = step.number;
    } else {
      el('l1-celeb-word').textContent = 'SUPERB!';
    }

    // For gesture steps, play the number audio as part of the celebration
    if (step.kind === 'gesture' && step.numberAudio) {
      playSound(step.numberAudio);
    }

    // Calculate duration: wait for the number audio to finish if one is playing
    const s = step.numberAudio ? (window.sounds && window.sounds[step.numberAudio]) : null;
    const celebrationDelay = (s && s.duration && s.duration > 0) 
      ? (s.duration * 1000 + 800) 
      : CELEBRATION_DURATION;

    transitionTimer = setTimeout(() => {
      gameState.hideMagicRings();
      el('l1-celebration').style.opacity = '0';

      // After a gesture step with a number: show "THIS IS X = X" interstitial
      if (step.kind === 'gesture' && step.numberText) {
        showNumberScreen();
      } else {
        advanceStep();
      }
    }, celebrationDelay);
  }

  // ── NUMBER INTERSTITIAL ───────────────────────────────────
  function showNumberScreen() {
    phase = 'showing_number';
    el('l1-content').style.display   = 'none';
    el('l1-hold-ring').style.display = 'none';

    const scr = el('l1-number-screen');
    scr.style.display = 'flex';
    el('l1-num-text').textContent = STEPS[currentStep].numberText;

    transitionTimer = setTimeout(advanceStep, NUMBER_SHOW_DURATION);
  }

  // ── ADVANCE ───────────────────────────────────────────────
  function advanceStep() {
    currentStep++;
    if (currentStep >= STEPS.length) {
      gameState.transitionTo('level2');
    } else {
      renderStep();
    }
  }

  // ── FRAME UPDATE (called every video frame) ───────────────
  function update(fingerCount, handsCount) {
    if (isPaused) return;
    if (phase === 'waiting') {
      updateGesturePhase(fingerCount, handsCount);
    } else if (phase === 'your_turn') {
      updateYourTurnPhase(fingerCount, handsCount);
    }
  }

  function updateGesturePhase(fingerCount, handsCount) {
    const step = STEPS[currentStep];
    if (step.kind !== 'gesture') return;

    const matched = step.detect(fingerCount, handsCount);
    if (matched) {
      stableCount++;
      updateGestureArc(stableCount);
      if (stableCount >= FRAMES_TO_CONFIRM) onCelebrate();
    } else {
      stableCount = Math.max(0, stableCount - 1);
      updateGestureArc(stableCount);
    }
  }

  function updateYourTurnPhase(fingerCount, handsCount) {
    if (isPaused) return;

    const step   = STEPS[currentStep];
    const target = step.number;

    // ── Iterative Sequence Logic ──
    // If they hit the NEXT expected number, registering it
    if (fingerCount === expectedSubCount && handsCount >= 1) {
      playSound(expectedSubCount); // Plays sounds['1'], sounds['2'] etc if registered
      expectedSubCount++;
      
      // Update UI feedback
      el('l1-yt-progress').textContent = (expectedSubCount - 1).toString();
      // Reset stableCount for the final hold if needed, 
      // or just auto-advance if it was the last one and target is reached.
    }

    // ── Success condition: we have reached or exceeded the target ──
    const targetReached = (expectedSubCount > target);

    // ── Arc / confirm ──
    if (targetReached) {
      stableCount++;
      updateYourTurnArc(stableCount);
      if (stableCount >= FRAMES_TO_CONFIRM) onCelebrate();
    } else {
      stableCount = Math.max(0, stableCount - 1);
      updateYourTurnArc(stableCount);
      // Logic for "waiting": maybe pulse the arc or show next expected
      el('l1-yt-progress').textContent = (expectedSubCount - 1 > 0) ? (expectedSubCount - 1).toString() : '';
    }
  }

  // ── GATE SCREEN ───────────────────────────────────────────
  function createGateOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'l1-gate';
    Object.assign(overlay.style, {
      position            : 'absolute',
      inset               : '0',
      zIndex              : '100',
      background          : 'rgba(14, 12, 28, 0.85)',
      backdropFilter      : 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display             : 'flex',
      flexDirection       : 'column',
      alignItems          : 'center',
      justifyContent      : 'center',
      gap                 : '2rem',
    });

    overlay.innerHTML = `
      <h1 style="font-family:var(--font-display);font-size:clamp(2.5rem,6vw,4rem);
                 font-weight:900;color:#fff;text-align:center;text-transform:uppercase;
                 line-height:1.1;max-width:80%;">
        Ready to start<br/>learning?
      </h1>
      <button id="l1-gate-start"
              style="font-family:var(--font-display);font-size:2.5rem;font-weight:900;
                     color:white;background:#EF5A00;border:none;padding:1.5rem 4rem;
                     border-radius:999px;cursor:pointer;text-transform:uppercase;
                     transform:scale(1);transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
                     box-shadow:0 15px 30px rgba(239,90,0,0.3);">
        yes!
      </button>
    `;

    document.getElementById('player-frame').appendChild(overlay);
    playSound('ready');

    const btn = el('l1-gate-start');
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.05)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)';    });
    btn.addEventListener('click', () => {
      overlay.remove();
      createOverlay();
    });
  }

  // ── PUBLIC API ────────────────────────────────────────────
  return {
    onEnter() {
      currentStep = 0;
      createGateOverlay();
    },

    update,

    onExit() {
      clearTimeout(transitionTimer);
      gameState.hideMagicRings();
      overlay?.remove();
      overlay = null;
    },
  };

})();
