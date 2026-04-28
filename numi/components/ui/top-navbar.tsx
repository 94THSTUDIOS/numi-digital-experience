"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { VolumeIcon, type VolumeIconHandle } from "@/components/ui/volume";
import { StarButton } from "@/components/ui/star-button";
import { MusicToggleButton } from "@/components/ui/music-toggle-btn";
import { useAudio } from "@/components/AudioContext";

export function TopNavbar() {
    const { 
        isPlayingBGM, 
        toggleBGM, 
        volume, 
        setVolume, 
        muted, 
        setMuted 
    } = useAudio();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const soundCheckRef = useRef<HTMLAudioElement | null>(null);
    const volumeIconRef = useRef<VolumeIconHandle>(null);

    // Initialize soundcheck audio on mount
    useEffect(() => {
        soundCheckRef.current = new Audio("/audio/soundcheck.mp3");
    }, []);

    // Sync volume icon on state changes
    useEffect(() => {
        if (muted || volume === 0) {
            volumeIconRef.current?.stopAnimation();
        } else {
            volumeIconRef.current?.startAnimation();
        }
    }, [muted, volume]);

    function toggleMute() {
        setMuted(!muted);
    }

    function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume === 0) {
            setMuted(true);
        } else if (muted) {
            setMuted(false);
        }

        // Play feedback sound
        if (soundCheckRef.current && newVolume > 0 && !muted) {
            soundCheckRef.current.volume = newVolume;
            soundCheckRef.current.currentTime = 0;
            soundCheckRef.current.play().catch(() => { });
        }
    }

    const effectiveVolume = muted ? 0 : volume;

    return (
        <nav className="w-full fixed top-0 bg-[#FDF0E8]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 py-3 md:py-5 lg:py-7 z-[100]">

            {/* NAV LOGO SLOT — the flying logo animates here on scroll */}
            <div className="flex-shrink-0">
                <div
                    id="nav-logo-slot"
                    className="h-10 w-24 sm:h-12 sm:w-32 md:h-20 md:w-52 lg:h-24 lg:w-64 xl:h-28 xl:w-72 relative"
                >
                    <Link href="/" className="block h-full w-full">
                        {/* Mobile: compact logo.svg — hidden on md+ */}
                        <img
                            src="/images/logo.svg"
                            alt="Numi"
                            className="block md:hidden h-full w-full object-contain object-left"
                        />
                        {/* Desktop: big logo — hidden on mobile */}
                        <img
                            src="/images/Numi Logo Big.svg"
                            alt="Numi"
                            className="hidden md:block h-full w-full object-contain object-left"
                            id="nav-logo-static"
                        />
                    </Link>
                </div>
            </div>

            {/* RIGHT ALIGNED LINKS — desktop */}
            <div className="hidden md:flex items-center gap-6 lg:gap-10 xl:gap-16 font-display font-black tracking-tight uppercase">
                {/* Background Music Toggle */}
                <div className="flex items-center">
                    <MusicToggleButton isPlaying={isPlayingBGM} onClick={toggleBGM} />
                </div>

                {/* VOLUME CONTROL */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="hover:scale-110 transition-transform leading-none text-[#F45F00]"
                        aria-label={muted ? "Unmute" : "Mute"}
                    >
                        <VolumeIcon ref={volumeIconRef} size={36} />
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={effectiveVolume}
                        onChange={handleVolumeChange}
                        className="w-20 lg:w-28 accent-[#3F6F29] bg-white h-2.5 rounded-full cursor-pointer"
                        aria-label="Volume"
                    />
                </div>

                <Link href="/about" className="text-base lg:text-xl xl:text-2xl text-[#F45F00] hover:opacity-70 transition-opacity">
                    ABOUT
                </Link>

                <StarButton
                    href="/play"
                    className="text-base lg:text-xl xl:text-2xl px-6 lg:px-9 xl:px-[45px] py-3 lg:py-4 xl:py-[18px] font-black uppercase shadow-lg"
                >
                    LET&apos;S PLAY!
                </StarButton>
            </div>

            {/* MOBILE CONTROLS */}
            <div className="md:hidden flex items-center gap-2 sm:gap-3">
                {/* Background Music Toggle */}
                <MusicToggleButton isPlaying={isPlayingBGM} onClick={toggleBGM} />

                <StarButton
                    href="/play"
                    className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-black uppercase tracking-tight shadow-md"
                >
                    LET&apos;S PLAY!
                </StarButton>
                {/* Mobile volume toggle */}
                <button
                    onClick={toggleMute}
                    className="hover:scale-110 transition-transform leading-none text-[#F45F00]"
                    aria-label={muted ? "Unmute" : "Mute"}
                >
                    <VolumeIcon size={30} />
                </button>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="font-black text-black uppercase tracking-wide px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-black rounded-full text-sm sm:text-base"
                >
                    Menu
                </button>
            </div>

            {/* MOBILE DROPDOWN */}
            {isMobileMenuOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-[#FDF0E8] border-t-2 border-black flex flex-col p-6 gap-6 shadow-xl md:hidden">
                    <Link href="/about" className="font-display font-black text-xl uppercase text-[#F45F00]">ABOUT</Link>
                    <StarButton href="/play" className="font-display font-black text-xl uppercase w-fit">LET&apos;S PLAY!</StarButton>
                    {/* Mobile volume slider */}
                    <div className="flex items-center gap-3">
                        <VolumeIcon size={26} className="text-[#F45F00]" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={effectiveVolume}
                            onChange={handleVolumeChange}
                            className="flex-1 accent-[#3F6F29] bg-white h-2 rounded-full cursor-pointer"
                            aria-label="Volume"
                        />
                    </div>
                </div>
            )}
        </nav>
    );
}
