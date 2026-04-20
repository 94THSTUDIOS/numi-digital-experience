"use client";

import { useEffect, useState } from "react";

/**
 * Dynamically loads a script. Setting `async = false` ensures that multiple
 * dynamically appended scripts will execute in the exact order they were added.
 */
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export function Player() {
  const [loaded, setLoaded] = useState(false);
  const [isStarted, setIsStarted] = useState(false); // <--- We need explicit user intent to unlock Audio context!
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const el = document.getElementById("player-frame");
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen:`, err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initScripts = async () => {
      try {
        // Enforce strict load order required by the vanilla game logic:
        // 1. Core libraries
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js");
        await loadScript("https://unpkg.com/ml5@1/dist/ml5.js");

        // 2. Global State manager
        await loadScript("/state.js");

        // 3. Level dependencies
        await loadScript("/levels/level0.js");
        await loadScript("/levels/level1.js");
        await loadScript("/levels/level2.js");

        // 4. Main sketch entry point (initializes p5 canvas in #player-frame and starts camera)
        await loadScript("/sketch.js");

        // Force p5 to evaluate the newly loaded global setup() and draw() functions
        if (typeof window !== "undefined" && (window as any).p5) {
          new (window as any).p5();
        }

        if (isMounted) {
          setLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load required game scripts:", error);
      }
    };

    // ONLY initialize the scripts once the user has explicitly clicked "Start". 
    // This safely passes the browser's "user gesture" check for Audio play().
    if (isStarted) {
      initScripts();
    }

    // Cleanup function when navigating away
    return () => {
      isMounted = false;

      // 1. Stop all audio playback
      if (typeof window !== "undefined" && (window as any).stopAllSounds) {
        (window as any).stopAllSounds();
      }

      // 2. Kill the webcam stream to prevent zombie green lights
      const videos = document.querySelectorAll("video");
      videos.forEach(video => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
        video.remove();
      });

      // 3. Remove the p5 global canvas if it was appended
      const p5canvas = document.getElementById("defaultCanvas0");
      if (p5canvas) p5canvas.remove();

      // 4. Remove active DOM overlays if they were injected into the body/frame
      const overlayIds = ["ob-overlay", "l1-overlay", "l2-overlay"];
      overlayIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });

      // Remove any lingering script tags to prevent issues if navigating back later
      // (Though p5 instances typically need a full reload anyway if not instance mode)
    };
  }, [isStarted]);

  return (
    <div className="player-container w-full max-w-4xl mx-auto flex flex-col items-center gap-4">

      {/* 
        This is the anchor div. 
        Vanilla sketch.js expects an element with id="player-frame" to mount the canvas. 
        Level scripts expect this same ID to inject their HTML overlays.
      */}
      <div
        id="player-frame"
        className={`player-frame relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#242440] ${isFullscreen ? 'w-full h-full aspect-auto' : 'aspect-[4/3] h-[70vh] md:h-[75vh] w-auto max-w-full'} flex shrink-0 items-center justify-center transition-all duration-300 [&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-cover`}
      >
        {!isStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-[#1a1a2e]">
            <button
              onClick={() => setIsStarted(true)}
              className="px-8 py-4 bg-[#5227FF] hover:bg-[#B497CF] hover:scale-105 text-white font-calendas rounded-full transition-all text-xl shadow-lg shadow-[#5227FF]/20"
            >
              Start Camera & Audio
            </button>
            <p className="mt-4 text-white/50 font-sans text-sm">Required to unlock audio playback</p>
          </div>
        )}

        {isStarted && !loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white/70" style={{ background: "rgba(14, 12, 28, 0.5)" }}>
            <div className="w-8 h-8 border-4 border-t-white border-white/20 rounded-full animate-spin mb-4"></div>
            <p className="font-sans text-sm">Loading AI & Camera...</p>
          </div>
        )}

        {/* FULLSCREEN TOGGLE BUTTON */}
        {isStarted && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-[200] p-3 bg-black/40 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-all pointer-events-auto"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              // Minimize Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
            ) : (
              // Maximize Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
            )}
          </button>
        )}

        {/* 
          Confetti anchor. 
          state.js toggleConfetti() looks for this exact ID to display the celebration gif. 
        */}
        <img
          id="confetti-lottie"
          src="/images/confetti v2.gif"
          style={{
            display: 'none',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 20
          }}
          alt="Confetti Celebration"
        />
      </div>
    </div>
  );
}
