"use client"

import * as React from "react"
import { motion } from "framer-motion"

export default function AnimatedDownloadButton() {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <a
      href="#how-it-works"
      className="inline-block relative z-20"
    >
      <motion.div
        initial={{ width: 84, height: 84 }}
        whileHover={{ width: 280 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ duration: 0.3 }}
        className="bg-[#F6636F] flex items-center justify-center overflow-hidden relative shadow-md"
        style={{ borderRadius: 42 }}
      >
        <motion.div
          className="absolute"
          animate={{
            opacity: isHovered ? 0 : 1,
            scale: isHovered ? 0.8 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-white text-4xl font-bold font-nunito">?</span>
        </motion.div>

        <motion.div
          className="w-full flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2, delay: isHovered ? 0.1 : 0 }}
        >
          <span className="text-white text-2xl font-bold whitespace-nowrap font-body">
            How it works
          </span>
        </motion.div>
      </motion.div>
    </a>
  )
}
