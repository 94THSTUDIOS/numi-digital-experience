// ============================================================
// NUMI — Game State Manager
// state.js
//
// PURPOSE:
//   This file is the "traffic controller" of the whole app.
//   It knows which level is currently active and routes every
//   frame of hand data to that level.
//
// CHANGE FROM ORIGINAL:
//   The original sketch.js was a monolith — all level logic
//   (drawing the UI, handling gestures, playing audio) lived
//   directly inside the draw() loop. Adding a new level meant
//   touching the core camera/AI code.
//
//   Now sketch.js is a thin shell that knows nothing about levels.
//   It just calls gameState.update() every frame. This file
//   decides what to do with that data based on which level is
//   currently active.
//
// HOW IT WORKS (the Revealing Module Pattern):
//   The entire file is an IIFE (Immediately Invoked Function
//   Expression): (() => { ... })()
//   This means the code runs immediately, creates private variables,
//   and returns only the public functions we want to expose.
//   The result is stored in the global `gameState` variable.
//
// LEVEL CONTRACT:
//   For gameState to manage a level, that level must expose:
//     { onEnter(), update(fingerCount, handsCount, hands), onExit() }
//   gameState calls these at the right moments automatically.
// ============================================================

window.gameState = (() => {

  // ── PRIVATE STATE ────────────────────────────────────────
  // These variables are internal to this module.
  // Nothing outside this file can read or modify them directly.

  // The key of the currently active level (e.g. 'level0')
  let current = null;

  // A dictionary of all registered level objects.
  // key = level name (string), value = level object
  // Populated by calling gameState.register() in sketch.js setup().
  const levels = {};


  // ── PUBLIC API ───────────────────────────────────────────
  // These functions are returned at the bottom and become
  // accessible as gameState.register(), gameState.transitionTo() etc.

  /**
   * Register a level so it can be transitioned into later.
   * Called once per level inside sketch.js setup(), BEFORE
   * any transition happens.
   *
   * @param {string} name      - e.g. 'level0', 'level1'
   * @param {object} levelObj  - must implement { onEnter, update, onExit }
   */
  function register(name, levelObj) {
    levels[name] = levelObj;
  }

  /**
   * Switch to a different level.
   *
   * Flow:
   *   1. Call onExit() on the level we're leaving  → lets it clean up its DOM
   *   2. Update `current` to the new level name
   *   3. Call onEnter() on the new level → lets it build its UI
   *
   * The ?. (optional chaining) means: only call onExit if it exists.
   * This is defensive coding — a level that doesn't need cleanup
   * can simply not implement onExit() and nothing will crash.
   *
   * @param {string} name - must match a previously registered level key
   */
  function transitionTo(name) {
    if (!levels[name]) {
      console.warn(`[gameState] Level "${name}" is not registered.`);
      return;
    }
    levels[current]?.onExit?.();   // Clean up the outgoing level
    current = name;                 // Switch to the new level
    levels[current]?.onEnter?.();  // Initialise the incoming level
  }

  /**
   * Called every p5 frame from sketch.js draw() — ~60 times/second.
   * Routes the live hand data to whichever level is currently active.
   *
   * CHANGE FROM ORIGINAL:
   *   Originally this only forwarded `fingerCount` and `handsCount`.
   *   We added the `hands` array as a third argument so that levels
   *   can do deep geometric checks on the raw 21 MediaPipe keypoints
   *   (needed for the hand-flip detection in Level 0 Step 3).
   *   Levels that don't need it just ignore the third argument.
   *
   * @param {number} fingerCount - total fingers extended (0–5, capped)
   * @param {number} handsCount  - number of hands detected (0, 1, or 2)
   * @param {Array}  hands       - raw HandPose result array (optional)
   */
  function update(fingerCount, handsCount, hands = null) {
    levels[current]?.update?.(fingerCount, handsCount, hands);
  }

  /** Returns the name of the currently active level (for debugging). */
  function getCurrent() {
    return current;
  }


  // ── CONFETTI HELPERS ─────────────────────────────────────
  // The confetti GIF lives in play.html as <img id="confetti-lottie">.
  // It is hidden (display:none) by default.
  // These two helpers are called by every level's celebrate() function.
  //
  // CHANGE FROM ORIGINAL:
  //   Originally the confetti was a <dotlottie-wc> web component.
  //   The element ID "confetti-lottie" was kept the same when we
  //   switched to a plain <img> GIF, so these helpers needed zero changes.

  let confettiClearTimer = null;

  function showMagicRings() {
    window.dispatchEvent(new CustomEvent('numi:magic-rings', { detail: { active: true } }));

    // Play celebration audio globally (Specific to Magic Rings)
    if (window.sounds && sounds['celeb_magic']) {
      sounds['celeb_magic'].currentTime = 0;
      sounds['celeb_magic'].play().catch(e => console.log('Autoplay blocked:', e));
    }
  }

  function hideMagicRings() {
    window.dispatchEvent(new CustomEvent('numi:magic-rings', { detail: { active: false } }));
  }

  function showConfetti() {
    let el = document.getElementById('confetti-lottie');
    if (el) {
      // Re-assign src with a unique timestamp to forcefully break browser caching
      // This guarantees the GIF animation starts over from frame 1
      const baseUrl = el.src.split('?')[0];
      el.src = baseUrl + '?t=' + new Date().getTime();
      el.style.display = 'block';

      // Auto-hide the GIF before it can loop while long audio finishes
      if (confettiClearTimer) clearTimeout(confettiClearTimer);
      confettiClearTimer = setTimeout(() => {
        el.style.display = 'none';
      }, 2400);      // Assumes confetti GIF is ~2.4s long
    }

    // Play celebration audio globally (Specific to Popper/Confetti)
    if (window.sounds && sounds['celeb_pop']) {
      sounds['celeb_pop'].currentTime = 0;
      sounds['celeb_pop'].play().catch(e => console.log('Autoplay blocked:', e));
    }
  }

  function hideConfetti() {
    const el = document.getElementById('confetti-lottie');
    if (el) el.style.display = 'none';
  }

  // ── EXPOSE PUBLIC API ────────────────────────────────────
  // Only the functions listed here are accessible from outside.
  // `current` and `levels` remain private — nothing can mess with them.
  return { register, transitionTo, update, getCurrent, showConfetti, hideConfetti, showMagicRings, hideMagicRings };

})();
