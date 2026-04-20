"use client"

// ============================================================
// IMPORTS
// - React hooks (useEffect, useRef) for side effects & DOM refs
// - Link: Next.js client-side navigation (no full page reload)
// - LayoutGroup + motion: Framer Motion for animations
// - TextRotate: auto-rotating text component (cycles through words)
// - Floating / FloatingElement: parallax images that move on mouse hover
// ============================================================
import { useEffect, useRef } from "react"
import Link from "next/link"
import { LayoutGroup, motion } from "framer-motion"
import { TextRotate } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { Player } from "@/components/ui/player"
import { TopNavbar } from "@/components/ui/top-navbar"

// ============================================================
// IMAGE DATA
// Array of Unsplash images used by the floating parallax elements.
// Each object has: url (image source), author, title, and optional link.
// These are referenced by index in the <FloatingElement> blocks below.
// ============================================================
const exampleImages = [
  {
    url: "/images/numi_1.png",
    author: "Numi 1",
    title: "Numi 1",
  },
  {
    url: "/images/numi_2.png",
    author: "Numi 2",
    title: "Numi 2",
  },
  {
    url: "/images/numi_3.png",
    author: "Numi 3",
    title: "Numi 3",
  },
  {
    url: "/images/numi._4png.png",
    author: "Numi 4",
    title: "Numi 4",
  },
  {
    url: "/images/numi_5.png",
    author: "Numi 5",
    title: "Numi 5",
  },
  {
    url: "/images/numi_6.png",
    author: "Numi 6",
    title: "Numi 6",
  },
  {
    url: "/images/numi_7.png",
    author: "Numi 7",
    title: "Numi 7",
  },
  {
    url: "/images/numi_8.png",
    author: "Numi 8",
    title: "Numi 8",
  },
  {
    url: "/images/numi_9.png",
    author: "Numi 9",
    title: "Numi 9",
  },
];

// ============================================================
// LANDING HERO COMPONENT (default export — this IS the homepage)
// Full-screen section with two visual layers:
//   1. Background: Floating parallax images
//   2. Foreground: Two-column layout with text + buttons
// ============================================================
function LandingHero() {
  return (
    <>
      <TopNavbar />
      {/* SECTION WRAPPER — full viewport height, centers everything */}
      <section className="w-full h-screen overflow-hidden md:overflow-visible flex flex-col items-center justify-center relative">
        {/* ======================================================
          PARALLAX FLOATING LAYER (background)
          - sensitivity: how much images move relative to mouse (-0.5 = inverted, subtle)
          - Each <FloatingElement> positions one image absolutely
          - depth: how much parallax offset (higher = more movement)
          - Images fade in with staggered delays (0.5s, 0.7s, 0.9s, etc.)
          ====================================================== */}
        <Floating sensitivity={-0.5} className="h-full">
          {/* Image 0 — top-left, small, slight tilt */}
          <FloatingElement
            depth={0.5}
            className="top-[15%] left-[2%] md:top-[25%] md:left-[5%]"
          >
            <motion.img
              src={exampleImages[0].url}
              alt={exampleImages[0].title}
              className="w-16 sm:w-24 md:w-28 lg:w-32 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] drop-shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          </FloatingElement>

          {/* Image 1 — upper-left, medium, rotated -12deg */}
          <FloatingElement
            depth={1}
            className="top-[0%] left-[8%] md:top-[6%] md:left-[11%]"
          >
            <motion.img
              src={exampleImages[1].url}
              alt={exampleImages[1].title}
              className="w-40 sm:w-48 md:w-56 lg:w-60 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-12 drop-shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            />
          </FloatingElement>

          {/* Image 2 — bottom-left, square, deepest parallax (depth=4) */}
          <FloatingElement
            depth={4}
            className="top-[90%] left-[6%] md:top-[80%] md:left-[8%]"
          >
            <motion.img
              src={exampleImages[2].url}
              alt={exampleImages[2].title}
              className="w-40 sm:w-48 md:w-60 lg:w-64 object-contain -rotate-[4deg] hover:scale-105 duration-200 cursor-pointer transition-transform drop-shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            />
          </FloatingElement>

          {/* Image 3 — top-right */}
          <FloatingElement
            depth={2}
            className="top-[0%] left-[87%] md:top-[2%] md:left-[83%]"
          >
            <motion.img
              src={exampleImages[3].url}
              alt={exampleImages[3].title}
              className="w-40 sm:w-48 md:w-60 lg:w-64 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform drop-shadow-2xl rotate-[6deg]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            />
          </FloatingElement>

          {/* Image 4 — bottom-right, largest, strong rotation */}
          <FloatingElement
            depth={1}
            className="top-[78%] left-[83%] md:top-[68%] md:left-[83%]"
          >
            <motion.img
              src={exampleImages[4].url}
              alt={exampleImages[4].title}
              className="w-44 sm:w-64 md:w-72 lg:w-80 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform drop-shadow-2xl rotate-[19deg]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            />
          </FloatingElement>
        </Floating>{/* END parallax layer */}

        {/* ======================================================
          TWO-COLUMN LAYOUT (foreground, z-50 = above parallax)
          - Stacks vertically on mobile (flex-col)
          - Side-by-side on md+ (md:flex-row)
          - gap-8 = spacing between columns
          ====================================================== */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch w-full max-w-7xl z-50 pointer-events-auto gap-8 px-4">

          {/* ---------- LEFT COLUMN (Image) ---------- */}
          <div className="flex flex-col justify-center items-center flex-1 w-full relative z-50">
            <motion.img
              src="/images/ch3.png"
              alt="Numi Character"
              className="w-full max-w-2xl md:max-w-3xl lg:max-w-[40rem] scale-110 transform rotate-[10deg] object-contain drop-shadow-10xl"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>

          {/* ---------- RIGHT COLUMN (heading, subtitle, buttons) ---------- */}
          <div className="flex flex-col justify-center items-start flex-1">
            {/* ANIMATED HEADING — fades up on load (delay: 0.3s) */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-left w-full justify-start items-start flex-col flex whitespace-pre leading-none font-calendas tracking-tight"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
            >
              {/* Line 1: static text */}
              <span>Make Learning</span>

              {/* Line 2: "learning" + rotating word
                LayoutGroup keeps the layout smooth when the rotating word
                changes width. TextRotate cycles every 3s with spring physics. */}
              <LayoutGroup>
                <motion.span layout className="flex whitespace-pre">
                  <motion.span
                    layout
                    className="flex whitespace-pre"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    Math{" "}
                  </motion.span>
                  <TextRotate
                    texts={[
                      "fun",
                      "easy",
                      "tangible"
                    ]}
                    mainClassName="overflow-hidden pr-3 text-[#0015ff] py-0 pb-2 md:pb-4 rounded-xl"
                    staggerDuration={0.03}
                    staggerFrom="last"
                    rotationInterval={3000}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                </motion.span>
              </LayoutGroup>
            </motion.h1>
            {/* SUBTITLE — fades up on load (delay: 0.5s) */}
            <motion.p
              className="text-sm sm:text-lg md:text-xl lg:text-2xl text-left font-overusedGrotesk pt-2 sm:pt-8 md:pt-10 lg:pt-12"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.5 }}
            >
              Numi turns your fingers into learning tools!
              <br />
              Using smart camera hand tracking, kids can count, explore numbers, and solve simple math problems just by holding up their hands.
            </motion.p>

            {/* CTA BUTTONS — fade up together (delay: 0.7s), scale on hover */}
            <div className="flex flex-row justify-start space-x-4 items-center mt-10 sm:mt-16 md:mt-20 lg:mt-20 text-xs">
              {/* Primary button (dark bg) */}
              <motion.button
                className="sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-background bg-foreground px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3 rounded-full z-20 shadow-2xl font-calendas"
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  delay: 0.7,
                  scale: { duration: 0.2 },
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", damping: 30, stiffness: 400 },
                }}
              >
                <Link href="/play">
                  Start Learning <span className="font-serif ml-1">→</span>
                </Link>
              </motion.button>
            </div>
          </div>{/* END right column */}
        </div>{/* END two-column layout */}
      </section>/* END hero section */
    </>
  )
}

export default LandingHero
