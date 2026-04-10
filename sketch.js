let video;
let handPose;
let hands = [];

function preload() {
    handPose = ml5.handPose();
}

function gotHands(results) {
    hands = results;
}

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    handPose.detectStart(video, gotHands);
}

function draw() {
    background(0);

    // draw webcam feed
    image(video, 0, 0, width, height);

    // draw hand keypoints
    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];

        for (let j = 0; j < hand.keypoints.length; j++) {
            let keypoint = hand.keypoints[j];
            fill(0, 255, 0);
            noStroke();
            circle(keypoint.x, keypoint.y, 10);
        }
    }
}