"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "Is PDFNest free?",
    answer:
      "Yes. The currently available tools can be used free of charge without creating an account.",
  },
  {
    question: "Are my files uploaded?",
    answer: "No. All PDF processing happens directly inside your browser.",
  },
  {
    question: "Can I merge multiple PDFs?",
    answer:
      "Yes. Upload multiple PDFs, reorder them, then merge them into one document.",
  },
  {
    question: "Does PDFNest work on mobile?",
    answer: "Yes. PDFNest works on modern mobile and desktop browsers.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Processing depends on your browser and device memory rather than server limits.",
  },
  {
    question: "Will more PDF tools be added?",
    answer:
      "Yes. Split, Compress, Convert and many more tools are planned.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="bg-slate-50 py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
<Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about using PDFNest."
          />
        </Reveal>

        {/* FAQ List */}
        <Reveal delay={0.1} className="mt-16">
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
                  isOpen
                    ? "border-blue-200 shadow-md"
                    : "border-gray-200/70 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {/* Question Button */}
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  id={`faq-button-${index}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span
                    className={`text-base font-semibold transition-colors duration-200 ${
                      isOpen ? "text-blue-700" : "text-gray-900"
                    }`}
                  >
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </span>
                </button>

                {/* Answer Panel */}
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-gray-500">
                      {faq.answer}
                    </p>
                  </div>
                </div>
</div>
            );
          })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
