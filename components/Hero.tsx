"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gf-bg via-gf-bg-soft to-gf-bg dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-gf-safe/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-gf-cta/10 blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 inline-block"
          >
            <div className="flex items-center justify-center gap-3 rounded-full bg-gf-safe/10 px-6 py-2 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-gf-safe" />
              <span className="text-sm font-medium text-gf-text-primary">
                Bezglutenski vodič
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold tracking-tight text-gf-text-primary sm:text-5xl md:text-6xl dark:text-neutral-100"
          >
            Dobrodošli u svijet{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="relative inline-block text-gf-cta dark:text-gf-cta"
            >
              bez glutena
              <motion.span
                className="absolute -bottom-2 left-0 h-1 w-full bg-gf-cta"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              />
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gf-text-secondary dark:text-neutral-300"
          >
            Dijelim svoja iskustva, recepte i savjete koje sam naučio tijekom godina života s celijakijom. 
            Nismo sami u ovome - zajedno možemo učiniti bezglutenski život lakšim i ukusnijim.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6"
          >
            <Link
              href="/recepti"
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gf-cta px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-gf-cta-hover hover:shadow-xl dark:bg-gf-cta dark:hover:bg-gf-cta-hover"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <span className="relative">Istražite recepte</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/blog"
              className="group relative text-sm font-semibold leading-6 text-gf-text-primary transition-all hover:text-gf-cta dark:text-neutral-100 dark:hover:text-gf-cta"
            >
              Saznajte više
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

