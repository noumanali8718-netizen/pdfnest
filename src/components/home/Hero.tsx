"use client";

import Button from "@/components/ui/Button";
import { ArrowDown, Sparkles } from "lucide-react";

export default function Hero() {
  const scrollToUpload = () => {
    const el = document.getElementById("upload");
    el?.scrollIntoView();
  };

  const scrollToTools = () => {
    const el = document.getElementById("tools");
    el?.scrollIntoView();
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-white via-white to-slate-50"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-32 pb-24 text-center md:pt-40">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm transition-all duration-150 hover:border-blue-200 hover:bg-blue-100/70">
          <Sparkles size={14} />
          Free &bull; Secure &bull; No Registration Required
        </span>

        {/* Headline */}
        <h1 className="mt-8 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Your PDFs, Perfected.
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Fast, Free &amp; Private.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl">
          Merge, split, compress, convert and edit PDFs directly in your browser.
          No uploads. No registration. Just tools that work.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button onClick={scrollToUpload}>Start Merging</Button>
          <Button variant="secondary" onClick={scrollToTools}>
            <span className="inline-flex items-center gap-2">
              Explore Tools
              <ArrowDown size={16} />
            </span>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-medium text-gray-600">
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-green-600">
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            100% Free
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-green-600">
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            No Upload Required
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-green-600">
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Privacy First
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-green-600">
                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Works Anywhere
          </span>
        </div>
      </div>
    </section>
  );
}
