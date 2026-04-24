"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LayoutGroup, motion, AnimatePresence } from "framer-motion"
import { TextRotate } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { Player } from "@/components/ui/player"
import { TopNavbar } from "@/components/ui/top-navbar"
// ============================================================
// LOADING SCREEN
// Full-screen splash shown on first visit. Numbers count up 1–5,
// then the screen slides up to reveal the homepage.
// ============================================================
const NUMBERS = ["1", "2", "3", "4", "5"]

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (current < NUMBERS.length - 1) {
      const t = setTimeout(() => setCurrent(c => c + 1), 350)
      return () => clearTimeout(t)
    } else {
      // All numbers shown — wait a beat then dismiss
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
  }, [current, onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#FDF0E8] gap-6"
      exit={{ y: "-100%", transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
    >
      {/* Logo */}
      <motion.img
        src="/images/logo.svg"
        alt="Numi"
        className="h-20 w-auto object-contain"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Character */}
      <motion.img
        src="/images/ch3.png"
        alt="Numi Character"
        className="h-48 w-auto object-contain"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: [0, -6, 6, -4, 4, 0],
        }}
        transition={{
          opacity: { duration: 0.4 },
          scale: { duration: 0.4 },
          rotate: { duration: 0.8, delay: 0.3, ease: "easeInOut" },
        }}
      />

      {/* Counting numbers */}
      <div className="flex items-center gap-4">
        {NUMBERS.map((n, i) => (
          <motion.span
            key={n}
            className="font-body text-5xl text-[#1A0A08]"
            initial={{ scale: 0, opacity: 0 }}
            animate={i <= current ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            style={{ color: i === current ? "#EF5A00" : "#1A0A08" }}
          >
            {n}
          </motion.span>
        ))}
      </div>

      {/* "Let's count!" label */}
      <motion.p
        className="font-body text-lg text-[#1A0A08]/50 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Let's count!
      </motion.p>
    </motion.div>
  )
}



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
const ROTATE_COLORS = ["#F6636F", "#F45F00", "#3F6F29"] as const

function LandingHero() {
  const [loading, setLoading] = useState(true)
  const [rotateColorIdx, setRotateColorIdx] = useState(0)

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      </AnimatePresence>

      <TopNavbar />
      {/* SECTION WRAPPER — full viewport height, centers everything */}
      <section className="w-full h-screen overflow-hidden md:overflow-visible flex flex-col items-center justify-center relative bg-[#FDF0E8]">
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

          {/* New Image 5 — center-left, light depth */}
          <FloatingElement
            depth={1.5}
            className="top-[55%] left-[0%] md:top-[50%] md:left-[3%]"
          >
            <motion.img
              src={exampleImages[5].url}
              alt={exampleImages[5].title}
              className="w-32 sm:w-40 md:w-48 lg:w-52 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform rotate-[12deg] drop-shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            />
          </FloatingElement>

          {/* New Image 6 — top-center, far back depth */}
          <FloatingElement
            depth={0.3}
            className="top-[2%] left-[45%] md:top-[4%] md:left-[42%]"
          >
            <motion.img
              src={exampleImages[6].url}
              alt={exampleImages[6].title}
              className="w-24 sm:w-32 md:w-36 lg:w-40 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[8deg] drop-shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7 }}
            />
          </FloatingElement>

          {/* New Image 7 — bottom-center, foreground depth */}
          <FloatingElement
            depth={3}
            className="top-[85%] left-[50%] md:top-[88%] md:left-[45%]"
          >
            <motion.img
              src={exampleImages[7].url}
              alt={exampleImages[7].title}
              className="w-36 sm:w-48 md:w-56 lg:w-64 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform rotate-[5deg] drop-shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9 }}
            />
          </FloatingElement>

          {/* New Image 8 — right-side center, medium depth */}
          <FloatingElement
            depth={1.2}
            className="top-[40%] left-[90%] md:top-[45%] md:left-[92%]"
          >
            <motion.img
              src={exampleImages[8].url}
              alt={exampleImages[8].title}
              className="w-28 sm:w-36 md:w-44 lg:w-48 object-contain hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[15deg] drop-shadow-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -14, 0],
                rotate: [10, 12, 8, 10],
              }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut", delay: 0.2 },
                y: {
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: 1,
                },
                rotate: {
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: 1,
                },
              }}
            />
          </div>

          {/* ---------- RIGHT COLUMN (heading, subtitle, buttons) ---------- */}
          <div className="flex flex-col justify-center items-start flex-1">
            {/* ANIMATED HEADING — fades up on load (delay: 0.3s) */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-left w-full justify-start items-start flex-col flex whitespace-pre leading-none font-fredoka tracking-tight"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
            >
              {/* Line 1 — Fredoka */}
              <span className="font-fredoka">Make Learning</span>

              {/* Line 2: "Math " + rotating word
                The invisible sizer span (aria-hidden) locks the container to
                the width of the longest word so the layout never shifts. */}
              <LayoutGroup>
                <motion.span layout className="flex whitespace-pre items-center">
                  <span className="flex whitespace-pre font-fredoka">Math{" "}</span>
                  {/* Sizer: invisible longest word keeps container width constant */}
                  <span className="relative inline-flex items-center">
                    <span
                      className="invisible font-moonbloom font-black pr-3"
                      aria-hidden="true"
                    >
                      tangible
                    </span>
                    {/* Rotating word absolutely fills the sizer */}
                    <span className="absolute inset-0 flex items-center">
                      <span style={{ color: ROTATE_COLORS[rotateColorIdx] }}>
                      <TextRotate
                        texts={[
                          "fun",
                          "easy",
                          "tangible"
                        ]}
                        mainClassName="overflow-hidden pr-3 rounded-xl font-moonbloom font-[800]"
                        staggerDuration={0.03}
                        staggerFrom="last"
                        rotationInterval={3000}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        onNext={(idx) => setRotateColorIdx(idx)}
                      />
                      </span>
                    </span>
                  </span>
                </motion.span>
              </LayoutGroup>
            </motion.h1>
            {/* SUBTITLE — fades up on load (delay: 0.5s) */}
            <motion.p
              className="text-sm sm:text-lg md:text-xl lg:text-2xl text-left font-body pt-2 sm:pt-8 md:pt-10 lg:pt-12"
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
                className="sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-background bg-[#3F6F29] px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3 rounded-full z-20 shadow-2xl font-body"
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
                  Start Learning with Numi <span className="font-serif ml-1">→</span>
                </Link>
              </motion.button>

              {/* Secondary button — scrolls to How it Works */}
              <motion.a
                href="#how-it-works"
                className="sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-foreground border-2 border-foreground px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-3 rounded-full z-20 shadow-md font-body"
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: 0.8 }}
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", damping: 30, stiffness: 400 },
                }}
              >
                How it works ✋
              </motion.a>
            </div>
          </div>{/* END right column */}
        </div>{/* END two-column layout */}
      </section >

      < section id="how-it-works" className="w-full py-20 px-6 md:px-12 bg-[#FDF0E8] relative overflow-hidden md:overflow-visible" >
        {/* ---------- FLOATING CHARACTER (ch1) - RIGHT SIDE ---------- */}
        <div className="absolute top-0 right-0 bottom-0 z-[10] pointer-events-none md:flex items-center hidden">
          <div className="relative right-[-5%] lg:right-[-8%] xl:right-[-5%]">
            <motion.img
              src="/images/ch1.png"
              alt="Numi Character Right"
              className="w-56 sm:w-80 md:w-96 lg:w-[45rem] object-contain drop-shadow-10xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: 1,
                y: [0, -15, 0],
                rotate: [8, 10, 6, 8],
              }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut", delay: 0.2 },
                y: { duration: 3, ease: "easeInOut", repeat: Infinity },
                rotate: { duration: 3, ease: "easeInOut", repeat: Infinity },
              }}
            />
          </div>
        </div>

        {/* ---------- FLOATING CHARACTER (ch2) - LEFT SIDE ---------- */}
        <div className="absolute top-0 left-0 bottom-0 z-[10] pointer-events-none md:flex items-center hidden">
          <div className="relative left-[-5%] lg:left-[-8%] xl:left-[-5%]">
            <motion.img
              src="/images/ch2.png"
              alt="Numi Character Left"
              className="w-56 sm:w-80 md:w-96 lg:w-[45rem] object-contain drop-shadow-10xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                y: [0, 15, 0],
                rotate: [-8, -10, -6, -8],
              }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut", delay: 0.4 },
                y: { duration: 4, ease: "easeInOut", repeat: Infinity },
                rotate: { duration: 4, ease: "easeInOut", repeat: Infinity },
              }}
            />
          </div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 relative z-20">

          {/* Heading */}
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl font-fredoka text-center text-[#1A0A08] leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            How it works
          </motion.h2>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
            {[
              { step: "1", label: "Show your hand", desc: "Hold your hand up to the camera", hand: "/images/Hand Right.svg", flip: false },
              { step: "2", label: "Count your fingers", desc: "Hold up 1, 2 or 3 fingers", hand: "/images/Hand left.svg", flip: false },
              { step: "3", label: "Match the number!", desc: "Numi checks your answer live", hand: "/images/Hand Right.svg", flip: true },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="flex flex-col items-center gap-4 bg-white rounded-3xl p-6 shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.15 }}
              >
                {/* Step number badge */}
                <div className="w-10 h-10 rounded-full bg-[#EF5A00] flex items-center justify-center text-white font-body text-lg shadow">
                  {item.step}
                </div>

                {/* Hand image */}
                <img
                  src={item.hand}
                  alt={item.label}
                  className={`h-32 w-auto object-contain ${item.flip ? "scale-x-[-1]" : ""}`}
                />

                {/* Labels */}
                <p className="font-body text-xl text-[#1A0A08] text-center">{item.label}</p>
                <p className="font-sans text-sm text-[#1A0A08]/60 text-center">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
          >
            <Link
              href="/play"
              className="inline-block px-10 py-4 bg-[#EF5A00] hover:bg-[#d44f00] text-white font-body text-xl rounded-full shadow-xl transition-colors"
            >
              Start Learning →
            </Link>
          </motion.div>

        </div>
      </section >
    </>
  )
}

export default LandingHero
