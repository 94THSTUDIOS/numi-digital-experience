"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import '../StaggeredMenu.css'; // <-- Importing your styles!

export default function StaggeredMenu({
    items,
    socialItems,
    logoUrl,
    position = "right",
    menuButtonColor = "#ffffff",
    displayItemNumbering = true,
}: any) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="staggered-menu-wrapper fixed-wrapper"
            data-open={isOpen ? "" : undefined}
            data-position={position}
        >
            <header className="staggered-menu-header pointer-events-none">
                <div className="sm-logo pointer-events-auto">
                    {logoUrl && (
                        <Link href="/">
                            <img src={logoUrl} alt="Logo" className="sm-logo-img !h-20 md:!h-28 !w-auto object-contain" />
                        </Link>
                    )}
                </div>
                <button
                    className="sm-toggle mix-blend-difference pointer-events-auto"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ color: menuButtonColor }}
                >
                    <span className="sm-toggle-textWrap">
                        <span className="sm-toggle-textInner">
                            <span className="sm-toggle-line tracking-widest">{isOpen ? 'CLOSE' : 'MENU'}</span>
                        </span>
                    </span>
                    <span className="sm-icon">
                        <span className="sm-icon-line" style={{ transform: isOpen ? 'translate(-50%, -50%) rotate(45deg)' : 'translate(-50%, -50%) rotate(0deg)', transition: 'transform 0.3s ease' }}></span>
                        <span className="sm-icon-line" style={{ transform: isOpen ? 'translate(-50%, -50%) rotate(-45deg)' : 'translate(-50%, 4px) rotate(0deg)', transition: 'transform 0.3s ease' }}></span>
                    </span>
                </button>
            </header>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: position === "right" ? 100 : -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: position === "right" ? 100 : -100 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="staggered-menu-panel shadow-2xl"
                    >
                        <div className="sm-panel-inner">
                            <ul className="sm-panel-list font-overusedGrotesk" data-numbering={displayItemNumbering ? "" : undefined}>
                                {items.map((item: any, i: number) => (
                                    <motion.li
                                        key={item.label}
                                        initial={{ opacity: 0, x: position === "right" ? 50 : -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: position === "right" ? 50 : -50 }}
                                        transition={{ delay: 0.1 + (i * 0.05), type: "spring" }}
                                    >
                                        <Link
                                            href={item.link}
                                            onClick={() => setIsOpen(false)}
                                            className="sm-panel-item"
                                        >
                                            <span className="sm-panel-itemWrap">
                                                <span className="sm-panel-itemLabel hover:text-[#5227FF]">{item.label}</span>
                                            </span>
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>

                            {socialItems && socialItems.length > 0 && (
                                <div className="sm-socials">
                                    <h4 className="sm-socials-title font-overusedGrotesk">Follow Us</h4>
                                    <ul className="sm-socials-list font-overusedGrotesk border-t border-black/10 pt-4">
                                        {socialItems.map((social: any, i: number) => (
                                            <motion.li
                                                key={social.label}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ delay: 0.2 + (i * 0.05) }}
                                            >
                                                <a href={social.link} className="sm-socials-link hover:text-[#5227FF]">
                                                    {social.label}
                                                </a>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}