"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { VolumeIcon, type VolumeIconHandle } from "@/components/ui/volume";
import { StarButton } from "@/components/ui/star-button";
import { MusicToggleButton } from "@/components/ui/music-toggle-btn";
import { useAudio } from "@/components/AudioContext";

export function TopNavbar() {
    const pathname = usePathname();
    const isPlayPage = pathname === "/play";

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
        <nav className="w-full fixed top-0 bg-[#FDF0E8]/90 backdrop-blur-md z-[100] py-3 md:py-4 lg:py-5">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16">
                {/* NAV LOGO SLOT — the flying logo animates here on scroll */}
                <div className="flex-shrink-0">
                    <div
                        id="nav-logo-slot"
                        className="h-10 sm:h-12 md:h-14 lg:h-16 xl:h-18 relative flex items-center"
                    >
                        <Link href="/" className="flex items-center h-full">
                            {/* Mobile: compact logo.svg — hidden on md+ */}
                            <img
                                src="/images/logo.svg"
                                alt="Numi"
                                className="block md:hidden h-[85%] w-auto object-contain object-left"
                            />
                            {/* Desktop: big logo — hidden on mobile */}
                            <img
                                src="/images/Numi Logo Big.svg"
                                alt="Numi"
                                className="hidden md:block h-[85%] w-auto object-contain object-left"
                                id="nav-logo-static"
                            />
                        </Link>
                    </div>
                </div>

                {/* RIGHT ALIGNED LINKS — desktop */}
                <div className="hidden md:flex items-center gap-6 lg:gap-10 xl:gap-14 font-display font-black tracking-tight uppercase">
                    {/* Background Music Toggle */}
                    <div className="flex items-center">
                        <MusicToggleButton isPlaying={isPlayingBGM} onClick={toggleBGM} />
                    </div>

                    {/* VOLUME CONTROL */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleMute}
                            className="hover:scale-110 transition-transform leading-none text-[#F45F00] flex items-center justify-center"
                            aria-label={muted ? "Unmute" : "Mute"}
                        >
                            <VolumeIcon ref={volumeIconRef} size={32} />
                        </button>
                        <div className="flex items-center h-full pt-1">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={effectiveVolume}
                                onChange={handleVolumeChange}
                                className="w-20 lg:w-24 accent-[#3F6F29] bg-white h-2 rounded-full cursor-pointer"
                                aria-label="Volume"
                            />
                        </div>
                    </div>

                    <Link href="/about" className="text-base lg:text-lg xl:text-xl text-[#F45F00] hover:opacity-70 transition-opacity whitespace-nowrap">
                        ABOUT
                    </Link>

                    <StarButton
                        href={isPlayPage ? "/" : "/play"}
                        className="text-base lg:text-lg xl:text-xl px-5 lg:px-7 xl:px-[35px] py-2.5 lg:py-3.5 xl:py-[14px] font-black uppercase shadow-lg whitespace-nowrap"
                    >
                        {isPlayPage ? "BACK HOME" : "LET'S PLAY!"}
                    </StarButton>
                </div>

                {/* MOBILE CONTROLS */}
                <div className="md:hidden flex items-center gap-2 sm:gap-3">
                    {/* Background Music Toggle */}
                    <MusicToggleButton isPlaying={isPlayingBGM} onClick={toggleBGM} />

                    <StarButton
                        href={isPlayPage ? "/" : "/play"}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-black uppercase tracking-tight shadow-md whitespace-nowrap"
                    >
                        {isPlayPage ? "BACK" : "PLAY!"}
                    </StarButton>
                    {/* Mobile volume toggle */}
                    <button
                        onClick={toggleMute}
                        className="hover:scale-110 transition-transform leading-none text-[#F45F00]"
                        aria-label={muted ? "Unmute" : "Mute"}
                    >
                        <VolumeIcon size={26} />
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="font-black text-black uppercase tracking-wide px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-black rounded-full text-sm sm:text-base"
                    >
                        Menu
                    </button>
                </div>
            </div>

            {/* MOBILE DROPDOWN */}
            {isMobileMenuOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-[#FDF0E8] border-t-2 border-black flex flex-col p-6 gap-6 shadow-xl md:hidden">
                    <Link href="/about" className="font-display font-black text-xl uppercase text-[#F45F00]">ABOUT</Link>
                    <StarButton href={isPlayPage ? "/" : "/play"} className="font-display font-black text-xl uppercase w-fit">
                        {isPlayPage ? "BACK HOME" : "LET'S PLAY!"}
                    </StarButton>
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
