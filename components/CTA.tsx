"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-gf-cta via-gf-cta-hover to-gf-cta py-20 dark:from-gf-cta dark:via-gf-cta-hover dark:to-gf-cta">
      {/* Animated background pattern */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2"
          >
            <Sparkles className="h-6 w-6 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white sm:text-5xl"
          >
            Spremni za bezglutenski život?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-white/95"
          >
            Istražite naše recepte, savjete i resurse kako biste učinili svoj 
            put s celijakijom lakšim i ukusnijim.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6"
          >
            <Link
              href="/recepti"
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-white px-8 py-4 text-sm font-semibold text-gf-cta shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gf-cta/10 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span className="relative">Počnite ovdje</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/blog"
              className="group relative text-sm font-semibold leading-6 text-white transition-all hover:text-white/90"
            >
              Naučite više
              <motion.span
                className="ml-2 inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

