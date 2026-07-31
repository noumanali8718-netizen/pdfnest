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
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-28 pb-16 text-center md:pt-36">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Sparkles size={14} />
          Free &bull; Secure &bull; No Registration Required
        </span>

        {/* Headline */}
        <h1 className="mt-8 max-w-4xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Your PDFs, Perfected.
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Fast, Free &amp; Private.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-base text-gray-600 sm:text-lg md:text-xl">
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
        <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-green-500">✓</span> 100% Free
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-green-500">✓</span> No Upload Required
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-green-500">✓</span> Privacy First
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-green-500">✓</span> Works Anywhere
          </span>
        </div>
      </div>
    </section>
  );
}
