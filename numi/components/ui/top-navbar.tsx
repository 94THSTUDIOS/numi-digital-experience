"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function TopNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(0.8);

    // Read persisted settings on mount (localStorage is client-only)
    useEffect(() => {
        const savedMuted  = localStorage.getItem("numiMuted")  === "true";
        const savedVolume = parseFloat(localStorage.getItem("numiVolume") || "0.8");
        setMuted(savedMuted);
        setVolume(savedVolume);
        (window as any).numiMuted  = savedMuted;
        (window as any).numiVolume = savedVolume;
    }, []);

    function applyAudio(newVolume: number, newMuted: boolean) {
        (window as any).numiMuted  = newMuted;
        (window as any).numiVolume = newVolume;
        localStorage.setItem("numiMuted",  String(newMuted));
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
        const newMuted  = newVolume === 0;
        setVolume(newVolume);
        setMuted(newMuted);
        applyAudio(newVolume, newMuted);
    }

    const effectiveVolume = muted ? 0 : volume;
    const SpeakerIcon = effectiveVolume === 0
        ? "🔇"
        : effectiveVolume < 0.5
        ? "🔉"
        : "🔊";

    return (
        <nav className="w-full relative bg-transparent flex items-center justify-between px-6 md:px-12 z-20">
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
            <div className="hidden md:flex items-center gap-8 lg:gap-12 font-display font-extrabold text-black text-sm lg:text-lg tracking-tight uppercase">
                <Link href="/about" className="hover:opacity-70 transition-opacity">
                    About
                </Link>
                <Link href="/team" className="hover:opacity-70 transition-opacity">
                    Our Team
                </Link>

                {/* VOLUME CONTROL */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="text-xl hover:scale-110 transition-transform leading-none"
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
                        className="w-20 accent-[#EF5A00] cursor-pointer"
                        aria-label="Volume"
                    />
                </div>

            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center gap-3">
                {/* Mobile volume toggle (mute only — no slider on small screens) */}
                <button
                    onClick={toggleMute}
                    className="text-xl hover:scale-110 transition-transform leading-none"
                    aria-label={muted ? "Unmute" : "Mute"}
                >
                    {SpeakerIcon}
                </button>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="font-extrabold text-black uppercase tracking-wide px-4 py-2 border-2 border-black rounded-full"
                >
                    Menu
                </button>
            </div>

            {/* MOBILE DROPDOWN */}
            {isMobileMenuOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-[#F9F6EA] border-t-2 border-black flex flex-col p-6 gap-6 shadow-xl md:hidden">
                    <Link href="/about" className="font-display font-extrabold text-lg uppercase">About</Link>
                    <Link href="/team" className="font-display font-extrabold text-lg uppercase">Our Team</Link>
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
