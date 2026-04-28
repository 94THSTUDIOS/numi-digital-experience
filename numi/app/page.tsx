"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { LayoutGroup, motion, AnimatePresence } from "framer-motion"
import useSound from "use-sound"
import { TextRotate } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { Player } from "@/components/ui/player"
import { TopNavbar } from "@/components/ui/top-navbar"
import { StarButton } from "@/components/ui/star-button"
import AnimatedDownloadButton from "@/components/ui/howitworks"
import { MinimalFooter } from "@/components/ui/minimal-footer"
import Lenis from '@studio-freight/lenis'
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SparklesText } from "@/components/ui/sparkles-text"
import { useGSAP } from "@gsap/react"
import { useAudio } from "@/components/AudioContext"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// ============================================================
// LOADING SCREEN
// Full-screen splash shown on first visit. Numbers count up 1–5,
// then the screen slides up to reveal the homepage.
// ============================================================
const NUMBERS = ["1", "2", "3", "4", "5"]

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState(0)
  const { forcePlayBGM } = useAudio()
  const [playIntro, { stop: stopIntro }] = useSound("/audio/intro.mp3", { volume: 0.5 })

  useEffect(() => {
    playIntro()
    return () => stopIntro()
  }, [playIntro, stopIntro])

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
      <div className="flex flex-col items-center justify-center gap-6">
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
      </div>
    </motion.div>
  )
}



// ============================================================
// IMAGE DATA
// Array of images used by the floating parallax elements.
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
    url: "/images/numi_4.png",
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
  // Lenis smooth scroll setup
  useEffect(() => {
    const lenis = new Lenis()

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
      lenis.destroy()
    }
  }, [])
  const [loading, setLoading] = useState(true)
  const [rotateColorIdx, setRotateColorIdx] = useState(0)
  const { forcePlayBGM } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  // Autoplay music on first user interaction (browser requirement)
  useEffect(() => {
    const handleFirstInteraction = () => {
      forcePlayBGM();
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, [forcePlayBGM]);

  // ── GSAP ScrollTrigger: animate a fixed-position logo between
  //    the hero placeholder and the navbar placeholder ──
  useGSAP(() => {
    if (loading) return                       // wait for loading screen to dismiss

    const logo = document.getElementById("flying-logo")
    const heroSlot = document.getElementById("hero-logo-slot")
    const navSlot = document.getElementById("nav-logo-slot")
    const heroCta = document.getElementById("hero-cta")
    if (!logo || !heroSlot || !navSlot || !heroCta) return

    // Helper: read a placeholder's rect relative to the viewport
    const getRect = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      return { x: r.left, y: r.top, w: r.width, h: r.height }
    }

    // Position the logo over the hero slot initially
    const setInitial = () => {
      const hero = getRect(heroSlot)
      gsap.set(logo, {
        position: "fixed",
        top: 0,
        left: 0,
        width: hero.w,
        height: hero.h,
        x: hero.x,
        y: hero.y,
        zIndex: 200,
        pointerEvents: "none",
      })
    }
    setInitial()

    // Hide the static fallback logo on the homepage — the flying logo takes over
    const staticLogo = document.getElementById("nav-logo-static")
    if (staticLogo) staticLogo.style.opacity = "0"
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "+=60%",              // pin for 60% of viewport height of scroll distance
        scrub: 0.4,
        pin: true,                 // pin the hero while the logo flies
        pinSpacing: true,          // push content below down so nothing overlaps
        invalidateOnRefresh: true,
        onRefresh: setInitial,     // recalculate on resize
      },
    })

    // Logo: fly from hero slot → nav slot
    tl.to(logo, {
      x: () => getRect(navSlot).x,
      y: () => getRect(navSlot).y,
      width: () => getRect(navSlot).w,
      height: () => getRect(navSlot).h,
      ease: "power2.inOut",
      duration: 1,
    }, 0)

    // CTA: slide up dramatically as logo flies into nav
    tl.to(heroCta, {
      y: -160,
      ease: "power2.inOut",
      duration: 1,
    }, 0.3)

  }, { scope: containerRef, dependencies: [loading] })

  return (
    <div ref={containerRef}>
      <AnimatePresence>
        {loading && (
          <LoadingScreen 
            onDone={() => {
              setLoading(false);
              forcePlayBGM();
            }} 
          />
        )}
      </AnimatePresence>

      {/* ── FLYING LOGO ── desktop only: animated by GSAP between hero ↔ nav */}
      <img
        id="flying-logo"
        src="/images/Numi Logo Big.svg"
        alt="Numi Logo"
        className="hidden md:block object-contain object-left"
        style={{ position: "fixed", top: 0, left: 0, zIndex: 200, pointerEvents: "none" }}
      />

      <TopNavbar />
      {/* SECTION WRAPPER — dynamic viewport height (dvh) for mobile bars, centers everything */}
      <section ref={heroRef} id="hero-section" className="w-full h-screen h-[100dvh] overflow-hidden md:overflow-visible flex flex-col items-center justify-center pt-20 md:pt-32 lg:pt-40 relative z-20 bg-[#FDF0E8]">
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
            className="top-[12%] left-[8%] md:top-[16%] md:left-[11%]"
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
            className="top-[12%] left-[87%] md:top-[14%] md:left-[83%]"
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
            className="top-[15%] left-[45%] md:top-[16%] md:left-[42%]"
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

        {/* HERO LOGO SLOT — desktop only: space reserved for GSAP flying logo */}
        <div className="hidden md:flex justify-center w-full z-50 pointer-events-none px-4 mb-4 sm:mb-6 md:mb-8">
          <div
            id="hero-logo-slot"
            className="w-full max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl aspect-[510/304]"
          />
        </div>

        {/* ======================================================
          THREE-COLUMN LAYOUT (foreground, z-50 = above parallax)
          - Left: ch3 character | Center: text + CTA | Right: ch2 character
          - Mobile: single column, characters hidden
          ====================================================== */}
        <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto z-50 pointer-events-auto px-4 sm:px-6 md:px-10 lg:px-16 relative">

          {/* ---------- LEFT CHARACTER (ch3 orange) ---------- */}
          {/* Anchored to the center and pushed left so it never moves when text changes width */}
          <div className="absolute top-1/2 -translate-y-1/2 right-[50%] mr-[7rem] sm:mr-[8rem] md:mr-[11rem] lg:mr-[15rem] xl:mr-[19rem] z-0 opacity-40 md:opacity-100 pointer-events-none">
            <motion.img
              src="/images/ch3.png"
              alt="Numi Character Left"
              className="w-[16rem] sm:w-[20rem] md:w-[24rem] lg:w-[28rem] xl:w-[32rem] max-w-none max-h-[70vh] object-contain drop-shadow-2xl"
              initial={{ opacity: 0, x: -40 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, -14, 0],
                rotate: [-5, -3, -7, -5],
              }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut", delay: 0.4 },
                x: { duration: 0.8, ease: "easeOut", delay: 0.4 },
                y: { duration: 3, ease: "easeInOut", repeat: Infinity, delay: 1 },
                rotate: { duration: 3, ease: "easeInOut", repeat: Infinity, delay: 1 },
              }}
            />
          </div>

          {/* ---------- CENTER COLUMN (heading, subtitle, buttons) ---------- */}
          <div className="flex flex-col justify-center items-center text-center">
            {/* CTA BLOCK — wrapped for ScrollTrigger y-slide */}
            <div id="hero-cta" className="flex flex-col items-center">
              {/* ANIMATED HEADING — fades up on load */}
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl text-center w-full justify-center items-center flex-row flex flex-wrap lg:flex-nowrap lg:whitespace-nowrap leading-tight font-fredoka tracking-tight"
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
              >
                <LayoutGroup>
                  <motion.span layout className="flex flex-row flex-wrap lg:flex-nowrap items-center justify-center gap-x-2 md:gap-x-3 w-full">
                    <motion.span
                      layout
                      className="font-fredoka font-bold text-[#F45F00]"
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    >
                      Making Math Learning
                    </motion.span>

                    <motion.span
                      layout
                      className="uppercase"
                      style={{ color: ROTATE_COLORS[rotateColorIdx] }}
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    >
                      <TextRotate
                        texts={["fun", "easy", "tangible"]}
                        mainClassName="overflow-hidden pr-3 rounded-xl font-moonbloom font-black [-webkit-text-stroke:1px_currentColor] md:[-webkit-text-stroke:2px_currentColor]"
                        staggerDuration={0.03}
                        staggerFrom="last"
                        rotationInterval={3000}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        onNext={(idx) => setRotateColorIdx(idx)}
                      />
                    </motion.span>
                  </motion.span>
                </LayoutGroup>
              </motion.h1>

              {/* SUBTITLE */}
              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-xl text-center font-body pt-4 sm:pt-6 md:pt-8 max-w-xl md:max-w-2xl lg:max-w-3xl"
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: 0.5 }}
              >
                Numi turns your fingers into learning tools! Using smart camera hand tracking, kids can count, explore numbers, and solve simple math problems just by holding up their hands.
              </motion.p>

              {/* CTA BUTTONS */}
              <div className="flex flex-row justify-center space-x-4 items-center mt-8 sm:mt-10 md:mt-12 text-xs w-full">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: 0.7 }}
                  className="z-20"
                >
                  <StarButton
                    href="/play"
                    className="!bg-[#3F6F29] !border-[#3F6F29] !shadow-[0_0_0_#3F6F298c] hover:!bg-white hover:!border-[#3F6F29] hover:!text-[#3F6F29] hover:!shadow-[0_0_25px_#3F6F298c] text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight font-body shadow-2xl px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6"
                  >
                    Start Learning with Numi <span className="font-serif ml-1">→</span>
                  </StarButton>
                </motion.div>

                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: 0.8 }}
                  className="z-20"
                >
                  <AnimatedDownloadButton />
                </motion.div>
              </div>
            </div>{/* END hero-cta */}
          </div>{/* END center column */}

          {/* ---------- RIGHT CHARACTER (ch2 pink) ---------- */}
          {/* Anchored to the center and pushed right so it never moves when text changes width */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[50%] ml-[7rem] sm:ml-[10rem] md:ml-[13rem] lg:ml-[16rem] xl:ml-[20rem] z-0 opacity-40 md:opacity-100 pointer-events-none">
            <motion.img
              src="/images/ch2.png"
              alt="Numi Character Right"
              className="w-[16rem] sm:w-[18rem] md:w-[20rem] lg:w-[24rem] xl:w-[28rem] max-w-none max-h-[70vh] object-contain drop-shadow-2xl"
              initial={{ opacity: 0, x: 40, scaleX: -1 }}
              animate={{
                opacity: 1,
                x: 0,
                scaleX: -1,
                y: [0, -14, 0],
                rotate: [5, 3, 7, 5],
              }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut", delay: 0.4 },
                x: { duration: 0.8, ease: "easeOut", delay: 0.4 },
                y: { duration: 3, ease: "easeInOut", repeat: Infinity, delay: 1 },
                rotate: { duration: 3, ease: "easeInOut", repeat: Infinity, delay: 1 },
              }}
            />
          </div>
        </div>{/* END main hero layer */}
      </section>

      <section id="how-it-works" className="w-full pb-20 pt-40 md:pt-64 lg:pt-80 px-6 md:px-12 bg-[#FDF0E8] relative overflow-hidden md:overflow-visible">
        {/* ---------- FLOATING CHARACTER (ch1) - RIGHT SIDE ---------- */}
        <div className="absolute top-0 right-0 bottom-0 z-[10] pointer-events-none md:flex items-center hidden">
          <div className="relative right-[5%] sm:right-[10%] md:right-[12%] lg:right-[15%]">
            <motion.img
              src="/images/ch1.png"
              alt="Numi Character Right"
              className="w-56 sm:w-80 md:w-96 lg:w-[32rem] object-contain drop-shadow-10xl"
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



        <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 relative z-20">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <SparklesText
              text="How it works"
              className="text-4xl sm:text-5xl md:text-6xl font-fredoka text-center text-[#1A0A08] leading-tight"
              colors={{ first: "#F6636F", second: "#EF5A00" }}
            />
          </motion.div>

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
      <MinimalFooter />
    </div>
  )
}

export default LandingHero
