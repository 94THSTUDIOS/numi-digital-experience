"use client";

import Link from "next/link";
import { useState } from "react";

export function TopNavbar() {
    // State for mobile menu if needed later
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="hidden md:flex items-center gap-8 lg:gap-12 font-extrabold text-black text-sm lg:text-lg tracking-tight uppercase">
                <Link href="/about" className="hover:opacity-70 transition-opacity">
                    About
                </Link>
                <Link href="/team" className="hover:opacity-70 transition-opacity">
                    Our Team
                </Link>
                <Link
                    href="/play"
                    className="bg-[#EF5A00] text-white px-6 py-2.5 lg:px-8 lg:py-3 rounded-full hover:scale-105 transition-transform shadow-sm"
                >
                    Let&apos;s Play!
                </Link>
            </div>

            {/* MOBILE MENU BUTTON & DROPDOWN (Visible only on small screens) */}
            <div className="md:hidden flex items-center">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="font-extrabold text-black uppercase tracking-wide px-4 py-2 border-2 border-black rounded-full"
                >
                    Menu
                </button>
            </div>

            {/* Placeholder for mobile dropdown if added later */}
            {isMobileMenuOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-[#F9F6EA] border-t-2 border-black flex flex-col p-6 gap-6 shadow-xl md:hidden">
                    <Link href="/about" className="font-extrabold text-lg uppercase">About</Link>
                    <Link href="/team" className="font-extrabold text-lg uppercase">Our Team</Link>
                    <Link href="/play" className="bg-[#EF5A00] text-white font-extrabold text-lg uppercase text-center py-3 rounded-full">Let&apos;s Play!</Link>
                </div>
            )}
        </nav>
    );
}
