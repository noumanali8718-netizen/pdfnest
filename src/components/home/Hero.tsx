"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ShieldCheck, Cpu, Lock, CheckCircle2 } from "lucide-react";
import UploadBox from "@/components/ui/UploadBox";

const trustBadges = [
  { icon: CheckCircle2, label: "Free" },
  { icon: ShieldCheck, label: "Secure" },
  { icon: Cpu, label: "Browser Processing" },
  { icon: Lock, label: "No Sign-up" },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-white via-white to-slate-50"
    >
      {/* Decorative background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none"
      >
        <div className="absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-100/60 via-blue-50/40 to-transparent blur-3xl" />
        <div className="absolute right-[-160px] top-40 h-[360px] w-[360px] rounded-full bg-blue-50/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left: copy + upload */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.span
              {...fadeUp(0)}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm"
            >
              <Sparkles size={14} />
              The fastest PDF toolkit on the web
            </motion.span>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.1)}
              className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-[64px]"
            >
              Work with PDFs
              <br />
              Like a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Pro.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              {...fadeUp(0.2)}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0 lg:text-xl"
            >
              Merge, split, compress, convert and edit PDF files directly in
              your browser. No uploads to servers. Fast, private and free.
            </motion.p>

            {/* Upload Box — dominates the hero */}
            <motion.div {...fadeUp(0.3)} className="mt-10 lg:mt-12">
              <UploadBox />
            </motion.div>

            {/* Trust badges */}
            <motion.ul
              {...fadeUp(0.4)}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start"
            >
              {trustBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <li
                    key={badge.label}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Icon size={12} strokeWidth={2.5} />
                    </span>
                    {badge.label}
                  </li>
                );
              })}
            </motion.ul>
          </div>

          {/* Right: floating PDF mockup */}
          <motion.div
            {...fadeUp(0.2)}
            className="relative hidden lg:block"
            aria-hidden="true"
          >
            <div className="relative mx-auto max-w-sm">
              <motion.div
                animate={reduceMotion ? {} : { y: [0, -12, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(16,24,40,0.12)]"
              >
                {/* Mini PDF preview header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                      P
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        report-2026.pdf
                      </p>
                      <p className="text-xs text-slate-400">2.4 MB</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 ring-1 ring-green-100">
                    Ready
                  </span>
                </div>

                {/* Fake page lines */}
                <div className="mt-6 space-y-3">
                  <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                  <div className="h-3 w-5/6 rounded-full bg-slate-100" />
                  <div className="h-3 w-2/3 rounded-full bg-slate-100" />
                  <div className="mt-5 h-28 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/60" />
                  <div className="mt-3 h-3 w-4/5 rounded-full bg-slate-100" />
                  <div className="h-3 w-3/5 rounded-full bg-slate-100" />
                </div>
              </motion.div>

              {/* Floating accent card */}
              <motion.div
                animate={reduceMotion ? {} : { y: [0, 10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute -bottom-6 -left-10 z-20 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_16px_40px_rgba(16,24,40,0.12)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    100% Private
                  </p>
                  <p className="text-xs text-slate-400">Stays on your device</p>
                </div>
              </motion.div>

              {/* Floating accent card 2 */}
              <motion.div
                animate={reduceMotion ? {} : { y: [0, -10, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -right-8 top-10 z-20 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_16px_40px_rgba(16,24,40,0.12)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Cpu size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Instant
                  </p>
                  <p className="text-xs text-slate-400">Runs in your browser</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
