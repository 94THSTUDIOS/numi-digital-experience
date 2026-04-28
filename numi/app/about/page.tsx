"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TopNavbar } from "@/components/ui/top-navbar"
import { MinimalFooter } from "@/components/ui/minimal-footer"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: EASE },
  }),
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FDF0E8] font-body text-[#1A0A08]">
      <TopNavbar />
      <div className="max-w-7xl mx-auto w-full">
        {/* HERO */}
        <section className="px-4 sm:px-6 md:px-10 lg:px-16 pt-20 md:pt-32 lg:pt-40 pb-20 flex flex-col items-center text-center gap-6">
        {/* Logo */}
        <motion.img
          src="/images/logo.svg"
          alt="Numi"
          className="h-16 md:h-20 w-auto object-contain mb-2"
          custom={0}
          initial="hidden"
          animate="show"
          variants={fadeUp}
        />

        <motion.p
          className="text-sm font-bold uppercase tracking-[0.18em] text-[#EF5A00]"
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          Our Story
        </motion.p>

        <motion.h1
          className="font-display font-black text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] uppercase max-w-3xl"
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          Math that feels like{" "}
          <span className="text-[#F47C6E]">magic</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-[#1A0A08]/70 max-w-xl leading-relaxed"
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          Numi uses your child&apos;s own hands — no toys, no devices — to make
          counting 1–5 feel like a superpower.
        </motion.p>

        <motion.div custom={4} initial="hidden" animate="show" variants={fadeUp}>
          <img
            src="/images/ch3.png"
            alt="Numi character"
            className="h-52 md:h-64 w-auto object-contain drop-shadow-xl"
          />
        </motion.div>
      </section>
      </div>

      {/* MISSION */}
      <section className="bg-[#F47C6E] text-white px-4 sm:px-6 md:px-10 lg:px-16 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-black text-[clamp(2rem,5vw,3.5rem)] uppercase leading-tight">
              Why we built Numi
            </h2>
            <p className="text-lg leading-relaxed text-white/90">
              Early number sense is the foundation for all future math. Yet most
              apps reward tapping screens — not thinking. We wanted something
              different: a tool that builds real understanding through the most
              natural interface a child has, their own hands.
            </p>
            <p className="text-lg leading-relaxed text-white/90">
              Numi runs entirely in your browser. No downloads, no sign-ups, no
              ads. Just a camera, two hands, and a child ready to discover that
              counting is something they can feel.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <img
              src="/images/ch1.png"
              alt="Numi character counting"
              className="h-56 md:h-72 w-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-6 md:px-10 lg:px-16 py-20">
        <div className="max-w-7xl mx-auto">
        <motion.h2
          className="font-display font-black text-[clamp(1.8rem,4vw,3rem)] uppercase text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          How it works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              num: "01",
              title: "Open camera",
              body: "Numi accesses your webcam right in the browser — nothing to install.",
              color: "#5BAD52",
            },
            {
              num: "02",
              title: "Hold up fingers",
              body: "Our hand-tracking model reads exactly how many fingers you're showing in real time.",
              color: "#EF5A00",
            },
            {
              num: "03",
              title: "Count & learn",
              body: "Kids progress through onboarding, learning, and a fun quiz — all driven by their hands.",
              color: "#F47C6E",
            },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              className="flex flex-col gap-3 p-7 rounded-3xl bg-white shadow-sm"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span
                className="font-display font-black text-4xl"
                style={{ color: step.color }}
              >
                {step.num}
              </span>
              <h3 className="font-display font-black text-xl uppercase">
                {step.title}
              </h3>
              <p className="text-[#1A0A08]/70 leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

      {/* CTA */}
      <section className="bg-[#1A0A08] text-white px-4 sm:px-6 md:px-10 lg:px-16 py-20 flex flex-col items-center text-center gap-7">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
        <motion.h2
          className="font-display font-black text-[clamp(2rem,5vw,4rem)] uppercase leading-tight max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          Ready to count?
        </motion.h2>
        <motion.p
          className="text-lg text-white/70 max-w-md leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          viewport={{ once: true }}
        >
          Jump straight into the game — no sign-up required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          viewport={{ once: true }}
        >
          <Link
            href="/play"
            className="bg-[#EF5A00] text-white font-display font-black uppercase text-xl px-10 py-4 rounded-full hover:scale-105 transition-transform duration-200 shadow-lg inline-block"
          >
            Try Numi Free
          </Link>
        </motion.div>
        </div>
      </section>

      <MinimalFooter />
    </main>
  )
}
