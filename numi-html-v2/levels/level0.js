// ============================================================
// NUMI — Level 0: Onboarding
// levels/level0.js
//
// An HTML overlay added on top of the p5 camera canvas.
// Guides the user through 3 hand exercises before Level 1.
//
// Each step has 3 phases:
//   waiting     → hands white, waiting for gesture
//   detected    → hands turn coral/pink (gesture recognised)
//   celebrating → white flash + Lottie confetti + word
// ============================================================

const level0 = (() => {

  // ── STEP DEFINITIONS ──────────────────────────────────────
  // Each step defines the text shown and the gesture needed to advance.

  const STEPS = [
    {
      title: "LET'S SEE YOUR\nCOUNTING HANDS!",
      subtitle: "Show your hands to the camera",
      celebration: "GOOD JOB!",
      // Advance when at least one hand is visible
      detect: (fingerCount, handsCount) => handsCount >= 2 && fingerCount >= 5,

    },


    {
      title: "NOW LET'S MOVE\nTHOSE FINGERS",
      subtitle: "Move your fingers as shown",
      celebration: "AMAZING!",

      // Movement tracking state
      _lastCount: -1,
      _energy: 0,

      // Advance when fingers actively open and close
      detect(fingerCount, handsCount) {
        if (handsCount < 1) {
          this._energy = 0;
          this._lastCount = -1;
          return false;
        }

        if (this._lastCount === -1) {
          this._lastCount = fingerCount;
        }

        // If finger count changes, add "energy" to the movement detector
        // INCREASED: Adds much more energy per finger movement so small wiggles count big
        if (fingerCount !== this._lastCount) {
          const diff = Math.abs(fingerCount - this._lastCount);
          this._energy += diff * 30; 
          this._lastCount = fingerCount;
        } else {
          // SLOWER: Passive decay is cut in half so they are forgiven for pausing
          this._energy = Math.max(0, this._energy - 0.5);
        }

        // INCREASED: Cap the energy higher so a single confident movement 
        // can sustain the test duration (55 frames) without them needing to move continuously
        this._energy = Math.min(this._energy, 80);

        // LOWERED: Threshold for triggering the "detected" state is reduced
        return this._energy > 10;
      }
    },
    {
      title: "NOW FLIP\nYOUR HANDS!",
      subtitle: "Flip your hands as shown",
      celebration: "SUPERB!",

      _startSign: 0,
      _flips: 0,
      _lastSign: 0,

      detect(fingerCount, handsCount, hands) {
        // Must have at least one hand geometry to calculate orientation
        if (handsCount < 1 || !hands || hands.length === 0) {
          this._startSign = 0;
          this._flips = 0;
          return false;
        }

        const hand = hands[0];
        const kps = hand.keypoints;
        if (!kps || kps.length < 21) return false;

        // Use the middle finger MCP and wrist to define the hand's "up" axis
        const wrist = kps[0];
        const midMcp = kps[9];
        const thumbTip = kps[4];

        const axX = midMcp.x - wrist.x;
        const axY = midMcp.y - wrist.y;

        // Rotate 90 degrees to get the sideways palm axis
        const sideX = axY;
        const sideY = -axX;

        // Project the thumb tip onto the sideways axis
        const tipProj = (thumbTip.x - wrist.x) * sideX + (thumbTip.y - wrist.y) * sideY;

        // Add a deadzone (e.g. 15 pixels) to avoid noisy flickering when hand is sideways
        if (Math.abs(tipProj) < 15) return false;

        // The sign tells us which side of the hand the thumb is on. 
        // Fliping the hand over perfectly reverses this sign!
        const currentSign = Math.sign(tipProj);

        if (this._startSign === 0) {
          // Initialization frame
          this._startSign = currentSign;
          this._lastSign = currentSign;
          this._flips = 0;
          return false;
        }

        // Detect a state transition (a physical flip)
        if (currentSign !== this._lastSign) {
          this._flips++;
          this._lastSign = currentSign;
        }

        // Trigger completion if we've flipped twice: Original -> New -> Original
        return this._flips >= 2;
      }
    },
  ];



  // ── TIMING ────────────────────────────────────────────────
  // Timing constants
  const FRAMES_TO_DETECT = 20;     // ~0.3s held → turns pink
  const FRAMES_TO_CONFIRM = 55;    // ~1.0s held total → triggers celebration
  const CELEBRATION_DURATION_MS = 2500;

  // ── INTERNAL STATE ─────────────────────────────────────────
  let overlay = null;
  let currentStep = 0;
  let phase = 'waiting'; // 'waiting' | 'detected' | 'celebrating' | 'done'
  let stableCount = 0;
  let celebTimer = null;


  // ══════════════════════════════════════════════════════════
  // DOM CONSTRUCTION
  // The overlay is injected inside #player-frame so it sits
  // directly over the p5 canvas with position:absolute.
  // ══════════════════════════════════════════════════════════

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'ob-overlay';

    overlay.innerHTML = `

      <!-- ── MAIN INSTRUCTION CONTENT ── -->
      <div class="ob-content" id="ob-content">

        <!-- Step progress dots -->
        <div class="ob-progress" id="ob-progress">
          ${STEPS.map((_, i) => `<span class="ob-dot" id="ob-dot-${i}"></span>`).join('')}
        </div>

        <!-- Hand illustrations (SVGs from /images) -->
        <div class="ob-hands" id="ob-hands">
          <img class="ob-hand ob-hand--left"  id="ob-hand-left"  src="images/Hand left.svg"  alt="" />
          <img class="ob-hand ob-hand--right" id="ob-hand-right" src="images/Hand Right.svg" alt="" />
        </div>

        <!-- Instruction text -->
        <h2 class="ob-title"    id="ob-title"></h2>
        <p  class="ob-subtitle" id="ob-subtitle"></p>

      </div>

      <!-- ── CELEBRATION SCREEN ── -->
      <div class="ob-celebration" id="ob-celebration">
        <span class="ob-celeb-word" id="ob-celeb-word"></span>
      </div>

      <!-- ── UI CONTROLS ── -->
      <button class="ob-ctrl ob-ctrl--close" id="ob-close" aria-label="Skip onboarding">✕</button>
      <button class="ob-ctrl ob-ctrl--pause" id="ob-pause" aria-label="Pause">⏸</button>
      <button class="ob-ctrl ob-ctrl--help"  id="ob-help"  aria-label="Help">?</button>
    `;

    // Mount inside the camera player frame (above the canvas)
    document.getElementById('player-frame').appendChild(overlay);

    // Skip button exits onboarding immediately
    document.getElementById('ob-close').addEventListener('click', finish);

    renderStep();
  }


  // ══════════════════════════════════════════════════════════
  // STEP RENDERING
  // ══════════════════════════════════════════════════════════

  function renderStep() {
    const step = STEPS[currentStep];

    window.stopAllSounds?.();

    // Reset phase + stability counter for each new step
    phase = 'waiting';
    stableCount = 0;

    // Show instruction panel, hide celebration
    const contentEl = document.getElementById('ob-content');
    const celebEl = document.getElementById('ob-celebration');

    contentEl.style.display = 'flex';
    contentEl.style.opacity = '0';
    celebEl.classList.remove('ob-celebration--active');

    // Hide lottie confetti between steps
    gameState.hideConfetti();

    // Reset hand tint back to white
    document.getElementById('ob-hand-left').classList.remove('ob-hand--detected');
    document.getElementById('ob-hand-right').classList.remove('ob-hand--detected');

    // Update progress dots
    document.querySelectorAll('.ob-dot').forEach((dot, i) => {
      dot.classList.toggle('ob-dot--active', i === currentStep);
      dot.classList.toggle('ob-dot--done', i < currentStep);
    });

    // Write title — supports \n → <br>
    document.getElementById('ob-title').innerHTML =
      step.title.replace(/\n/g, '<br>');
    document.getElementById('ob-subtitle').textContent = step.subtitle;

    // Fade content in
    requestAnimationFrame(() => {
      contentEl.style.transition = 'opacity 0.35s ease';
      contentEl.style.opacity = '1';
      
      // Play instruction audio when step appears
      if (currentStep === 0 && window.sounds && sounds['greeting']) {
        sounds['greeting'].currentTime = 0;
        sounds['greeting'].play().catch(e => console.log('Autoplay blocked:', e));
      } else if (currentStep === 1 && window.sounds && sounds['move']) {
        sounds['move'].currentTime = 0;
        sounds['move'].play().catch(e => console.log('Autoplay blocked:', e));
      } else if (currentStep === 2 && window.sounds && sounds['flip']) {
        sounds['flip'].currentTime = 0;
        sounds['flip'].play().catch(e => console.log('Autoplay blocked:', e));
      }
    });
  }


  // ══════════════════════════════════════════════════════════
  // PHASE TRANSITIONS
  // ══════════════════════════════════════════════════════════

  function onDetected() {
    phase = 'detected';
    // Turn hands coral/pink to give the child visual confirmation
    document.getElementById('ob-hand-left').classList.add('ob-hand--detected');
    document.getElementById('ob-hand-right').classList.add('ob-hand--detected');
  }

  function onCelebrate() {
    phase = 'celebrating';
    const step = STEPS[currentStep];

    // Hide instruction panel, show white celebration screen
    document.getElementById('ob-content').style.display = 'none';

    const celebEl = document.getElementById('ob-celebration');
    celebEl.classList.add('ob-celebration--active');
    document.getElementById('ob-celeb-word').textContent = step.celebration;

    window.stopAllSounds?.();

    // Fire the Lottie confetti overlay
    gameState.showConfetti();
    
    let waitMs = CELEBRATION_DURATION_MS;

    // Play specific celebration audio depending on the step
    // We dynamically wait for the exact duration of the audio clip so it never gets cut off
    if (currentStep === 0 && window.sounds && sounds['goodjob']) {
      const snd = sounds['goodjob'];
      snd.currentTime = 0;
      snd.play().catch(e => console.log('Autoplay blocked:', e));
      if (!isNaN(snd.duration) && snd.duration > 0) {
          waitMs = Math.max(waitMs, (snd.duration * 1000) + 400);
      }
    } else if (currentStep === 1 && window.sounds && sounds['amazing']) {
      const snd = sounds['amazing'];
      snd.currentTime = 0;
      snd.play().catch(e => console.log('Autoplay blocked:', e));
      if (!isNaN(snd.duration) && snd.duration > 0) {
          waitMs = Math.max(waitMs, (snd.duration * 1000) + 400);
      }
    }

    // After celebration duration (or audio length, whichever is greater), move to next step
    celebTimer = setTimeout(() => {
      currentStep++;
      if (currentStep >= STEPS.length) {
        finish();
      } else {
        renderStep();
      }
    }, waitMs);
  }


  // ══════════════════════════════════════════════════════════
  // FINISH / SKIP
  // ══════════════════════════════════════════════════════════

  function finish() {
    if (phase === 'done') return;
    phase = 'done';

    if (celebTimer) clearTimeout(celebTimer);
    gameState.hideConfetti();

    if (overlay) {
      // Fade out the overlay before removing it
      overlay.classList.add('ob-overlay--exit');
      setTimeout(() => {
        overlay?.remove();
        overlay = null;
      }, 450);
    }

    // Hand off to Level 1
    gameState.transitionTo('level1');
  }


  // ══════════════════════════════════════════════════════════
  // UPDATE — called every p5 frame from gameState.update()
  // ══════════════════════════════════════════════════════════

  function update(fingerCount, handsCount, hands) {
    // Ignore frames while celebrating or done
    if (phase !== 'waiting' && phase !== 'detected') return;

    const step = STEPS[currentStep];
    const triggered = step.detect(fingerCount, handsCount, hands);

    if (triggered) {
      stableCount++;

      // First threshold → turn hands pink
      if (stableCount === FRAMES_TO_DETECT && phase === 'waiting') {
        onDetected();
      }

      // Second threshold → celebrate
      if (stableCount >= FRAMES_TO_CONFIRM && phase === 'detected') {
        onCelebrate();
      }

    } else {
      // Decay slowly so brief flickers don't fully reset the counter
      stableCount = Math.max(0, stableCount - 2);

      // If hands were detected but gesture is abandoned, reset tint
      if (phase === 'detected' && stableCount < FRAMES_TO_DETECT / 2) {
        phase = 'waiting';
        document.getElementById('ob-hand-left').classList.remove('ob-hand--detected');
        document.getElementById('ob-hand-right').classList.remove('ob-hand--detected');
      }
    }
  }


  // ══════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════

  return {
    onEnter() {
      currentStep = 0;
      phase = 'waiting';
      stableCount = 0;
      createOverlay();
    },
    update,
    onExit() {
      if (celebTimer) clearTimeout(celebTimer);
      gameState.hideConfetti();
      overlay?.remove();
      overlay = null;
    },
  };

})();
