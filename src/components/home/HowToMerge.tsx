"use client";

import { Upload, Cpu, Download, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { cardBaseClass, iconBoxClass } from "@/lib/uiClasses";
import Reveal from "@/components/ui/Reveal";

type Step = {
  number: string;
  icon: typeof Upload;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "1",
    icon: Upload,
    title: "Upload",
    description:
      "Drag and drop your PDF files into the upload area or click to choose files from your device.",
  },
  {
    number: "2",
    icon: Cpu,
    title: "Process",
    description:
      "Pick your tool and let PDFNest work its magic — entirely in your browser, in seconds.",
  },
  {
    number: "3",
    icon: Download,
    title: "Download",
    description:
      "Download your finished PDF instantly. Your files never leave your device.",
  },
];

export default function HowToMerge() {
  return (
    <section id="how-it-works" className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="How It Works"
            title="Get results in three simple steps"
            subtitle="Upload, process and download — no account, no waiting, no hassle."
          />
        </Reveal>

        {/* Steps Grid */}
        <ol className="mt-16 grid gap-8 md:grid-cols-3 md:gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <li key={step.number} className="relative">
                <Reveal delay={index * 0.1} className="h-full">
                  <article className={`${cardBaseClass} relative h-full p-8`}>
                    {/* Step Number */}
                    <span className="absolute right-6 top-6 text-6xl font-extrabold leading-none text-slate-100 select-none">
                      {step.number}
                    </span>

                    {/* Icon */}
                    <div className={`${iconBoxClass} relative mb-5`}>
                      <Icon size={24} />
                    </div>

                    {/* Title */}
                    <h3 className="relative text-[22px] font-semibold text-gray-900">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="relative mt-3 text-[15px] leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                  </article>
                </Reveal>

                {/* Arrow between steps */}
                {!isLast ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-lg shadow-slate-200/60">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
