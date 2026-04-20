// ============================================================
// NUMI — Level 1: Learn to Count 1–5
// levels/level1.js
//
// PURPOSE:
//   The first proper learning stage. After completing the onboarding
//   (level0), the child sees a large target number (1 through 5)
//   and must hold up that many fingers to match it.
//
// FLOW:
//   → onEnter()   : resets state, builds the HTML overlay
//   → update()    : called ~60x/sec by gameState; checks if the
//                   current fingerCount matches the target
//   → celebrate() : correct! plays audio, shows confetti, waits 2.5s
//   → next round  : target++ until target > 5 → go to level2
//   → onExit()    : removes overlay, clears any pending timers
//
// CHANGE FROM ORIGINAL:
//   In the original sketch.js monolith, finger counting, drawing,
//   and all level logic were tangled in one draw() loop.
//   This file separates the "learning" experience into a standalone
//   module that sketch.js never needs to know about.
//
// STRUCTURE:
//   This file uses the same Revealing Module Pattern as state.js:
//   const level1 = (() => { ... })()
//   All internal state (target, stableCount, etc.) is private.
//   Only { onEnter, update, onExit } are exposed to gameState.
// ============================================================

const level1 = (() => {

  // ── TIMING ────────────────────────────────────────────────
  // FRAMES_TO_CONFIRM: how many consecutive frames the fingerCount
  // must equal the target before we treat it as a deliberate hold.
  // At 60fps, 40 frames ≈ 0.67 seconds.
  // WHY: Without a hold requirement, any accidental flash of the
  // correct number (e.g. fingers briefly in position while moving)
  // would trigger a celebration. The hold makes it intentional.
  const FRAMES_TO_CONFIRM = 40; // ~0.67 s at 60 fps

  // How long (ms) to show the celebration GIF before advancing.
  // CHANGE: Was 1800ms originally. Tweaked to 2500ms to let the
  //         confetti GIF play through before the next number appears.
  const CELEBRATION_DURATION = 2500;


  // ── AUDIO ─────────────────────────────────────────────────
  // sounds[] is loaded in sketch.js setup().
  // We use `window.sounds` because sketch.js declares it with `var`
  // (making it a global), and we want to be explicit about that.
  //
  // sounds[1] = Audio for "one", sounds[2] = "two", etc.
  // We play sounds[target] to narrate the correct answer.
  function playSound(n) {
    if (window.sounds && sounds[n]) {
      sounds[n].currentTime = 0; // rewind in case it's already playing
      sounds[n].play();
    }
  }


  // ── INTERNAL STATE ─────────────────────────────────────────
  // These variables track the level's progress between frames.
  let overlay = null;  // the HTML overlay <div> we inject
  let target = 1;     // which number the child must show (1–5)
  let stableCount = 0;     // consecutive frames fingerCount === target
  let celebrating = false; // true = celebration phase, ignore input
  let celebTimer = null;  // reference to the setTimeout so we can cancel it


  // ══════════════════════════════════════════════════════════
  // DOM CONSTRUCTION
  // We build all the UI in JavaScript rather than having it in
  // HTML. This way the level is self-contained: it creates its
  // interface when it enters, and destroys it when it exits.
  // The overlay is inserted inside #player-frame (defined in
  // play.html) so it floats above the p5 canvas.
  // ══════════════════════════════════════════════════════════

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'l1-overlay'; // styled by .l1-overlay in style.css

    overlay.innerHTML = `

      <!-- Progress dots: one per number 1–5.
           The active dot is filled; completed dots are dimmed. -->
      <div class="l1-progress" id="l1-progress">
        ${[1, 2, 3, 4, 5].map(n => `<span class="l1-dot" id="l1-dot-${n}"></span>`).join('')}
      </div>

      <!-- Instruction prompt above the big number -->
      <p class="l1-prompt">Show me this many fingers!</p>

      <!-- The large target numeral. Updated by renderStep(). -->
      <div class="l1-number" id="l1-number"></div>

      <!-- Dot grid: dice/domino-style layout to visually reinforce
           the number without relying purely on the numeral symbol.
           Each dot is a <span class="l1-pip"> positioned by renderDotGrid(). -->
      <div class="l1-dots" id="l1-dots"></div>

      <!-- Stabilisation arc: an SVG circle that fills up as the child
           holds the correct number of fingers. Visual progress feedback.
           stroke-dashoffset starts at full (150.8 = full circumference),
           and decreases toward 0 as stableCount approaches FRAMES_TO_CONFIRM. -->
      <div class="l1-hold-ring" id="l1-hold-ring">
        <svg viewBox="0 0 60 60" class="l1-ring-svg">
          <circle class="l1-ring-bg"  cx="30" cy="30" r="24"/>
          <circle class="l1-ring-arc" id="l1-ring-arc" cx="30" cy="30" r="24"
                  stroke-dasharray="150.8" stroke-dashoffset="150.8"/>
        </svg>
        <span class="l1-ring-emoji">✋</span>
      </div>

      <!-- Celebration overlay: fades in on top of the camera when correct.
           CHANGE: background was white (rgba(255,255,255,0.94)).
                   Now transparent so the confetti GIF plays over the camera. -->
      <div class="l1-celebration" id="l1-celebration">
        <span class="l1-celeb-word" id="l1-celeb-word"></span>
      </div>

      <!-- Back button: returns the child to level0 onboarding -->
      <button class="l1-ctrl l1-ctrl--back" id="l1-back" aria-label="Back to onboarding">←</button>
    `;

    // Mount the overlay inside the camera player frame
    document.getElementById('player-frame').appendChild(overlay);

    // Wire up the back button
    document.getElementById('l1-back').addEventListener('click', () => {
      gameState.transitionTo('level0');
    });

    // Show the first step immediately
    renderStep();
  }


  // ── STEP RENDERING ────────────────────────────────────────
  // Called once per target number to reset the UI for a new round.

  function renderStep() {
    celebrating = false;
    stableCount = 0;

    window.stopAllSounds?.();

    // Hide celebration screen, hide confetti
    document.getElementById('l1-celebration').classList.remove('l1-celebration--active');
    gameState.hideConfetti();

    // Update progress dots: done (grey) = already passed, active = current
    document.querySelectorAll('.l1-dot').forEach((dot, i) => {
      const n = i + 1;
      dot.classList.toggle('l1-dot--done', n < target);
      dot.classList.toggle('l1-dot--active', n === target);
      dot.classList.remove('l1-dot--done-current');
    });

    // Show the target number as a large digit
    document.getElementById('l1-number').textContent = target;

    // Render the dice/domino dot grid for this number
    renderDotGrid(target);

    // Reset the arc back to empty
    resetArc();
  }

  // Renders the dice-layout dot grid for a given number.
  // Each position is [left%, top%] percentage coordinates inside
  // the .l1-dots container.
  function renderDotGrid(n) {
    // Standard dice positions for 1–5
    // These match the familiar dot patterns children already know
    const layouts = {
      1: [[50, 50]],
      2: [[25, 50], [75, 50]],
      3: [[25, 50], [50, 50], [75, 50]],
      4: [[25, 30], [75, 30], [25, 70], [75, 70]],
      5: [[25, 30], [75, 30], [50, 50], [25, 70], [75, 70]],
    };

    const container = document.getElementById('l1-dots');
    container.innerHTML = ''; // clear previous dots

    (layouts[n] || []).forEach(([left, top]) => {
      const dot = document.createElement('span');
      dot.className = 'l1-pip';
      dot.style.left = `${left}%`;
      dot.style.top = `${top}%`;
      container.appendChild(dot);
    });
  }

  // Resets the stabilisation arc to "empty" (full dashoffset = invisible arc)
  function resetArc() {
    const arc = document.getElementById('l1-ring-arc');
    if (arc) arc.style.strokeDashoffset = '150.8';
  }

  // Updates the arc fill based on how many frames have been held.
  // progress = 0 → arc empty (dashoffset = 150.8)
  // progress = 1 → arc full (dashoffset = 0)
  function updateArc(frames) {
    const arc = document.getElementById('l1-ring-arc');
    if (!arc) return;
    const progress = Math.min(frames / FRAMES_TO_CONFIRM, 1);
    const circumference = 150.8;
    arc.style.strokeDashoffset = circumference * (1 - progress);
  }


  // ── CELEBRATION ───────────────────────────────────────────
  // Called when stableCount reaches FRAMES_TO_CONFIRM.
  // Picks a word, shows the celebration screen, shows confetti,
  // plays the audio, then waits CELEBRATION_DURATION ms before
  // advancing to the next target number.

  // One word per target number (index 0 = word for number 1)
  const CELEB_WORDS = ['GREAT!', 'NICE!', 'WOW!', 'YES!', 'SUPER!'];

  function celebrate() {
    celebrating = true;         // stop processing input

    window.stopAllSounds?.();

    playSound(target);          // narrate the correct number

    const word = CELEB_WORDS[target - 1]; // pick the celebration word

    // Show the celebration overlay text
    const celebEl = document.getElementById('l1-celebration');
    document.getElementById('l1-celeb-word').textContent = word;
    celebEl.classList.add('l1-celebration--active'); // triggers CSS fade-in

    // Show the confetti GIF overlay (managed by state.js)
    gameState.showConfetti();

    // After the celebration window, advance to the next number (or exit)
    celebTimer = setTimeout(() => {
      target++;
      if (target > 5) {
        // Child has completed all 5 numbers → move to test mode
        gameState.transitionTo('level2');
      } else {
        // Show the next number
        renderStep();
      }
    }, CELEBRATION_DURATION);
  }


  // ══════════════════════════════════════════════════════════
  // UPDATE — called every p5 frame (~60fps) by gameState
  // ══════════════════════════════════════════════════════════
  // This is the core detection loop. Each frame we ask:
  //   "Are the right number of fingers showing right now?"
  // If yes → increment stableCount and update the arc.
  // If no  → decay stableCount slowly (jitter-resistant).
  // When stableCount reaches the threshold → celebrate!

  function update(fingerCount, handsCount) {
    if (celebrating) return; // ignore input during celebration

    if (fingerCount === target) {
      // Correct finger count — accumulate hold time
      stableCount++;
      updateArc(stableCount);

      if (stableCount >= FRAMES_TO_CONFIRM) {
        celebrate();
      }
    } else {
      // Wrong count — decay slowly rather than hard-resetting.
      // WHY: Natural hand jitter can cause a 1-frame glitch where the
      //      count drops. A -1 decay means a single bad frame barely
      //      affects progress. The child doesn't lose all their progress
      //      from a tiny wobble.
      stableCount = Math.max(0, stableCount - 1);
      updateArc(stableCount);
    }
  }


  // ══════════════════════════════════════════════════════════
  // PUBLIC API — what gameState can call on this level
  // ══════════════════════════════════════════════════════════

  return {
    onEnter() {
      // Reset everything and build the overlay fresh each time we enter
      target = 1;     // always start from 1
      stableCount = 0;
      celebrating = false;
      createOverlay();
    },
    update, // exposed so gameState.update() can call it every frame
    onExit() {
      // Cancel any pending celebration timer to prevent a delayed
      // transition firing after we've already moved to another level
      if (celebTimer) clearTimeout(celebTimer);
      gameState.hideConfetti();
      overlay?.remove();   // remove the DOM overlay
      overlay = null;
    },
  };

})();
