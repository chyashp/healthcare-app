"use client";

import Link from "next/link";

function HeroIllustration() {
  return (
    <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Background circle */}
      <circle cx="250" cy="200" r="180" fill="#f0fdfa" className="dark:opacity-10" />
      <circle cx="250" cy="200" r="140" fill="#ccfbf1" className="dark:opacity-10" />

      {/* Doctor figure */}
      <circle cx="200" cy="130" r="30" fill="#0d9488" />
      <circle cx="200" cy="130" r="25" fill="#14b8a6" />
      <rect x="175" y="160" width="50" height="70" rx="10" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
      <rect x="185" y="175" width="30" height="3" rx="1.5" fill="#0d9488" />
      <rect x="185" y="183" width="20" height="3" rx="1.5" fill="#14b8a6" />
      {/* Stethoscope */}
      <path d="M175 175 C165 175 160 185 160 195 C160 205 170 210 175 210" stroke="#0d9488" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="175" cy="212" r="4" fill="#0d9488" />

      {/* Patient figure */}
      <circle cx="320" cy="150" r="25" fill="#5eead4" />
      <circle cx="320" cy="150" r="20" fill="#99f6e4" />
      <rect x="298" y="175" width="44" height="60" rx="8" fill="#ffffff" stroke="#5eead4" strokeWidth="2" />

      {/* Calendar/schedule */}
      <rect x="90" y="250" width="120" height="100" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" className="dark:stroke-gray-700" />
      <rect x="90" y="250" width="120" height="28" rx="12" fill="#14b8a6" />
      <text x="150" y="269" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">Schedule</text>
      {/* Calendar rows */}
      <rect x="102" y="290" width="16" height="12" rx="3" fill="#ccfbf1" />
      <rect x="124" y="290" width="16" height="12" rx="3" fill="#ccfbf1" />
      <rect x="146" y="290" width="16" height="12" rx="3" fill="#14b8a6" />
      <rect x="168" y="290" width="16" height="12" rx="3" fill="#ccfbf1" />
      <rect x="102" y="310" width="16" height="12" rx="3" fill="#ccfbf1" />
      <rect x="124" y="310" width="16" height="12" rx="3" fill="#ccfbf1" />
      <rect x="146" y="310" width="16" height="12" rx="3" fill="#ccfbf1" />
      <rect x="168" y="310" width="16" height="12" rx="3" fill="#f0fdfa" />
      <rect x="102" y="330" width="16" height="12" rx="3" fill="#f0fdfa" />
      <rect x="124" y="330" width="16" height="12" rx="3" fill="#14b8a6" />
      <rect x="146" y="330" width="16" height="12" rx="3" fill="#ccfbf1" />
      <rect x="168" y="330" width="16" height="12" rx="3" fill="#ccfbf1" />

      {/* Medical clipboard */}
      <rect x="290" y="260" width="110" height="90" rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" className="dark:stroke-gray-700" />
      <rect x="325" y="252" width="40" height="16" rx="8" fill="#14b8a6" />
      <rect x="305" y="280" width="60" height="4" rx="2" fill="#d1d5db" />
      <rect x="305" y="292" width="45" height="4" rx="2" fill="#d1d5db" />
      <rect x="305" y="304" width="70" height="4" rx="2" fill="#d1d5db" />
      <rect x="305" y="316" width="35" height="4" rx="2" fill="#d1d5db" />
      {/* Checkmarks */}
      <circle cx="385" cy="282" r="6" fill="#ccfbf1" />
      <path d="M382 282 L384 284 L388 280" stroke="#0d9488" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="385" cy="294" r="6" fill="#ccfbf1" />
      <path d="M382 294 L384 296 L388 292" stroke="#0d9488" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Heart rate line */}
      <path d="M100 210 L130 210 L140 190 L150 230 L160 200 L170 220 L180 210 L220 210" stroke="#14b8a6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Cross/plus symbols */}
      <rect x="370" y="120" width="20" height="6" rx="3" fill="#5eead4" transform="rotate(0 380 123)" />
      <rect x="377" y="113" width="6" height="20" rx="3" fill="#5eead4" />
      <rect x="430" y="200" width="14" height="4" rx="2" fill="#99f6e4" transform="rotate(0 437 202)" />
      <rect x="435" y="195" width="4" height="14" rx="2" fill="#99f6e4" />

      {/* Dots decoration */}
      <circle cx="80" cy="160" r="4" fill="#ccfbf1" />
      <circle cx="420" cy="280" r="5" fill="#f0fdfa" />
      <circle cx="440" cy="160" r="3" fill="#5eead4" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-400">
              Healthcare Made Simple
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
              Healthcare Scheduling,{" "}
              <span className="text-brand-500">Simplified</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              A modern appointment platform connecting patients and doctors.
              Book appointments, manage schedules, access medical records, and
              consult via video — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-600 hover:shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
