"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import useSound from "use-sound";

interface AudioContextType {
  isPlayingBGM: boolean;
  toggleBGM: () => void;
  forcePlayBGM: () => void; // New method
  stopBGM: () => void;
  volume: number;
  setVolume: (v: number) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
  isGameActive: boolean;
  setGameActive: (active: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlayingBGM, setIsPlayingBGM] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isGameActive, setGameActive] = useState(false);
  const [hasStartedManual, setHasStartedManual] = useState(false); // Track if user intentionally played

  // Load initial settings
  useEffect(() => {
    const savedMuted = localStorage.getItem("numiMuted") === "true";
    const savedVolume = parseFloat(localStorage.getItem("numiVolume") || "0.8");
    const savedPlayState = localStorage.getItem("numiPlayingBGM") === "true";
    
    setMuted(savedMuted);
    setVolume(savedVolume);
    setHasStartedManual(savedPlayState);
  }, []);

  // Update game state window variables for level logic
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).numiMuted = muted;
      (window as any).numiVolume = volume;
      localStorage.setItem("numiMuted", String(muted));
      localStorage.setItem("numiVolume", String(volume));
      localStorage.setItem("numiPlayingBGM", String(isPlayingBGM));
      
      window.dispatchEvent(
        new CustomEvent("numiVolumeChange", { detail: { volume, muted } })
      );
    }
  }, [muted, volume, isPlayingBGM]);

  const effectiveBGMVolume = muted ? 0 : (isGameActive ? volume * 0.3 : volume);

  const [playBGM, { pause: pauseBGM, sound }] = useSound("/audio/bgm.mp3", {
    loop: true,
    volume: 0.8,
    onplay: () => setIsPlayingBGM(true),
    onpause: () => setIsPlayingBGM(false),
    onstop: () => setIsPlayingBGM(false),
    html5: true, 
  });

  // Consolidated BGM Lifecycle Management
  // 1. Initial play attempt on mount
  useEffect(() => {
    // Only autoplay if it was playing before or if it's the first time and not muted
    const savedPlayState = localStorage.getItem("numiPlayingBGM");
    const shouldPlay = savedPlayState === null ? !muted : savedPlayState === "true";
    
    if (shouldPlay && !muted && !isPlayingBGM) {
      playBGM();
    }
  }, [playBGM]);

  // 2. Sync volume reactively (Handles smooth volume changes without restarting playback)
  useEffect(() => {
    if (sound) {
      sound.volume(effectiveBGMVolume);
    }
  }, [effectiveBGMVolume, sound]);

  const forcePlayBGM = () => {
    // Only force play if it's supposed to be playing (respect user manual pause)
    const savedPlayState = localStorage.getItem("numiPlayingBGM");
    const shouldPlay = savedPlayState === null ? !muted : savedPlayState === "true";

    if (shouldPlay && !muted && !isPlayingBGM) {
      playBGM();
    }
  };

  const toggleBGM = () => {
    if (isPlayingBGM) {
      pauseBGM();
      localStorage.setItem("numiPlayingBGM", "false");
    } else {
      if (muted) setMuted(false);
      playBGM();
      localStorage.setItem("numiPlayingBGM", "true");
    }
  };

  const stopBGM = () => {
    if (isPlayingBGM) pauseBGM();
  };

  // --- Idle Timer Logic ---
  // Automatically pause BGM after 1 minute of no interaction, and resume on return
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasIdlePausedRef = useRef(false);
  const IDLE_LIMIT = 1 * 60 * 1000; // 1 minute

  const handleUserActivity = () => {
    // 1. Resume if it was paused by the idle timer
    if (wasIdlePausedRef.current) {
      if (!muted) {
        playBGM();
        localStorage.setItem("numiPlayingBGM", "true");
      }
      wasIdlePausedRef.current = false;
    }

    // 2. Reset the idle timer
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (isPlayingBGM) {
        pauseBGM();
        wasIdlePausedRef.current = true;
        localStorage.setItem("numiPlayingBGM", "false");
      }
    }, IDLE_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
    events.forEach(event => window.addEventListener(event, handleUserActivity));
    
    // Custom event for game-specific activity (like camera hand detection)
    window.addEventListener("numi:activity", handleUserActivity);

    // Start the initial timer
    handleUserActivity();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      window.removeEventListener("numi:activity", handleUserActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isPlayingBGM, muted]); // Need these in deps to ensure handleUserActivity has latest closure state

  // 3. Respond to explicit mute/unmute state changes
  useEffect(() => {
    if (muted && isPlayingBGM) {
      pauseBGM();
    } else if (!muted && !isPlayingBGM) {
      playBGM();
    }
  }, [muted]);

  return (
    <AudioContext.Provider value={{ 
      isPlayingBGM, 
      toggleBGM, 
      forcePlayBGM, // Expose forcePlayBGM
      stopBGM, 
      volume, 
      setVolume, 
      muted, 
      setMuted,
      isGameActive,
      setGameActive
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
