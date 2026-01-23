"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Sun, Moon, Lock } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", label: "Početna" },
    { href: "/blog", label: "Blog" },
    { href: "/recepti", label: "Recepti" },
    { href: "/restorani", label: "Restorani" },
    { href: "/proizvodi", label: "Proizvodi" },
    { href: "/ducani", label: "Dućani" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-gf-bg-card/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative h-8 w-8"
          >
            <Image
              src="/images/logo.png"
              alt="Bezglutenska sila"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
          <span className="text-xl font-bold text-gf-text-primary dark:text-neutral-100">
            Bezglutenska sila
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gf-text-secondary transition-colors hover:text-gf-cta dark:text-neutral-300 dark:hover:text-gf-cta"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="rounded-lg p-2 text-gf-text-secondary transition-colors hover:bg-gf-bg-soft hover:text-gf-cta dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-gf-cta"
            aria-label="Admin Panel"
            title="Admin Panel"
          >
            <Lock size={20} />
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gf-text-secondary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <Link
            href="/admin"
            className="rounded-lg p-2 text-gf-text-secondary transition-colors hover:bg-gf-bg-soft hover:text-gf-cta dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-gf-cta"
            aria-label="Admin Panel"
            title="Admin Panel"
          >
            <Lock size={20} />
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gf-text-secondary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gf-text-secondary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-200 bg-gf-bg-card dark:border-neutral-800 dark:bg-neutral-900 md:hidden"
          >
            <div className="space-y-1 px-4 pb-4 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gf-text-secondary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gf-text-secondary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Lock size={18} />
                Admin Panel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

