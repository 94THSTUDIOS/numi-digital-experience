"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export function TopNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const soundCheckRef = useRef<HTMLAudioElement | null>(null);

    // Initialize soundcheck audio on mount
    useEffect(() => {
        soundCheckRef.current = new Audio("/audio/soundcheck.mp3");
    }, []);

    // Read persisted settings on mount (localStorage is client-only)
    useEffect(() => {
        const savedMuted = localStorage.getItem("numiMuted") === "true";
        const savedVolume = parseFloat(localStorage.getItem("numiVolume") || "0.8");
        setMuted(savedMuted);
        setVolume(savedVolume);
        (window as any).numiMuted = savedMuted;
        (window as any).numiVolume = savedVolume;
    }, []);

    function applyAudio(newVolume: number, newMuted: boolean) {
        (window as any).numiMuted = newMuted;
        (window as any).numiVolume = newVolume;
        localStorage.setItem("numiMuted", String(newMuted));
        localStorage.setItem("numiVolume", String(newVolume));
        window.dispatchEvent(
            new CustomEvent("numiVolumeChange", { detail: { volume: newVolume, muted: newMuted } })
        );
    }

    function toggleMute() {
        const newMuted = !muted;
        setMuted(newMuted);
        applyAudio(volume, newMuted);
    }

    function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newVolume = parseFloat(e.target.value);
        const newMuted = newVolume === 0;
        setVolume(newVolume);
        setMuted(newMuted);
        applyAudio(newVolume, newMuted);

        // Play feedback sound
        if (soundCheckRef.current && !newMuted) {
            soundCheckRef.current.volume = newVolume;
            soundCheckRef.current.currentTime = 0;
            soundCheckRef.current.play().catch(() => { });
        }
    }

    const effectiveVolume = muted ? 0 : volume;
    const SpeakerIcon = effectiveVolume === 0
        ? "🔇"
        : effectiveVolume < 0.5
            ? "🔉"
            : "🔊";

    return (
        <nav className="w-full relative bg-transparent flex items-center justify-between px-6 md:px-12 z-10">
            {/* LEFT ALIGNED LOGO */}
            <div className="flex-shrink-0">
                <Link href="/" className="block hover:scale-105 transition-transform duration-200">
                    <img
                        src="/images/logo.svg"
                        alt="Numi Logo"
                        className="h-30 md:h-30 lg:h-40 w-auto object-contain"
                    />
                </Link>
            </div>

            {/* RIGHT ALIGNED LINKS */}
            <div className="hidden md:flex items-center gap-8 lg:gap-12 font-display font-black text-black text-lg lg:text-2xl tracking-tight uppercase">
                <Link href="/about" className="hover:opacity-70 transition-opacity">
                    About
                </Link>

                <Link
                    href="/play"
                    className="bg-[#EF5A00] text-white px-8 py-3 rounded-full hover:scale-105 transition-transform duration-200 shadow-lg text-lg lg:text-2xl"
                >
                    Try Numi
                </Link>

                {/* VOLUME CONTROL */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="text-2xl hover:scale-110 transition-transform leading-none"
                        aria-label={muted ? "Unmute" : "Mute"}
                    >
                        {SpeakerIcon}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={effectiveVolume}
                        onChange={handleVolumeChange}
                        className="w-24 accent-[#EF5A00] cursor-pointer"
                        aria-label="Volume"
                    />
                </div>

            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center gap-4">
                <Link
                    href="/play"
                    className="bg-[#EF5A00] text-white px-5 py-2 rounded-full text-sm font-black uppercase tracking-tight shadow-md"
                >
                    Try Numi
                </Link>
                {/* Mobile volume toggle (mute only — no slider on small screens) */}
                <button
                    onClick={toggleMute}
                    className="text-2xl hover:scale-110 transition-transform leading-none"
                    aria-label={muted ? "Unmute" : "Mute"}
                >
                    {SpeakerIcon}
                </button>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="font-black text-black uppercase tracking-wide px-5 py-2.5 border-2 border-black rounded-full text-base"
                >
                    Menu
                </button>
            </div>

            {/* MOBILE DROPDOWN */}
            {isMobileMenuOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-[#FDF0E8] border-t-2 border-black flex flex-col p-8 gap-8 shadow-xl md:hidden">
                    <Link href="/about" className="font-display font-black text-2xl uppercase">About</Link>
                    <Link href="/play" className="font-display font-black text-2xl uppercase text-[#EF5A00]">Try Numi</Link>
                    {/* Mobile volume slider */}
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{SpeakerIcon}</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={effectiveVolume}
                            onChange={handleVolumeChange}
                            className="flex-1 accent-[#EF5A00] cursor-pointer"
                            aria-label="Volume"
                        />
                    </div>
                </div>
            )}
        </nav>
    );
}
