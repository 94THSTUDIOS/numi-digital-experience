"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import useSound from "use-sound";

interface AudioContextType {
  isPlayingBGM: boolean;
  toggleBGM: () => void;
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

  // Load initial settings
  useEffect(() => {
    const savedMuted = localStorage.getItem("numiMuted") === "true";
    const savedVolume = parseFloat(localStorage.getItem("numiVolume") || "0.8");
    setMuted(savedMuted);
    setVolume(savedVolume);
  }, []);

  // Update game state window variables for level logic
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).numiMuted = muted;
      (window as any).numiVolume = volume;
      localStorage.setItem("numiMuted", String(muted));
      localStorage.setItem("numiVolume", String(volume));
      window.dispatchEvent(
        new CustomEvent("numiVolumeChange", { detail: { volume, muted } })
      );
    }
  }, [muted, volume]);

  const effectiveBGMVolume = muted ? 0 : (isGameActive ? volume * 0.3 : volume);

  const [playBGM, { pause: pauseBGM, sound }] = useSound("/audio/bgm.mp3", {
    loop: true,
    volume: effectiveBGMVolume,
    onplay: () => setIsPlayingBGM(true),
    onpause: () => setIsPlayingBGM(false),
    onstop: () => setIsPlayingBGM(false),
  });

  // Sync volume reactively
  useEffect(() => {
    if (sound) {
      sound.volume(effectiveBGMVolume);
    }
  }, [effectiveBGMVolume, sound]);

  const toggleBGM = () => {
    if (isPlayingBGM) {
      pauseBGM();
    } else {
      if (muted) {
        setMuted(false);
      }
      playBGM();
    }
  };

  const stopBGM = () => {
    if (isPlayingBGM) pauseBGM();
  };

  // If muted via slider/icon, pause BGM visually too if desired, 
  // but usually BGM just goes silent. 
  // The user requested "Muting the site also pauses the music".
  useEffect(() => {
    if (muted && isPlayingBGM) {
      pauseBGM();
    }
  }, [muted]);

  return (
    <AudioContext.Provider value={{ 
      isPlayingBGM, 
      toggleBGM, 
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
