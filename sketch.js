// ============================================================
// NUMI — Dyscalculia Math Experience
// sketch.js — Hand Tracking + Finger Counting (V1)
// ============================================================


// ── CONFIGURATION ───────────────────────────────────────────
// These are values you can tweak without changing any logic.

// How confident the AI must be that it's seeing a real hand
// (0 = "anything goes", 1 = "100% certain"). Higher = stricter.
const CONFIDENCE_THRESHOLD = 0.75;

// Visual settings for the hand dots
const KEYPOINT_SIZE = 12;
const KEYPOINT_COLOR = [0, 255, 160];    // mint green
const CONNECTION_COLOR = [0, 255, 160, 120]; // mint green, semi-transparent

// ── AUDIO CONFIGURATION ─────────────────────────────────────
// These control WHEN audio plays, not WHAT plays.

// How many consecutive frames the finger count must stay the same
// before we accept it and play audio. This prevents the audio
// from firing during brief flickering (e.g., transitioning
// from 2 to 3 fingers). At 60fps, 30 frames ≈ 0.5 seconds.
const STABLE_FRAMES_REQUIRED = 30;

// Minimum time (in milliseconds) between audio plays.
// Prevents the same number from replaying if the kid holds
// their hand steady. 2000ms = 2 second cooldown.
const AUDIO_COOLDOWN_MS = 2000;

// The lines that connect landmarks to form a "skeleton"
// Each pair is [startIndex, endIndex] using the 21-landmark map.
const CONNECTIONS = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index finger
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle finger
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring finger
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
];


// ── STATE VARIABLES ─────────────────────────────────────────
// These change over time as the sketch runs.

let video;          // the webcam feed
let handPose;       // the ml5 handPose model (our AI)
let hands = [];     // the latest hand detection results from the AI
let fingerCount = 0; // how many fingers are currently held up

// ── AUDIO STATE ─────────────────────────────────────────────
// These track the audio playback system.

// An array that will hold our 5 audio files.
// Index 0 = unused, index 1 = "one", index 2 = "two", etc.
// We use vanilla JavaScript Audio objects (no extra library needed).
let sounds = [];

// Tracks how many consecutive frames the finger count has been
// the same value. Once this reaches STABLE_FRAMES_REQUIRED,
// we consider it a "real" count and play the audio.
let stableFrameCount = 0;

// What the finger count was on the PREVIOUS frame.
// We compare this to the current count to detect changes.
let previousFingerCount = 0;

// The finger count that has been "confirmed" (held long enough).
// This is what actually triggers audio.
let confirmedCount = 0;

// Timestamp (in ms) of when audio last played.
// Used to enforce the cooldown period.
let lastAudioPlayedAt = 0;


// ── PRELOAD ─────────────────────────────────────────────────
// p5.js calls this BEFORE setup(). Everything here must finish
// loading before the sketch starts. This is where we load
// heavy assets like AI models.

function preload() {
    // ml5.handPose() downloads and initializes the hand-tracking
    // neural network. We pass an options object to configure it.
    handPose = ml5.handPose({
        maxHands: 2,           // detect up to 2 hands at once
        flipHorizontal: false, // don't mirror the tracking data
        modelType: "full",     // "full" = more accurate, "lite" = faster
        runtime: "mediapipe",  // the underlying AI engine
    });
}


// ── GOT HANDS (the AI callback) ─────────────────────────────
// This function is called automatically by the AI every time it
// finishes analyzing a video frame. It's NOT called by you.
//
// Think of it like a notification: the AI taps you on the shoulder
// and says "here's what I found" by passing the `results` array.
//
// `results` is the PREDICTIONS ARRAY — a list of detected hands.
// Each hand contains:
//   - confidence: how sure the AI is (0 to 1)
//   - handedness: "Left" or "Right"
//   - keypoints: array of 21 {x, y, name} landmark objects

function gotHands(results) {
    // Filter out low-confidence detections. This is what prevents
    // the AI from mistaking your face, elbow, or shirt pattern
    // for a hand. Only detections above our threshold survive.
    hands = results.filter(hand => hand.confidence > CONFIDENCE_THRESHOLD);
}


// ── SETUP ───────────────────────────────────────────────────
// p5.js calls this ONCE after preload() finishes.
// This is where we "set the stage" — create the canvas, start
// the webcam, and connect the AI to the video feed.

function setup() {
    // Create the drawing surface (640px wide, 480px tall)
    // and place it inside the player-frame container
    let cnv = createCanvas(640, 480);
    cnv.parent('player-frame');

    // Turn on the webcam. createCapture(VIDEO) returns a p5
    // video element that streams from your camera.
    video = createCapture(VIDEO);
    video.size(640, 480);

    // Hide the raw HTML video element — we'll draw the video
    // onto our canvas manually in draw() so we can overlay
    // hand graphics on top of it.
    video.hide();

    // ⭐ START THE AI WATCHER ⭐
    // This is the "top-level listener." You call it ONCE and it
    // runs continuously in the background. Every time the AI has
    // new predictions, it calls gotHands() automatically.
    //
    // Think of it like hitting "record" — from this point on,
    // the AI is always watching the video feed and reporting back.
    handPose.detectStart(video, gotHands);

    // ── LOAD AUDIO FILES ──────────────────────────────────────
    // We create vanilla JavaScript Audio objects for each number.
    // These are NOT p5.js — they're built into every browser.
    //
    // How the mapping works:
    //   sounds[1] = the audio file for "one"   → 1Elevenlabs.mp3
    //   sounds[2] = the audio file for "two"   → 2Elevenlabs.mp3
    //   sounds[3] = the audio file for "three" → 3Elevenlabs.mp3
    //   sounds[4] = the audio file for "four"  → 4Elevenlabs.mp3
    //   sounds[5] = the audio file for "five"  → 5Elevenlabs.mp3
    //
    // The index in the array matches the finger count.
    // So when fingerCount = 3, we play sounds[3]. Simple!

    sounds[1] = new Audio("1Elevenlabs.mp3");
    sounds[2] = new Audio("2Elevenlabs.mp3");
    sounds[3] = new Audio("3Elevenlabs.mp3");
    sounds[4] = new Audio("4Elevenlabs.mp3");
    sounds[5] = new Audio("5Elevenlabs.mp3");
}


// ── DRAW (the render loop) ──────────────────────────────────
// p5.js calls this ~60 times per second, forever.
// Each call = one frame of animation.
//
// The pattern is always:
//   1. Clear the canvas
//   2. Draw the background (webcam feed)
//   3. Draw the hand data on top
//   4. Draw any UI elements

function draw() {
    // 1. Clear everything from the last frame
    background(0);

    // 2. Paint the latest webcam frame onto the canvas
    image(video, 0, 0, width, height);

    // 3. Loop through every hand the AI detected
    //    (remember: `hands` is updated by gotHands() in the background)
    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];

        // Draw the skeleton lines connecting landmarks
        drawConnections(hand);

        // Draw a dot on each of the 21 landmarks
        drawKeypoints(hand);

        // Count how many fingers are up on this hand
        fingerCount = calculateFingers(hand);
    }

    // 4. Check if we should play audio for the current count
    //    (this handles stabilization + cooldown logic)
    checkAndPlayAudio();

    // 5. Show the finger count on screen
    displayFingerCount();
}


// ── DRAW KEYPOINTS ──────────────────────────────────────────
// Draws a colored dot at each of the 21 hand landmarks.
// This is the simplest visualization — it lets you "see"
// exactly what the AI is tracking.

function drawKeypoints(hand) {
    for (let j = 0; j < hand.keypoints.length; j++) {
        let kp = hand.keypoints[j];

        fill(KEYPOINT_COLOR);
        noStroke();
        circle(kp.x, kp.y, KEYPOINT_SIZE);
    }
}


// ── DRAW CONNECTIONS ────────────────────────────────────────
// Draws lines between landmarks to form a hand "skeleton."
// This makes it much easier to see the hand shape vs. just dots.

function drawConnections(hand) {
    let kps = hand.keypoints;

    stroke(CONNECTION_COLOR);
    strokeWeight(2);

    for (let c = 0; c < CONNECTIONS.length; c++) {
        let startIdx = CONNECTIONS[c][0];
        let endIdx = CONNECTIONS[c][1];

        // Only draw if both keypoints exist
        if (kps[startIdx] && kps[endIdx]) {
            line(kps[startIdx].x, kps[startIdx].y,
                kps[endIdx].x, kps[endIdx].y);
        }
    }
}


// ── CALCULATE FINGERS ───────────────────────────────────────
// 🧩 YOUR CHALLENGE: Complete the finger-counting logic!
//
// CONCEPT:
// A finger is "up" if its FINGERTIP is ABOVE its KNUCKLE.
// On screen, "above" means a SMALLER y value (y=0 is the top).
//
// So the test for each finger is:
//   if (tip.y < knuckle.y) → finger is UP
//
// LANDMARK INDICES:
//   Finger    Tip    Knuckle (PIP joint)
//   ──────    ───    ───────
//   Index      8       6
//   Middle    12      10
//   Ring      16      14
//   Pinky     20      18
//   Thumb      4       2  ← (uses x instead of y — see below)
//
// The THUMB is different because it moves sideways, not up/down.
// For the thumb, compare x-positions instead of y.

function calculateFingers(hand) {
    let kps = hand.keypoints;

    // Safety check: make sure we have all 21 keypoints
    if (!kps || kps.length < 21) return 0;

    let count = 0;

    // INDEX FINGER (done for you as an example)
    // Tip = keypoint 8, knuckle = keypoint 6
    // If the tip is higher on screen (smaller y) than the knuckle → it's up!
    if (kps[8].y < kps[6].y) {
        count++;
    }

    // ─── YOUR TURN! ─────────────────────────────────────────
    // Follow the same pattern for the remaining fingers.
    // Use the landmark index table above.

    // MIDDLE FINGER
    //ip = ?, Knuckle = ?
    // if ( ??? ) { count++; }
    if (kps[12].y < kps[10].y) {
        count++;
    }
    // RING FINGER
    if (kps[16].y < kps[14].y) {
        count++;
    }
    // PINKY
    if (kps[20].y < kps[18].y) {
        count++;
    }

    if (kps[2].x < kps[4].x) {
        count++;
    }

    // THUMB (tricky! compare x-positions, not y)
    // Hint: for a right hand, thumb tip.x < thumb knuckle.x when extended
    //       for a left hand, it's the opposite
    // Simpler approach: just check if the distance between tip and knuckle
    // is large enough. Try: abs(kps[4].x - kps[2].x) > 40
    // if ( ??? ) { count++; }

    // ─────────────────────────────────────────────────────────

    return count;
}


// ── DISPLAY FINGER COUNT ────────────────────────────────────
// Shows the current finger count in the top-left corner.
// Later you can replace this with animated visuals, sounds,
// or math prompts for the Numi experience.

function displayFingerCount() {
    // Semi-transparent background box for readability
    fill(0, 0, 0, 160);
    noStroke();
    rect(10, 10, 160, 60, 12);

    // The number
    fill(255);
    textSize(32);
    textAlign(LEFT, TOP);
    text("✋ " + fingerCount, 24, 22);
}


// ── CHECK AND PLAY AUDIO ────────────────────────────────────
// This is the "brain" of the audio system. It answers:
//   "Has the kid been holding up the same number of fingers
//    long enough that we're confident they mean it?"
//
// WHY DO WE NEED THIS?
// Without stabilization, the audio would fire every time the
// finger count flickers — even for a single frame. Imagine
// the kid transitioning from 2 to 3 fingers: for a brief
// moment the AI might read 2, then 1, then 3. Without this
// check, it would say "two! one! three!" rapidly.
//
// THE LOGIC:
// 1. Is the current count the same as last frame? → add to stable counter
// 2. Did the stable counter reach our threshold? → it's confirmed!
// 3. Is the confirmed count different from what we last played? → play it!
// 4. Has enough time passed since the last play? → allow it!

function checkAndPlayAudio() {

    // STEP 1: Is the finger count the same as last frame?
    if (fingerCount === previousFingerCount) {
        // YES — the count hasn't changed. Add one to our stability counter.
        stableFrameCount++;
    } else {
        // NO — the count just changed. Reset the stability counter.
        // We start counting from scratch for this new number.
        stableFrameCount = 0;
    }

    // Remember this frame's count for next frame's comparison.
    previousFingerCount = fingerCount;

    // STEP 2: Has the count been stable long enough?
    if (stableFrameCount === STABLE_FRAMES_REQUIRED) {
        // YES — the kid has been holding this number steady.
        // This is important: we use === (exactly equals) instead of >=
        // so this only triggers ONCE when we first hit the threshold,
        // not every frame after.

        // STEP 3: Is this a new number worth announcing?
        if (fingerCount !== confirmedCount && fingerCount >= 1 && fingerCount <= 5) {

            // STEP 4: Has enough time passed since the last audio?
            let now = millis(); // millis() is a p5.js function that returns
            // the number of milliseconds since the sketch started.

            if (now - lastAudioPlayedAt > AUDIO_COOLDOWN_MS) {
                // All checks passed! Play the audio.
                playFingerAudio(fingerCount);

                // Update our tracking variables
                confirmedCount = fingerCount;
                lastAudioPlayedAt = now;
            }
        }
    }

    // If the hand is removed (0 fingers), reset the confirmed count
    // so that the same number can be played again next time.
    if (fingerCount === 0) {
        confirmedCount = 0;
    }
}


// ── PLAY FINGER AUDIO ───────────────────────────────────────
// Plays the audio file that matches the given finger count.
//
// HOW THE MAPPING WORKS:
//   count = 1  →  sounds[1]  →  "1Elevenlabs.mp3"  →  🔊 "One!"
//   count = 2  →  sounds[2]  →  "2Elevenlabs.mp3"  →  🔊 "Two!"
//   count = 3  →  sounds[3]  →  "3Elevenlabs.mp3"  →  🔊 "Three!"
//   count = 4  →  sounds[4]  →  "4Elevenlabs.mp3"  →  🔊 "Four!"
//   count = 5  →  sounds[5]  →  "5Elevenlabs.mp3"  →  🔊 "Five!"
//
// The array index IS the finger count. That's why this is so simple.

function playFingerAudio(count) {
    // Safety check: make sure the sound exists for this count
    if (sounds[count]) {
        // Reset the audio to the beginning in case it's still playing
        // from a previous trigger. (.currentTime = 0 rewinds it.)
        sounds[count].currentTime = 0;

        // Play it! 🔊
        sounds[count].play();
    }
}