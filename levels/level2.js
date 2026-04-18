// ============================================================
// NUMI — Level 2: Test Counting 1–5
// levels/level2.js
//
// PURPOSE:
//   The assessment stage. The child has learned to count 1–5
//   in Level 1 (guided, sequential). Now they're tested with
//   the same 5 numbers in a RANDOM order, and a score is tracked.
//
// DIFFERENCES FROM LEVEL 1:
//   • Numbers are shuffled (Fisher-Yates algorithm) so the child
//     can't just memorise the sequence
//   • A score badge counts correct answers out of 5
//   • The prompt changes ("How many fingers is this?" instead of
//     "Show me this many fingers!") — the dot grid IS the question
//   • The large numeral is HIDDEN until they get it right
//     (revealing it is the confirmation + reward)
//   • After all 5 rounds, a results screen appears with star ratings
//     and buttons to retry or go back to learning mode
//
// FLOW:
//   onEnter() → shuffle [1,2,3,4,5] into queue[]
//            → render round 0 (queue[0])
//   update()  → check fingerCount === target
//            → celebrate() on hold
//   celebrate() → score++, reveal numeral, confetti, wait 2.5s
//              → roundIndex++ → next round or showResults()
//   showResults() → display score + stars + retry/back buttons
//   onExit()  → clean up DOM + timers
//
// CHANGE FROM ORIGINAL:
//   Entirely new. The original sketch.js had no test/scoring mode.
// ============================================================

const level2 = (() => {

  // ── TIMING ────────────────────────────────────────────────
  // Same hold requirement as Level 1 — 40 frames ≈ 0.67s
  const FRAMES_TO_CONFIRM    = 40;

  // How long (ms) to show the celebration before the next round.
  // CHANGE: Was 1800ms originally. Adjusted to 2500ms for confetti.
  const CELEBRATION_DURATION = 2500;

  // Small delay before the results card fades in, so it doesn't
  // snap in abruptly right after the last celebration.
  const RESULTS_SHOW_DELAY   = 400; // ms


  // ── AUDIO ─────────────────────────────────────────────────
  // Same pattern as Level 1 — plays the spoken number on correct answer.
  // sounds[] is loaded in sketch.js setup() and exposed as a global.
  function playSound(n) {
    if (window.sounds && sounds[n]) {
      sounds[n].currentTime = 0;
      sounds[n].play();
    }
  }


  // ── INTERNAL STATE ─────────────────────────────────────────
  let overlay     = null;
  let queue       = [];   // shuffled array of [1,2,3,4,5] — the round order
  let roundIndex  = 0;    // current position in queue[] (0–4)
  let target      = 1;    // queue[roundIndex] — what the child must show
  let score       = 0;    // correct answers so far (0–5)
  let stableCount = 0;    // consecutive frames fingerCount === target
  let celebrating = false;
  let celebTimer  = null;


  // ── Fisher-Yates Shuffle ──────────────────────────────────
  // Randomises the order of numbers 1–5 at the start of each session.
  //
  // WHY Fisher-Yates and not .sort(() => Math.random() - 0.5)?
  // The Math.random() sort trick is subtly biased — some permutations
  // are more likely than others. Fisher-Yates gives a perfectly uniform
  // random permutation: every arrangement is equally probable.
  //
  // How it works:
  //   Start from the last element. Pick a random index from 0 up to
  //   the current position. Swap those two elements. Move one step left.
  //   Repeat until the whole array is processed.
  function shuffled(arr) {
    const a = [...arr]; // copy so we don't mutate the original
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]; // ES6 destructuring swap
    }
    return a;
  }


  // ══════════════════════════════════════════════════════════
  // DOM CONSTRUCTION
  // Same approach as Level 1: build all the UI in JavaScript
  // and inject it inside #player-frame above the canvas.
  // Destroyed on onExit() via overlay.remove().
  // ══════════════════════════════════════════════════════════

  function createOverlay() {
    overlay    = document.createElement('div');
    overlay.id = 'l2-overlay'; // styled by .l2-overlay in style.css

    overlay.innerHTML = `

      <!-- Round progress dots (5 total, one per round).
           Filled = already completed, highlighted = current round. -->
      <div class="l2-progress" id="l2-progress">
        ${[0,1,2,3,4].map(i => `<span class="l2-dot" id="l2-rdot-${i}"></span>`).join('')}
      </div>

      <!-- Live score badge in the top-right corner.
           The number updates in real time as rounds are completed. -->
      <div class="l2-score-badge" id="l2-score-badge">
        ⭐ <span id="l2-score-val">0</span>/5
      </div>

      <!-- Prompt — changed wording from Level 1.
           In L1: "Show me this many fingers!" (explicit instruction)
           In L2: "How many fingers is this?"  (the dots ARE the question) -->
      <p class="l2-prompt">How many fingers is this?</p>

      <!-- Target numeral — HIDDEN at the start of each round.
           Only revealed (filled in) when the child gets it right.
           This is the key UX difference from Level 1. -->
      <div class="l2-number" id="l2-number"></div>

      <!-- Dot grid: same dice/domino layout as Level 1.
           In L2 it is the primary question, not just a cue. -->
      <div class="l2-dots" id="l2-dots"></div>

      <!-- Stabilisation arc: fills as the child holds the correct pose.
           Same SVG approach as Level 1. -->
      <div class="l2-hold-ring" id="l2-hold-ring">
        <svg viewBox="0 0 60 60" class="l2-ring-svg">
          <circle class="l2-ring-bg"  cx="30" cy="30" r="24"/>
          <circle class="l2-ring-arc" id="l2-ring-arc" cx="30" cy="30" r="24"
                  stroke-dasharray="150.8" stroke-dashoffset="150.8"/>
        </svg>
        <span class="l2-ring-emoji">✋</span>
      </div>

      <!-- Celebration overlay — transparent background so confetti
           plays over the live camera.
           CHANGE: Was white (rgba(255,255,255,0.94)). Now transparent. -->
      <div class="l2-celebration" id="l2-celebration">
        <span class="l2-celeb-word" id="l2-celeb-word"></span>
      </div>

      <!-- Results screen — shown after all 5 rounds complete.
           Hidden initially, fades in after RESULTS_SHOW_DELAY. -->
      <div class="l2-results" id="l2-results">
        <div class="l2-results__card">
          <p  class="l2-results__label">You scored</p>
          <div class="l2-results__score" id="l2-results-score"></div>
          <div class="l2-results__stars" id="l2-results-stars"></div>
          <div class="l2-results__btns">
            <!-- Retry: re-enters level2 with a fresh shuffle -->
            <button class="l2-btn l2-btn--primary"   id="l2-btn-retry">Try again ↺</button>
            <!-- Back to learning: returns to level1 in sequential mode -->
            <button class="l2-btn l2-btn--secondary"  id="l2-btn-learn">Back to learning ←</button>
          </div>
        </div>
      </div>

      <!-- Back button (bottom-left): exits test mode back to learning -->
      <button class="l2-ctrl l2-ctrl--back" id="l2-back" aria-label="Back to learning">←</button>
    `;

    document.getElementById('player-frame').appendChild(overlay);

    // Wire up all buttons to the correct gameState transitions
    document.getElementById('l2-back').addEventListener('click', () => {
      gameState.transitionTo('level1');
    });
    document.getElementById('l2-btn-retry').addEventListener('click', () => {
      // Re-entering level2 triggers onExit then onEnter, re-shuffling the queue
      gameState.transitionTo('level2');
    });
    document.getElementById('l2-btn-learn').addEventListener('click', () => {
      gameState.transitionTo('level1');
    });

    renderRound();
  }


  // ── ROUND RENDERING ───────────────────────────────────────
  // Called at the start of each of the 5 rounds to reset the UI.

  function renderRound() {
    celebrating = false;
    stableCount = 0;

    window.stopAllSounds?.();

    target      = queue[roundIndex]; // pick the number for this round

    // Hide both overlay panels (celebration and results)
    document.getElementById('l2-celebration').classList.remove('l2-celebration--active');
    document.getElementById('l2-results').classList.remove('l2-results--active');
    gameState.hideConfetti();

    // Update the round progress dots
    document.querySelectorAll('.l2-dot').forEach((dot, i) => {
      dot.classList.toggle('l2-dot--done',   i < roundIndex);
      dot.classList.toggle('l2-dot--active', i === roundIndex);
    });

    // Update the live score display
    document.getElementById('l2-score-val').textContent = score;

    // Show the dot grid (the question)
    renderDotGrid(target);

    // Clear the numeral — it stays blank until the child gets it right
    document.getElementById('l2-number').textContent = '';

    // Reset the arc to empty
    const arc = document.getElementById('l2-ring-arc');
    if (arc) arc.style.strokeDashoffset = '150.8';
  }

  // Dice/domino dot layout — identical to Level 1's renderDotGrid.
  // Duplicated here so each level is self-contained (no shared state).
  function renderDotGrid(n) {
    const layouts = {
      1: [[50, 50]],
      2: [[25, 50], [75, 50]],
      3: [[25, 50], [50, 50], [75, 50]],
      4: [[25, 30], [75, 30], [25, 70], [75, 70]],
      5: [[25, 30], [75, 30], [50, 50], [25, 70], [75, 70]],
    };
    const container = document.getElementById('l2-dots');
    container.innerHTML = '';
    (layouts[n] || []).forEach(([left, top]) => {
      const dot       = document.createElement('span');
      dot.className   = 'l2-pip';
      dot.style.left  = `${left}%`;
      dot.style.top   = `${top}%`;
      container.appendChild(dot);
    });
  }

  // Updates the arc fill percentage based on hold duration.
  function updateArc(frames) {
    const arc = document.getElementById('l2-ring-arc');
    if (!arc) return;
    const progress = Math.min(frames / FRAMES_TO_CONFIRM, 1);
    arc.style.strokeDashoffset = 150.8 * (1 - progress);
  }


  // ── CELEBRATION & ROUND ADVANCE ───────────────────────────
  // Called when the child holds the correct finger count long enough.

  // Random celebration words add variety — in L2 they're not tied to
  // specific numbers (unlike L1 where each word matched a number)
  const CELEB_WORDS = ['GREAT!', 'PERFECT!', 'AMAZING!', 'NICE!', 'SUPERB!'];

  function celebrate() {
    celebrating = true;
    score++;           // increment score

    window.stopAllSounds?.();

    playSound(target); // narrate the correct number

    // NOW reveal the large numeral (the reward / confirmation)
    document.getElementById('l2-number').textContent = target;

    // Update the live score badge immediately
    document.getElementById('l2-score-val').textContent = score;

    // Pick a random celebration word (different from L1's fixed mapping)
    const word = CELEB_WORDS[Math.floor(Math.random() * CELEB_WORDS.length)];
    document.getElementById('l2-celeb-word').textContent = word;
    document.getElementById('l2-celebration').classList.add('l2-celebration--active');

    // Show confetti GIF overlay
    gameState.showConfetti();

    // After the celebration window, advance to the next round
    celebTimer = setTimeout(() => {
      roundIndex++;
      if (roundIndex >= 5) {
        showResults(); // all 5 rounds done
      } else {
        renderRound(); // next round
      }
    }, CELEBRATION_DURATION);
  }


  // ── RESULTS SCREEN ────────────────────────────────────────
  // Shown after all 5 rounds. Displays score as text and as stars.

  function showResults() {
    gameState.hideConfetti();
    document.getElementById('l2-celebration').classList.remove('l2-celebration--active');

    // "X out of 5"
    document.getElementById('l2-results-score').textContent = `${score} out of 5`;

    // Star rating: filled stars for correct answers, empty stars for misses.
    // '⭐'.repeat(3) + '☆'.repeat(2) = ⭐⭐⭐☆☆ for a score of 3.
    const stars = '⭐'.repeat(score) + '☆'.repeat(5 - score);
    document.getElementById('l2-results-stars').textContent = stars;

    // Slight delay before fading in the results card so it
    // doesn't snap in abruptly right after the celebration ends
    setTimeout(() => {
      document.getElementById('l2-results').classList.add('l2-results--active');
    }, RESULTS_SHOW_DELAY);
  }


  // ══════════════════════════════════════════════════════════
  // UPDATE — called every p5 frame (~60fps) by gameState
  // ══════════════════════════════════════════════════════════
  // Same logic as Level 1: accumulate stableCount when correct,
  // decay when wrong, trigger celebrate() at the threshold.
  // Also guard against running after all 5 rounds are done.

  function update(fingerCount, handsCount) {
    if (celebrating || roundIndex >= 5) return;

    if (fingerCount === target) {
      stableCount++;
      updateArc(stableCount);
      if (stableCount >= FRAMES_TO_CONFIRM) {
        celebrate();
      }
    } else {
      // Decay gently — same jitter-resistance as Level 1
      stableCount = Math.max(0, stableCount - 1);
      updateArc(stableCount);
    }
  }


  // ══════════════════════════════════════════════════════════
  // PUBLIC API — what gameState can call on this level
  // ══════════════════════════════════════════════════════════

  return {
    onEnter() {
      // Shuffle [1,2,3,4,5] to give a random round order each session
      queue      = shuffled([1, 2, 3, 4, 5]);
      roundIndex = 0;
      score      = 0;
      stableCount = 0;
      celebrating = false;
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
