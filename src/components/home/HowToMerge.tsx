"use client";

import { Upload, MoveVertical, Download, ShieldCheck } from "lucide-react";

type Step = {
  number: string;
  icon: typeof Upload;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your PDF files",
    description:
      "Drag and drop your PDF files into the upload area or click to select them from your device.",
  },
  {
    number: "02",
    icon: MoveVertical,
    title: "Arrange the order",
    description:
      "Drag and drop your files to organize them in the exact order you want before merging.",
  },
  {
    number: "03",
    icon: Download,
    title: "Merge and download",
    description:
      "Click the Merge PDF button and instantly download your combined PDF document.",
  },
];

export default function HowToMerge() {
  return (
    <section id="how-to-merge" className="bg-slate-50 py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How to Merge PDFs Online
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Merge your PDF documents in just a few simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-gray-200/70 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/60"
              >
                {/* Step Number */}
                <span className="absolute top-4 right-6 text-5xl font-bold text-gray-100 transition-colors duration-300 group-hover:text-blue-100 select-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  <Icon size={24} />
                </div>

                {/* Title */}
                <h3 className="relative text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="relative mt-3 text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Privacy Info Box */}
        <div className="mx-auto mt-14 max-w-2xl">
          <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Privacy Matters</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                All PDF processing happens directly in your browser. Your files
                are never uploaded to our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
