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

const CONFIDENCE_THRESHOLD = 0.65;
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
  // Discard any detections below the confidence threshold
  hands = results.filter(h => h.confidence > CONFIDENCE_THRESHOLD);
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
  sounds['celeb'] = new Audio('audio/TOONPop-Cute_party_popper_po-Elevenlabs.mp3');
  sounds['goodjob'] = new Audio('audio/goodjobfinal.mp3');
  sounds['move'] = new Audio('audio/move.mp3');
  sounds['amazing'] = new Audio('audio/amazing job.mp3');
  sounds['flip'] = new Audio('audio/flip.mp3');

  // Placeholders for Level 1 Sequential Instructions
  sounds['l1_show_hand'] = new Audio('audio/placeholder_l1_show_hand.mp3');
  sounds['l1_make_rock'] = new Audio('audio/placeholder_l1_make_rock.mp3');
  sounds['l1_lift_finger'] = new Audio('audio/placeholder_l1_lift_finger.mp3');
  sounds['l1_lift_another'] = new Audio('audio/placeholder_l1_lift_another.mp3');

  window.stopAllSounds = function () {
    if (!window.sounds) return;
    for (let key in window.sounds) {
      if (window.sounds[key]) {
        window.sounds[key].pause();
        window.sounds[key].currentTime = 0;
      }
    }
  };

  // ── Register all levels then kick off onboarding ──────────
  // Level files must be loaded before sketch.js (see index.html).
  gameState.register('level0', level0);
  gameState.register('level1', level1);
  gameState.register('level2', level2);
  gameState.transitionTo('level0');
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

  // Forward to the active level every frame
  gameState.update(fingerCount, hands.length, hands);
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

  // ── Four main fingers ──────────────────────────────────
  //   Finger   Tip   PIP   MCP
  //   Index     8     6     5
  //   Middle   12    10     9
  //   Ring     16    14    13
  //   Pinky    20    18    17
  if (kps[8].y < kps[6].y - BEND_THRESHOLD && kps[8].y < kps[5].y) count++;
  if (kps[12].y < kps[10].y - BEND_THRESHOLD && kps[12].y < kps[9].y) count++;
  if (kps[16].y < kps[14].y - BEND_THRESHOLD && kps[16].y < kps[13].y) count++;
  if (kps[20].y < kps[18].y - BEND_THRESHOLD && kps[20].y < kps[17].y) count++;

  // ── Thumb: geometric side-projection ──────────────────
  let wrist = kps[0];
  let midMcp = kps[9]; // Middle finger MCP — defines the hand's "up" axis

  let axX = midMcp.x - wrist.x;
  let axY = midMcp.y - wrist.y;
  let axLen = Math.sqrt(axX * axX + axY * axY);

  if (axLen > 1) {
    // Normalise to unit vector
    axX /= axLen;
    axY /= axLen;

    // Rotate 90° → perpendicular "sideways" axis across the palm
    let sideX = axY;
    let sideY = -axX;

    // Project thumb tip (kp4) and thumb MCP (kp2) onto the side axis
    let tipProj = (kps[4].x - wrist.x) * sideX + (kps[4].y - wrist.y) * sideY;
    let mcpProj = (kps[2].x - wrist.x) * sideX + (kps[2].y - wrist.y) * sideY;

    // Thumb is extended if tip is further out from palm centre than its MCP
    if (Math.abs(tipProj) > Math.abs(mcpProj) + BEND_THRESHOLD) count++;
  }

  return count;
}