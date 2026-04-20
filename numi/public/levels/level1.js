// ============================================================
// NUMI — Level 1: Learn to Count 1–5
// levels/level1.js
//
// PURPOSE:
//   The first proper learning stage. 
//   Guides the child step-by-step:
//   Open Hand -> Rock -> 1 Finger -> 2 Fingers -> ... -> 5 Fingers.
//   Shows an explicit "THIS IS ONE = 1" screen after successful counts.
// ============================================================

const level1 = (() => {

  // ── SEQUENCE DEFINITION ───────────────────────────────────
  const STEPS = [
    {
      title: "SHOW A COUNTING\nHAND",
      emoji: "🖐️", // Placeholder for hand SVG
      instructionAudio: 'l1_show_hand',
      detect: (fingerCount, handsCount) => handsCount >= 1 && fingerCount >= 5,
    },
    {
      title: "MAKE A ROCK",
      emoji: "✊", // Placeholder for fist SVG
      instructionAudio: 'l1_make_rock',
      detect: (fingerCount, handsCount) => handsCount >= 1 && fingerCount === 0,
    },
    {
      title: "NOW, LIFT A FINGER",
      emoji: "☝️",
      instructionAudio: 'l1_lift_finger',
      numberText: "THIS IS ONE = 1",
      numberAudio: 1, // Will map to sounds[1]
      detect: (fingerCount, handsCount) => handsCount >= 1 && fingerCount === 1,
    },
    {
      title: "NOW, LIFT ANOTHER FINGER",
      emoji: "✌️",
      instructionAudio: 'l1_lift_another',
      numberText: "THIS IS TWO = 2",
      numberAudio: 2,
      detect: (fingerCount, handsCount) => handsCount >= 1 && fingerCount === 2,
    },
    {
      title: "NOW, LIFT ANOTHER FINGER",
      emoji: "🤟", // Placeholder generic 3
      instructionAudio: 'l1_lift_another',
      numberText: "THIS IS THREE = 3",
      numberAudio: 3,
      detect: (fingerCount, handsCount) => handsCount >= 1 && fingerCount === 3,
    },
    {
      title: "NOW, LIFT ANOTHER FINGER",
      emoji: "🖖", // Placeholder generic 4
      instructionAudio: 'l1_lift_another',
      numberText: "THIS IS FOUR = 4",
      numberAudio: 4,
      detect: (fingerCount, handsCount) => handsCount >= 1 && fingerCount === 4,
    },
    {
      title: "NOW, LIFT ANOTHER FINGER",
      emoji: "🖐️",
      instructionAudio: 'l1_lift_another',
      numberText: "THIS IS FIVE = 5",
      numberAudio: 5,
      detect: (fingerCount, handsCount) => handsCount >= 1 && fingerCount >= 5,
    }
  ];

  // ── TIMING ────────────────────────────────────────────────
  const FRAMES_TO_CONFIRM = 40;     // ~0.67 s at 60 fps hold time
  const CELEBRATION_DURATION = 2500; // time confetti shows
  const NUMBER_SHOW_DURATION = 3500; // time "THIS IS 1 = 1" shows before advancing

  // ── STATE ─────────────────────────────────────────────────
  let overlay = null;
  let currentStep = 0;
  let phase = 'waiting'; // 'waiting' | 'celebrating' | 'showing_number'
  let stableCount = 0;
  let transitionTimer = null;


  // ── DOM CONSTRUCTION ──────────────────────────────────────
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'l1-overlay';
    // Style matches the frosted glass overlay pattern
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.zIndex = '10';
    overlay.style.background = 'rgba(14, 12, 28, 0.52)';
    overlay.style.backdropFilter = 'blur(3px)';
    overlay.style.WebkitBackdropFilter = 'blur(3px)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    overlay.innerHTML = `
      <!-- Main Content Container -->
      <div class="l1-content" id="l1-content" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2rem;">
        <h2 id="l1-title" style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: #fff; letter-spacing: 0.05em; text-transform: uppercase;"></h2>
        
        <div id="l1-hand-visual" style="font-size: 10rem; line-height: 1; filter: drop-shadow(0px 8px 16px rgba(0,0,0,0.4));">
           <span id="l1-emoji"></span>
        </div>
      </div>

      <!-- Stabilisation arc (moved to center bottom) -->
      <div class="l1-hold-ring" id="l1-hold-ring" style="position: absolute; bottom: 85px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px;">
        <svg viewBox="0 0 60 60" style="position: absolute; inset: 0; transform: rotate(-90deg);">
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="5"/>
          <circle id="l1-ring-arc" cx="30" cy="30" r="24" fill="none" stroke="#FF6B6F" stroke-width="5" stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="150.8" style="transition: stroke-dashoffset 0.1s linear;"/>
        </svg>
      </div>

      <!-- Post-Celebration Number Screen -->
      <div id="l1-number-screen" style="display:none; position:absolute; inset:0; flex-direction:column; align-items:center; justify-content:center; background: transparent; z-index: 6;">
         <h1 id="l1-num-text" style="font-family: var(--font-display); font-size: clamp(3rem, 7vw, 6rem); color: white; text-shadow: 0 0 30px rgba(0,0,0,0.6); animation: num-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;"></h1>
      </div>

      <!-- Celebration Screen (Superb!) -->
      <div id="l1-celebration" style="opacity:0; pointer-events:none; position:absolute; inset:0; display:flex; justify-content:center; align-items:center; z-index: 5; transition: opacity 0.3s ease;">
        <span id="l1-celeb-word" style="font-family: var(--font-display); font-size: clamp(3.5rem, 8vw, 6rem); font-weight: 900; color: #fff; text-shadow: 0 4px 30px rgba(0,0,0,0.6), 0 0 60px rgba(255,107,111,0.5); animation: celeb-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;"></span>
      </div>

      <!-- UI Controls (Matches user screenshots) -->
      <button class="ob-ctrl ob-ctrl--close" id="l1-close" style="position: absolute; top: 15px; left: 15px; width: 32px; height: 32px; border-radius: 50%; border: none; background: #6c5ce7; font-weight: bold; color: white; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">✕</button>
      <button class="ob-ctrl ob-ctrl--pause" id="l1-pause" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 44px; height: 44px; border-radius: 50%; border: none; background: #6c5ce7; font-size: 1.2rem; color: white; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">⏸</button>
      <button class="ob-ctrl ob-ctrl--help" id="l1-help" style="position: absolute; bottom: 20px; right: 20px; width: 36px; height: 36px; border-radius: 50%; border: none; background: #6c5ce7; font-weight: bold; color: white; cursor: pointer; display:flex; align-items:center; justify-content:center; font-style: italic; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">?</button>
    `;

    document.getElementById('player-frame').appendChild(overlay);

    // Event listeners
    document.getElementById('l1-close').addEventListener('click', () => {
      gameState.transitionTo('level0');
    });

    renderStep();
  }


  // ── RENDER STEP ───────────────────────────────────────────
  function renderStep() {
    phase = 'waiting';
    stableCount = 0;
    window.stopAllSounds?.();
    gameState.hideConfetti();

    // Reset visual layers
    document.getElementById('l1-celebration').style.opacity = '0';
    document.getElementById('l1-number-screen').style.display = 'none';
    document.getElementById('l1-content').style.display = 'flex';
    document.getElementById('l1-hold-ring').style.display = 'flex';
    updateArc(0);

    const step = STEPS[currentStep];
    // Update Text & Emoji Placeholder
    document.getElementById('l1-title').innerHTML = step.title.replace(/\n/g, '<br>');
    document.getElementById('l1-emoji').textContent = step.emoji;

    // Play Voice Audio for the instruction
    if (step.instructionAudio && window.sounds && sounds[step.instructionAudio]) {
      sounds[step.instructionAudio].currentTime = 0;
      sounds[step.instructionAudio].play().catch(e => console.log('Audio error:', e));
    }
  }

  function updateArc(frames) {
    const arc = document.getElementById('l1-ring-arc');
    if (!arc) return;
    const progress = Math.min(frames / FRAMES_TO_CONFIRM, 1);
    arc.style.strokeDashoffset = 150.8 * (1 - progress);
  }


  // ── CELEBRATE & TRANSITIONS ───────────────────────────────
  function onCelebrate() {
    phase = 'celebrating';
    stableCount = 0;
    const step = STEPS[currentStep];

    window.stopAllSounds?.();

    // Trigger visual confetti overlay 
    gameState.showConfetti();
    document.getElementById('l1-celebration').style.opacity = '1';

    // Pick wording
    const word = step.numberText ? "SUPERB!" : "AMAZING!";
    document.getElementById('l1-celeb-word').textContent = word;

    // Play Voice Audio (For actual counting phases)
    if (step.numberAudio && window.sounds && sounds[step.numberAudio]) {
      sounds[step.numberAudio].currentTime = 0;
      sounds[step.numberAudio].play().catch(e => console.log('Audio error:', e));
    }

    // Wait for Confetti to finish, then either show the "THIS IS X" screen or advance directly
    transitionTimer = setTimeout(() => {
      if (step.numberText) {
        showNumberScreen();
      } else {
        advanceStep();
      }
    }, CELEBRATION_DURATION);
  }

  function showNumberScreen() {
    phase = 'showing_number';
    gameState.hideConfetti();
    document.getElementById('l1-celebration').style.opacity = '0';

    // Isolate the number view
    document.getElementById('l1-content').style.display = 'none';
    document.getElementById('l1-hold-ring').style.display = 'none';

    const numScr = document.getElementById('l1-number-screen');
    numScr.style.display = 'flex';
    document.getElementById('l1-num-text').textContent = STEPS[currentStep].numberText;

    // Optional: play an audio track here later for "This is one"

    transitionTimer = setTimeout(() => {
      advanceStep();
    }, NUMBER_SHOW_DURATION);
  }

  function advanceStep() {
    currentStep++;
    if (currentStep >= STEPS.length) {
      // Done with sequential counting -> Move to Level 2 (Testing)
      gameState.transitionTo('level2');
    } else {
      renderStep();
    }
  }


  // ── FRAME UPDATE ──────────────────────────────────────────
  function update(fingerCount, handsCount) {
    // Only detect during the waiting phase
    if (phase !== 'waiting') return;

    const step = STEPS[currentStep];
    const isGestureMatched = step.detect(fingerCount, handsCount);

    if (isGestureMatched) {
      stableCount++;
      updateArc(stableCount);

      if (stableCount >= FRAMES_TO_CONFIRM) {
        onCelebrate();
      }
    } else {
      // Fast decay but gentle enough to ignore 1 frame jumps
      stableCount = Math.max(0, stableCount - 1);
      updateArc(stableCount);
    }
  }


  // ── PUBLIC EXPORTS ────────────────────────────────────────
  return {
    onEnter() {
      currentStep = 0;
      createOverlay();
    },
    update,
    onExit() {
      if (transitionTimer) clearTimeout(transitionTimer);
      gameState.hideConfetti();
      overlay?.remove();
      overlay = null;
    },
  };

})();
