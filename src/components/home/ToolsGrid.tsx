"use client";

import Link from "next/link";
import {
  Files,
  Scissors,
  FileDown,
  RotateCw,
  FileSearch,
  FileX,
  ArrowUpDown,
  Hash,
  FileText,
  FileType,
  Image,
  FileImage,
  ScanLine,
  Droplets,
  Shield,
  Lock,
  ArrowRight,
} from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { cardBaseClass, iconBoxClass } from "@/lib/uiClasses";
import Reveal from "@/components/ui/Reveal";

type Tool = {
  icon: typeof Files;
  title: string;
  description: string;
  status: "available" | "coming-soon";
  href?: string;
};

const tools: Tool[] = [
  {
    icon: Files,
    title: "Merge PDF",
    description: "Combine multiple PDFs into one document in seconds.",
    status: "available",
    href: "/merge-pdf",
  },
  {
    icon: Scissors,
    title: "Split PDF",
    description: "Separate pages into individual PDF files instantly.",
    status: "available",
    href: "/split-pdf",
  },
  {
    icon: FileDown,
    title: "Compress PDF",
    description: "Reduce file size while keeping quality intact.",
    status: "available",
    href: "/compress-pdf",
  },
  {
    icon: RotateCw,
    title: "Rotate PDF",
    description: "Rotate pages to the correct orientation.",
    status: "available",
    href: "/rotate-pdf",
  },
  {
    icon: FileSearch,
    title: "Extract Pages",
    description: "Extract selected pages into a new PDF document.",
    status: "available",
    href: "/extract-pages",
  },
  {
    icon: FileX,
    title: "Delete Pages",
    description: "Remove unwanted pages from any PDF file.",
    status: "available",
    href: "/delete-pages",
  },
  {
    icon: ArrowUpDown,
    title: "Reorder Pages",
    description: "Drag and drop pages into any order you like.",
    status: "available",
    href: "/reorder-pages",
  },
  {
    icon: Hash,
    title: "Add Page Numbers",
    description: "Add page numbers to your PDF in seconds.",
    status: "available",
    href: "/page-numbers",
  },
  {
    icon: FileText,
    title: "PDF to Word",
    description: "Convert PDF files into editable Word documents.",
    status: "coming-soon",
  },
  {
    icon: FileType,
    title: "Word to PDF",
    description: "Convert Word documents into PDF format.",
    status: "coming-soon",
  },
  {
    icon: Image,
    title: "PDF to Images",
    description: "Convert each PDF page into a high-quality JPG or PNG image.",
    status: "available",
    href: "/pdf-to-images",
  },
  {
    icon: FileImage,
    title: "Images to PDF",
    description: "Combine JPG, PNG, WEBP, BMP and GIF images into a single PDF.",
    status: "available",
    href: "/images-to-pdf",
  },
  {
    icon: ScanLine,
    title: "OCR",
    description: "Extract text from scanned PDFs and images.",
    status: "coming-soon",
  },
  {
    icon: Droplets,
    title: "Watermark PDF",
    description: "Add text or image watermarks to any PDF.",
    status: "available",
    href: "/watermark-pdf",
  },
  {
    icon: Shield,
    title: "Protect PDF",
    description: "Password-protect your PDF files with encryption.",
    status: "available",
    href: "/protect-pdf",
  },
  {
    icon: Lock,
    title: "Unlock PDF",
    description: "Remove password protection from PDF files.",
    status: "coming-soon",
  },
];

export default function ToolsGrid() {
  return (
    <section id="tools" className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="PDF Tools"
            title="Everything you need to work with PDFs"
            subtitle="Powerful PDF tools designed for speed, privacy and simplicity."
          />
        </Reveal>

        {/* Tools Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const isAvailable = tool.status === "available";

            return (
              <Reveal key={tool.title} delay={(index % 4) * 0.06}>
                <article
                  className={`${cardBaseClass} relative flex h-full flex-col p-6`}
                >
                  {isAvailable && tool.href ? (
                    <Link
                      href={tool.href}
                      className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      aria-label={`Open ${tool.title} tool`}
                    />
                  ) : null}

                  {/* Icon */}
                  <div className={`${iconBoxClass} mb-5`}>
                    <Icon size={24} />
                  </div>

                  {/* Title */}
                  <h3 className="text-[22px] font-semibold text-gray-900">
                    {tool.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-500">
                    {tool.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Coming Soon
                      </span>
                    )}

                    {isAvailable && tool.href ? (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-all duration-200 group-hover:gap-2">
                        Open Tool <ArrowRight size={15} />
                      </span>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
