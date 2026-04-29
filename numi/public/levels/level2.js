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

window.level2 = (() => {

  // ── TIMING ────────────────────────────────────────────────
  // Increased to 50 frames for a longer, more deliberate hold.
  const FRAMES_TO_CONFIRM    = 45;
  const QUIZ_OBJECTS = ['apple', 'basketball', 'bear', 'butterfly', 'car', 'cat', 'dog', 'leaf', 'pencil'];

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
  let currentObj  = 'apple'; // default
  let lastCountAudio = 0; // last spoken finger count
  let stableCount = 0;    // consecutive frames fingerCount === target
  let celebrating = false;
  let isPaused    = false;
  let quizStarted = false;
  let celebTimer  = null;
  let resultsTimer = null;
  let activeAudioOnPause = [];
  let isVoiceOverMuted = false;
  let isQuestionAudioPlaying = false;

  // ── PAUSABLE TIMER ────────────────────────────────────────
  class PausableTimeout {
    constructor(callback, delay) {
      this.callback = callback;
      this.remaining = delay;
      this.resume();
    }
    pause() {
      clearTimeout(this.timerId);
      this.remaining -= Date.now() - this.start;
    }
    resume() {
      if (this.remaining <= 0) return;
      this.start = Date.now();
      clearTimeout(this.timerId);
      this.timerId = setTimeout(this.callback, this.remaining);
    }
    clear() {
      clearTimeout(this.timerId);
    }
  }


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


      <!-- Pause Menu -->
      <div id="l2-pause-menu"
           style="display:none;position:absolute;inset:0;flex-direction:column;
                  align-items:center;justify-content:center;gap:2rem;
                  background:rgba(14, 12, 28, 0.9);backdrop-filter:blur(10px);
                  -webkit-backdrop-filter:blur(10px);z-index:100;">
        <h1 style="font-family:var(--font-display);font-size:clamp(2rem, 10cqmin, 4rem);color:#fff;
                   text-transform:uppercase;letter-spacing:0.1em;margin:0;">Paused</h1>
        
        <div style="display:flex;flex-direction:column;gap:1.5rem;width:260px;">
          <button id="l2-resume"
                  style="font-family:var(--font-display);font-size:clamp(1.2rem, 5cqmin, 1.8rem);font-weight:900;
                         color:white;background:#F6636F;border:none;padding:1cqh 2cqw;
                         border-radius:16px;cursor:pointer;text-transform:uppercase;
                         box-shadow:0 10px 20px rgba(246,99,111,0.3);">
            Resume
          </button>
          <button id="l2-mute-vo"
                  style="font-family:var(--font-display);font-size:clamp(0.8rem, 3cqmin, 1.2rem);font-weight:700;
                         color:#fff;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.2);
                         padding:0.8cqh;border-radius:12px;cursor:pointer;text-transform:uppercase;">
            Mute Voice Over
          </button>
        </div>
      </div>

      <div id="l2-controls" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
                                    display:flex;align-items:center;gap:15px;z-index:20;">
        <button id="l2-skip-back"
                style="width:36px;height:36px;border-radius:50%;border:none;background:rgba(246,99,111,0.6);
                       font-size:1rem;color:white;cursor:pointer;
                       box-shadow:0 2px 8px rgba(0,0,0,0.3);">⏮</button>
        <button id="l2-pause"
                style="width:48px;height:48px;border-radius:50%;border:none;background:#F6636F;
                       font-size:1.4rem;color:white;cursor:pointer;
                       box-shadow:0 4px 12px rgba(0,0,0,0.4);">⏸</button>
      </div>

      <div id="l2-start-menu"
           style="display:flex;position:absolute;inset:0;flex-direction:column;
                  align-items:center;justify-content:center;gap:1rem;
                  background:rgba(26, 26, 46, 0.8);backdrop-filter:blur(4px);
                  -webkit-backdrop-filter:blur(4px);z-index:150;">
        <p style="text-transform:uppercase;letter-spacing:0.1em;font-family:var(--font-sans);
                  font-size:0.875rem;color:rgba(255,255,255,0.6);margin-bottom:0.5rem;">
          Ready to count?
        </p>
        <h1 style="font-family:var(--font-display);font-size:clamp(1.5rem, 8cqmin, 3.5rem);
                   color:#fff;text-align:center;text-transform:none;
                   letter-spacing:0.05em;margin:0;line-height:1.1;margin-bottom:1.5cqh;">
          Let's test your<br/>counting
        </h1>
        
        <button id="l2-start-play"
                style="font-family:var(--font-display);font-size:clamp(1.2rem, 5cqmin, 2rem);font-weight:900;
                       color:white;background:#F6636F;border:none;padding:1.5cqh 4cqw;
                       border-radius:999px;cursor:pointer;text-transform:none;
                       box-shadow:0 15px 30px rgba(246,99,111,0.3);
                       transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);"
                onmouseover="this.style.transform='scale(1.05)';this.style.background='#d44f58'"
                onmouseout="this.style.transform='scale(1)';this.style.background='#F6636F'">
          Play ▶
        </button>
      </div>
    `;

    document.getElementById('player-frame').appendChild(overlay);

    // Wire up all buttons to the correct gameState transitions
    document.getElementById('l2-btn-retry').addEventListener('click', () => {
      // Re-entering level2 triggers onExit then onEnter, re-shuffling the queue
      gameState.transitionTo('level2');
    });
    document.getElementById('l2-btn-learn').addEventListener('click', () => {
      gameState.transitionTo('level1');
    });
    
    document.getElementById('l2-pause').addEventListener('click', togglePause);
    document.getElementById('l2-resume').addEventListener('click', togglePause);
    
    document.getElementById('l2-mute-vo').addEventListener('click', () => {
      isVoiceOverMuted = !isVoiceOverMuted;
      document.getElementById('l2-mute-vo').textContent = isVoiceOverMuted ? 'Unmute Voice Over' : 'Mute Voice Over';
    });
    document.getElementById('l2-skip-back').addEventListener('click', () => {
      window.stopAllSounds?.();
      gameState.transitionTo('level1');
    });

    document.getElementById('l2-start-play').addEventListener('click', () => {
      quizStarted = true;
      document.getElementById('l2-start-menu').style.display = 'none';
      renderRound();
    });

    // Don't render the round until they click Play
    // renderRound(); 
  }

  function togglePause() {
    isPaused = !isPaused;
    const menu = document.getElementById('l2-pause-menu');
    if (!menu) return;

    if (isPaused) {
      menu.style.display = 'flex';
      
      // Pause timers
      if (celebTimer && celebTimer.pause) celebTimer.pause();
      if (resultsTimer && resultsTimer.pause) resultsTimer.pause();

      // Pause audio
      activeAudioOnPause = [];
      if (window.sounds) {
        Object.values(window.sounds).forEach(s => {
          if (s && !s.paused) {
            activeAudioOnPause.push(s);
            s.pause();
          }
        });
      }
    } else {
      menu.style.display = 'none';

      // Resume timers
      if (celebTimer && celebTimer.resume) celebTimer.resume();
      if (resultsTimer && resultsTimer.resume) resultsTimer.resume();

      // Resume audio
      activeAudioOnPause.forEach(s => s.play().catch(()=>{}));
      activeAudioOnPause = [];
    }
  }


  // ── ROUND RENDERING ───────────────────────────────────────
  // Called at the start of each of the 5 rounds to reset the UI.

  function renderRound() {
    celebrating = false;
    stableCount = 0;

    window.stopAllSounds?.();
    if (celebTimer) celebTimer.clear();
    if (resultsTimer) resultsTimer.clear();

    target      = queue[roundIndex]; // pick the number for this round

    // Hide both overlay panels (celebration and results)
    document.getElementById('l2-celebration').classList.remove('l2-celebration--active');
    document.getElementById('l2-results').classList.remove('l2-results--active');
    gameState.hideConfetti();

    // Pick a new random object for this round
    currentObj = QUIZ_OBJECTS[Math.floor(Math.random() * QUIZ_OBJECTS.length)];
    
    // Dictate the question (e.g. "How many cats?")
    if (!isVoiceOverMuted) {
      const qAudio = window.sounds?.['hm' + currentObj];
      if (qAudio) {
        isQuestionAudioPlaying = true;
        qAudio.currentTime = 0;
        qAudio.play().catch(e => {
          console.warn("Audio play blocked:", e);
          isQuestionAudioPlaying = false;
        });
        qAudio.onended = () => {
          isQuestionAudioPlaying = false;
        };
      }
    } else {
      isQuestionAudioPlaying = false;
    }

    // Update the round progress dots
    document.querySelectorAll('.l2-dot').forEach((dot, i) => {
      dot.classList.toggle('l2-dot--done',   i < roundIndex);
      dot.classList.toggle('l2-dot--active', i === roundIndex);
    });

    // Update the live score display
    document.getElementById('l2-score-val').textContent = score;

    // Update the prompt to use the object name with pluralization
    const plurals = {
      'butterfly': 'butterflies',
      'leaf': 'leaves',
      'basketball': 'basketballs'
    };
    // The question is always plural (e.g. "How many leaves?") even if the answer is 1
    const objectNamePlural = (plurals[currentObj] || (currentObj + 's'));
    document.querySelector('.l2-prompt').textContent = `How many ${objectNamePlural}?`;

    // Show the objects in a horizontal row
    renderDotGrid(target);

    // Sync UI with the new round state
    const numberEl = document.getElementById('l2-number');
    numberEl.textContent = '';
    numberEl.style.fontSize = ''; // reset to CSS default (large single digit)
    
    lastCountAudio = 0;
    stableCount = 0;

    // Reset the arc to empty
    const arc = document.getElementById('l2-ring-arc');
    if (arc) arc.style.strokeDashoffset = '150.8';
  }

  // Dice/domino dot layout — identical to Level 1's renderDotGrid.
  // Duplicated here so each level is self-contained (no shared state).
  // Renders countable objects in a horizontal row with proper spacing
  // Renders countable objects in a responsive flex row
  function renderDotGrid(n) {
    const container = document.getElementById('l2-dots');
    container.innerHTML = '';
    
    for (let i = 0; i < n; i++) {
      const img       = document.createElement('img');
      img.src         = `images/quiz/${currentObj}.png`;
      img.style.width = `clamp(60px, 18cqmin, 140px)`; 
      img.style.maxHeight = '25cqh';
      img.style.objectFit = 'contain';
      img.style.filter = 'drop-shadow(0 10px 20px rgba(0,0,0,0.45))';
      container.appendChild(img);
    }
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

    // NOTE: We no longer stop all sounds here so the number voice-over can finish playing

    // Move the confirmation text to the large central numeral
    const plurals = {
      'butterfly': 'butterflies',
      'leaf': 'leaves',
      'basketball': 'basketballs'
    };
    const isSingular = (target === 1);
    const objectName = isSingular ? currentObj : (plurals[currentObj] || (currentObj + 's'));
    const displayObj = objectName.charAt(0).toUpperCase() + objectName.slice(1);
    
    const numberEl = document.getElementById('l2-number');
    // If it's one, use the phrase "1 Leaf" instead of "1 Leaves"
    numberEl.textContent = `${target} ${displayObj}`;
    numberEl.style.fontSize = 'clamp(2rem, 15cqmin, 6rem)'; // slightly smaller for phrases

    // Clear the top question during celebration
    document.querySelector('.l2-prompt').textContent = '';

    // Pick a random celebration word (different from L1's fixed mapping)
    const word = CELEB_WORDS[Math.floor(Math.random() * CELEB_WORDS.length)];
    document.getElementById('l2-celeb-word').textContent = word;
    document.getElementById('l2-celebration').classList.add('l2-celebration--active');

    // Show confetti GIF overlay
    gameState.showConfetti();

    // After the celebration window, advance to the next round
    celebTimer = new PausableTimeout(() => {
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
    resultsTimer = new PausableTimeout(() => {
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
    if (!quizStarted || isPaused || celebrating || roundIndex >= 5) return;

    // Real-time counting audio - let number of fingers = audio triggered
    // Sequential audio: Don't play finger counts until the question narration is done
    if (fingerCount > 0 && fingerCount !== lastCountAudio && fingerCount <= 5 && !isQuestionAudioPlaying) {
      if (!isVoiceOverMuted) {
        playSound(fingerCount);
      }
      lastCountAudio = fingerCount;
    }
    if (fingerCount === 0) {
      lastCountAudio = 0;
    }

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
      isPaused    = false;
      quizStarted = false;
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
