"use client";

import {
  Files,
  Scissors,
  FileDown,
  RotateCw,
  FileSearch,
  FileX,
  ArrowUpDown,
  FileText,
  FileType,
  Image,
  FileImage,
  ScanLine,
  Droplets,
  Shield,
  Lock,
} from "lucide-react";

type Tool = {
  icon: typeof Files;
  title: string;
  description: string;
  status: "available" | "coming-soon";
};

const tools: Tool[] = [
  {
    icon: Files,
    title: "Merge PDF",
    description: "Combine multiple PDFs into one document in seconds.",
    status: "available",
  },
  {
    icon: Scissors,
    title: "Split PDF",
    description: "Separate pages into individual PDF files instantly.",
    status: "coming-soon",
  },
  {
    icon: FileDown,
    title: "Compress PDF",
    description: "Reduce file size while keeping quality intact.",
    status: "coming-soon",
  },
  {
    icon: RotateCw,
    title: "Rotate PDF",
    description: "Rotate pages to the correct orientation.",
    status: "coming-soon",
  },
  {
    icon: FileSearch,
    title: "Extract Pages",
    description: "Extract selected pages into a new PDF document.",
    status: "coming-soon",
  },
  {
    icon: FileX,
    title: "Delete Pages",
    description: "Remove unwanted pages from any PDF file.",
    status: "coming-soon",
  },
  {
    icon: ArrowUpDown,
    title: "Reorder Pages",
    description: "Drag and drop pages into any order you like.",
    status: "coming-soon",
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
    title: "PDF to JPG",
    description: "Convert each PDF page into a high-quality JPG image.",
    status: "coming-soon",
  },
  {
    icon: FileImage,
    title: "JPG to PDF",
    description: "Combine multiple JPG images into a single PDF.",
    status: "coming-soon",
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
    status: "coming-soon",
  },
  {
    icon: Shield,
    title: "Protect PDF",
    description: "Password-protect your PDF files with encryption.",
    status: "coming-soon",
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
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to work with PDFs
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Powerful PDF tools designed for speed, privacy and simplicity.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isAvailable = tool.status === "available";

            return (
              <div
                key={tool.title}
                className="group relative rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/60"
              >
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  <Icon size={24} />
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-gray-900">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {tool.description}
                </p>

                {/* Status Badge */}
                <div className="mt-4">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

