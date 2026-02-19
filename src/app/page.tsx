"use client";

import Link from "next/link";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import { useTheme } from "@/hooks/use-theme";

const techStack = [
  "Next.js 15",
  "TypeScript",
  "Redux Toolkit",
  "Supabase",
  "Tailwind CSS",
  "Vercel",
];

export default function Home() {
  const { toggleTheme, mounted } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              HealthConnect
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                <svg className="h-5 w-5 hidden dark:block" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
                <svg className="h-5 w-5 block dark:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              </button>
            )}
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Features */}
      <Features />

      {/* Tech Stack */}
      <section className="border-t border-gray-200 px-6 py-16 dark:border-gray-800 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Built with modern technologies
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 dark:border-gray-800 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A portfolio project by{" "}
            <a
              href="https://nanushi.org"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              nanushi
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
