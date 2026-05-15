"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onComplete, 600)
    }, 2800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-9999 bg-background flex items-center justify-center"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Logo Box */}
            <motion.div
              className="w-24 h-24 bg-foreground rounded-3xl flex items-center justify-center shadow-2xl"
              initial={{ borderRadius: "50%" }}
              animate={{ borderRadius: "24px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                {/* T */}
                <motion.span
                  className="text-4xl font-black text-background"
                  initial={{ x: -15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4, type: "spring", stiffness: 300 }}
                >
                  T
                </motion.span>
                {/* S */}
                <motion.span
                  className="text-4xl font-black text-background"
                  initial={{ x: 15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4, type: "spring", stiffness: 300 }}
                >
                  S
                </motion.span>
              </motion.div>
            </motion.div>

            {/* Brand Name */}
            <motion.p
              className="text-3xl font-black tracking-tighter text-foreground"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              TalentaSync
            </motion.p>

            {/* Tagline */}
            <motion.p
              className="text-xs text-muted-foreground font-bold tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              AI Recruitment Platform
            </motion.p>

            {/* Loading Bar */}
            <motion.div
              className="w-36 h-0.5 bg-muted rounded-full overflow-hidden mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              <motion.div
                className="h-full bg-foreground rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.3, duration: 1.2, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}