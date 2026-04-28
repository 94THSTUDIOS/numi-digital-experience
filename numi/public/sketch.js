// ============================================================
// NUMI — Hand Tracking Core (Thin Shell)
// sketch.js
//
// This file does exactly four things and nothing more:
//   1. Configure + load the ml5 HandPose AI model
//   2. Set up the webcam + p5 canvas
//   3. Count fingers on every frame
//   4. Hand the count to gameState.update()
//
// All level logic (UI, audio, celebrations) lives in:
//   state.js · levels/level0.js · levels/level1.js · levels/level2.js
// ============================================================


// ── CONFIGURATION ───────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.7;
const KEYPOINT_SIZE = 12;
const KEYPOINT_COLOR = [0, 255, 160];       // mint green
const CONNECTION_COLOR = [0, 255, 160, 120];  // mint green, semi-transparent

// BEND_THRESHOLD — minimum pixel gap a fingertip must clear past
// its knuckle before we count it as extended. Prevents flicker.
const BEND_THRESHOLD = 15;

// Skeleton line pairs — [start landmark index, end landmark index]
const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],          // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],          // Index
  [0, 9], [9, 10], [10, 11], [11, 12],     // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],   // Ring
  [0, 17], [17, 18], [18, 19], [19, 20],   // Pinky
];


// ── STATE ───────────────────────────────────────────────────

let video;
let handPose;
let hands = [];
let fingerCount = 0;

// Audio files — indexed by finger count (sounds[1]–sounds[5])
// Referenced globally by level1.js and level2.js via window.sounds
var sounds = [];

// Stability buffer for finger counting
let fingerHistory = [];
const HISTORY_SIZE = 15;


// ── PRELOAD ─────────────────────────────────────────────────
// p5 calls this once before setup(). We load the HandPose model here
// because it can take 1–2 s to initialise (don't block setup).

function preload() {
  handPose = ml5.handPose({
    maxHands: 2,
    flipHorizontal: false, // raw camera coords — CSS mirrors the display
    modelType: 'full',
    runtime: 'mediapipe',
  });
}


// ── GOT HANDS (AI callback) ─────────────────────────────────
// ml5 calls this automatically whenever it finishes processing a frame.

function gotHands(results) {
  // 1. Discard any detections below the confidence threshold
  // 2. Discard any detection that is physically too small (background noise)
  hands = results.filter(h => {
    if (h.confidence < CONFIDENCE_THRESHOLD) return false;

    // Size check: distance from Wrist (kp0) to Middle MCP (kp9)
    const kps = h.keypoints;
    const dHand = dist(kps[0].x, kps[0].y, kps[9].x, kps[9].y);
    return dHand > 35; // 35px is the floor for a 'real' hand detection
  });
}


// ── SETUP ───────────────────────────────────────────────────

function setup() {
  // Create the p5 canvas inside the player frame element
  let cnv = createCanvas(640, 480);
  cnv.parent('player-frame');

  // Webcam capture (hidden — we draw it manually onto the canvas)
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start the continuous AI detection loop
  handPose.detectStart(video, gotHands);

  // Load numbered audio files (index = finger count)
  sounds[1] = new Audio('audio/1Elevenlabs.mp3');
  sounds[2] = new Audio('audio/2Elevenlabs.mp3');
  sounds[3] = new Audio('audio/3Elevenlabs.mp3');
  sounds[4] = new Audio('audio/4Elevenlabs.mp3');
  sounds[5] = new Audio('audio/5Elevenlabs.mp3');
  sounds['greeting'] = new Audio('audio/GreetingElevenLabs.mp3');
  sounds['celeb_pop'] = new Audio('audio/TOONPop-Cute_party_popper_po-Elevenlabs.mp3');
  sounds['celeb_magic'] = new Audio('audio/learn/learn-celeb.mp3');
  sounds['goodjob'] = new Audio('audio/goodjobfinal.mp3');
  sounds['move'] = new Audio('audio/move.mp3');
  sounds['amazing'] = new Audio('audio/amazing job.mp3');
  sounds['flip'] = new Audio('audio/flip.mp3');

  // Level 1 Core Assets
  sounds['l1_show_hand'] = new Audio('audio/learn/learn-1-0.mp3');
  sounds['l1_make_rock'] = new Audio('audio/learn/learn-1-1.mp3');
  sounds['l1_lift_finger'] = new Audio('audio/learn/learn-1-2.mp3');
  sounds['l1_this_is_one'] = new Audio('audio/learn/learn-1-3.mp3');
  sounds['l1_can_you_say_one'] = new Audio('audio/learn/learn-1-4.mp3');

  // Number 2
  sounds['l1_lift_another_2'] = new Audio('audio/learn/learn-2-1.mp3');
  sounds['l1_this_is_two'] = new Audio('audio/learn/learn-2-2.mp3');
  sounds['l1_counting_2'] = new Audio('audio/learn/learn-2-3.mp3');

  // Number 3
  sounds['l1_lift_another_3'] = new Audio('audio/learn/learn-3-1.mp3');
  sounds['l1_this_is_three'] = new Audio('audio/learn/learn-3-2.mp3');
  sounds['l1_counting_3'] = new Audio('audio/learn/learn-3-3.mp3');

  // Number 4
  sounds['l1_lift_another_4'] = new Audio('audio/learn/learn-4-0.mp3');
  sounds['l1_this_is_four'] = new Audio('audio/learn/learn-4-1.mp3');
  sounds['l1_counting_4'] = new Audio('audio/learn/learn-4-2.mp3');

  // Number 5
  sounds['l1_lift_another_5'] = new Audio('audio/learn/learn-5-0.mp3');
  sounds['l1_this_is_five'] = new Audio('audio/learn/learn-5-1.mp3');
  sounds['l1_counting_5'] = new Audio('audio/learn/learn-5-2.mp3');
  sounds['ding'] = new Audio('audio/learn/ding.mp3');

  // Common
  sounds['l1_your_turn'] = new Audio('audio/learn/learn-yourturn.mp3');
  sounds['ready'] = new Audio('audio/Ready.mp3');

  // Quiz Assets
  sounds['hmapple'] = new Audio('audio/quiz/hmapples.mp3');
  sounds['hmball'] = new Audio('audio/quiz/hmballs.mp3');
  sounds['hmbear'] = new Audio('audio/quiz/hmbears.mp3');
  sounds['hmbutterfly'] = new Audio('audio/quiz/hmbutterflies.mp3');
  sounds['hmcar'] = new Audio('audio/quiz/hmcars.mp3');
  sounds['hmcat'] = new Audio('audio/quiz/hmcats.mp3');
  sounds['hmdog'] = new Audio('audio/quiz/hmdogs.mp3');
  sounds['hmleaf'] = new Audio('audio/quiz/hmleaves.mp3');
  sounds['hmpencil'] = new Audio('audio/quiz/hmpencils.mp3');

  window.stopAllSounds = function () {
    if (!window.sounds) return;
    for (let key in window.sounds) {
      if (window.sounds[key]) {
        window.sounds[key].pause();
        window.sounds[key].currentTime = 0;
      }
    }
  };

  // Apply persisted volume settings to all loaded sounds
  function applyVolumeToSounds() {
    const v = (window.numiVolume !== undefined) ? window.numiVolume : 0.8;
    const m = (window.numiMuted !== undefined) ? window.numiMuted : false;
    for (let key in sounds) {
      if (sounds[key]) sounds[key].volume = m ? 0 : v;
    }
  }

  applyVolumeToSounds();

  // Keep in sync whenever the navbar changes volume
  window.addEventListener('numiVolumeChange', (e) => {
    const { volume, muted } = e.detail;
    for (let key in sounds) {
      if (sounds[key]) sounds[key].volume = muted ? 0 : volume;
    }
  });

  // ── Register all levels then kick off onboarding ──────────
  // Level files must be loaded before sketch.js (see index.html).
  gameState.register('level0', level0);
  gameState.register('level1', level1);
  gameState.register('level2', level2);
}


// ── DRAW (called ~60 fps) ───────────────────────────────────

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  // Reset before re-counting (prevents stale count when hand leaves)
  fingerCount = 0;

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    drawConnections(hand);
    drawKeypoints(hand);
    // Accumulate — supports two-hand gestures summing correctly
    fingerCount += calculateFingers(hand);
  }

  // Cap at 5 (current audio set covers 1–5 only)
  fingerCount = min(fingerCount, 5);

  // Update stability history
  fingerHistory.push(fingerCount);
  if (fingerHistory.length > HISTORY_SIZE) fingerHistory.shift();

  // Find the MODE (most frequent value) in our history to prevent flicker
  const counts = {};
  let maxCount = 0;
  let stableFingerCount = fingerCount;

  fingerHistory.forEach(val => {
    counts[val] = (counts[val] || 0) + 1;
    if (counts[val] > maxCount) {
      maxCount = counts[val];
      stableFingerCount = val;
    }
  });

  // Forward the STABLE count to the active level
  gameState.update(stableFingerCount, hands.length, hands);
}


// ── DRAW KEYPOINTS ──────────────────────────────────────────

function drawKeypoints(hand) {
  for (let j = 0; j < hand.keypoints.length; j++) {
    let kp = hand.keypoints[j];
    fill(KEYPOINT_COLOR);
    noStroke();
    circle(kp.x, kp.y, KEYPOINT_SIZE);
  }
}


// ── DRAW CONNECTIONS ────────────────────────────────────────

function drawConnections(hand) {
  let kps = hand.keypoints;
  stroke(CONNECTION_COLOR);
  strokeWeight(2);
  for (let c = 0; c < CONNECTIONS.length; c++) {
    let [a, b] = CONNECTIONS[c];
    if (kps[a] && kps[b]) {
      line(kps[a].x, kps[a].y, kps[b].x, kps[b].y);
    }
  }
}


// ── CALCULATE FINGERS ───────────────────────────────────────
// Returns 0–5: how many fingers are visibly extended on one hand.
//
// FOUR FINGERS — dual-gate y-axis test:
//   Gate 1: tip must clear the PIP (middle knuckle) by BEND_THRESHOLD
//   Gate 2: tip must also sit above the MCP (base knuckle)
//   Both gates prevent half-bent fingers from being counted.
//
// THUMB — handedness-free geometric projection:
//   Instead of relying on ml5's unreliable "Left"/"Right" label,
//   we compute the hand's own sideways axis, project the thumb tip
//   and thumb MCP onto it, then check whether the tip is further
//   out from the palm centre than the MCP.
//
//   EXTENDED: |tipProj| > |mcpProj| + BEND_THRESHOLD  → counts
//   TUCKED:   |tipProj| < |mcpProj|                   → doesn't count

function calculateFingers(hand) {
  const kps = hand.keypoints;
  if (!kps || kps.length < 21) return 0;

  let count = 0;
  const wrist = kps[0];

  // ── Four main fingers: Distance-based logic (Rotation Invariant) ──
  //   Finger   Tip   MCP
  //   Index     8     5
  //   Middle   12     9
  //   Ring     16    13
  //   Pinky    20    17
  const fingers = [
    { tip: 8, mcp: 5 }, { tip: 12, mcp: 9 },
    { tip: 16, mcp: 13 }, { tip: 20, mcp: 17 }
  ];

  fingers.forEach(f => {
    let dTip = dist(wrist.x, wrist.y, kps[f.tip].x, kps[f.tip].y);
    let dMcp = dist(wrist.x, wrist.y, kps[f.mcp].x, kps[f.mcp].y);

    // If the tip is significantly further from the wrist than the knuckle, it's extended.
    // 1.4 is a strict multiplier that ensures fingers are fully outstretched.
    if (dTip > dMcp * 1.4) count++;
  });

  // ── Thumb: geometric side-projection (already robust) ──
  let midMcp = kps[9];
  let axX = midMcp.x - wrist.x;
  let axY = midMcp.y - wrist.y;
  let axLen = Math.sqrt(axX * axX + axY * axY);

  if (axLen > 1) {
    axX /= axLen; axY /= axLen;
    let sideX = axY; let sideY = -axX;
    let tipProj = (kps[4].x - wrist.x) * sideX + (kps[4].y - wrist.y) * sideY;
    let mcpProj = (kps[2].x - wrist.x) * sideX + (kps[2].y - wrist.y) * sideY;
    if (Math.abs(tipProj) > Math.abs(mcpProj) + BEND_THRESHOLD) count++;
  }

  return count;
}