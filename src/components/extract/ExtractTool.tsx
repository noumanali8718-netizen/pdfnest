"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  Layers,
  ListOrdered,
  Hash,
  ArrowDownToLine,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import { getPageCount, extractPages } from "@/lib/pdf/split";
import { iconBoxClass, primaryButtonClass } from "@/lib/uiClasses";

type ExtractMode = "range" | "custom" | "odd" | "even";

const MODES: {
  id: ExtractMode;
  icon: typeof Layers;
  title: string;
  description: string;
}[] = [
  {
    id: "range",
    icon: Layers,
    title: "Page Range",
    description: "Extract a page range, e.g. 1-5",
  },
  {
    id: "custom",
    icon: ListOrdered,
    title: "Custom Pages",
    description: "Pick specific pages like 1,3,5,8",
  },
  {
    id: "odd",
    icon: Hash,
    title: "Odd Pages",
    description: "Extract all odd-numbered pages",
  },
  {
    id: "even",
    icon: Hash,
    title: "Even Pages",
    description: "Extract all even-numbered pages",
  },
];

export default function ExtractTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<ExtractMode>("range");
  const [rangeInput, setRangeInput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const lastCompletedRef = useRef(0);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    getPageCount(file)
      .then((count) => {
        if (!cancelled) setPageCount(count);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("This file could not be read as a PDF.");
          setFile(null);
          setPageCount(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const next = acceptedFiles[0];
    if (!next) return;
    setFile(next);
    setRangeInput("");
    setCustomInput("");
    setMode("range");
  }, []);

  const onDropRejected = useCallback(() => {
    toast.error("Please upload a valid PDF file.");
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    noClick: false,
  });

  const removeFile = () => {
    setFile(null);
    setRangeInput("");
    setCustomInput("");
  };

  const resolvePageNumbers = (): number[] | null => {
    if (!pageCount) return null;

    if (mode === "range") {
      const match = rangeInput.trim().match(/^(\d+)\s*-\s*(\d+)$/);
      if (!match) {
        toast.error("Invalid page range. Use a format like 1-5.");
        return null;
      }
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      if (start < 1 || end < start || end > pageCount) {
        toast.error(
          `Invalid range. Enter pages between 1 and ${pageCount}.`
        );
        return null;
      }
      const pages: number[] = [];
      for (let p = start; p <= end; p++) pages.push(p);
      return pages;
    }

    if (mode === "custom") {
      const parts = customInput.trim().split(",");
      const pages: number[] = [];
      const seen = new Set<number>();
      for (const raw of parts) {
        const value = raw.trim();
        if (!/^\d+$/.test(value)) {
          toast.error(
            "Invalid page list. Use comma-separated numbers like 1,3,5,8."
          );
          return null;
        }
        const page = parseInt(value, 10);
        if (page < 1 || page > pageCount) {
          toast.error(
            `Page ${page} is outside this PDF (it has ${pageCount} pages).`
          );
          return null;
        }
        if (seen.has(page)) {
          toast.error(`Page ${page} was listed more than once.`);
          return null;
        }
        seen.add(page);
        pages.push(page);
      }
      if (pages.length === 0) {
        toast.error("Enter at least one page number.");
        return null;
      }
      return pages;
    }

    // odd / even
    const start = mode === "odd" ? 1 : 2;
    const pages: number[] = [];
    for (let p = start; p <= pageCount; p += 2) pages.push(p);
    return pages;
  };

  const handleExtract = async () => {
    if (!file) {
      toast.error("Please upload a PDF first.");
      return;
    }

    if (
      processingRef.current ||
      isProcessing ||
      Date.now() - lastCompletedRef.current < 800
    ) {
      return;
    }

    const pages = resolvePageNumbers();
    if (!pages) return;

    processingRef.current = true;

    try {
      setIsProcessing(true);

      let bytes: Uint8Array<ArrayBuffer>;
      try {
        bytes = await extractPages(file, pages);
      } catch {
        toast.error("PDF could not be processed.");
        return;
      }

      try {
        const blob = new Blob([bytes], { type: "application/pdf" });
        const baseName = file.name.replace(/\.pdf$/i, "") || "document";
        saveAs(blob, `${baseName}-extracted.pdf`);
        toast.success(
          `Extracted ${pages.length} page${pages.length > 1 ? "s" : ""} successfully!`
        );
      } catch {
        toast.error("Could not download the extracted file.");
      }
    } finally {
      lastCompletedRef.current = Date.now();
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  const canExtract =
    !!file &&
    !!pageCount &&
    (mode !== "range" || rangeInput.trim().length > 0) &&
    (mode !== "custom" || customInput.trim().length > 0);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Upload zone */}
      <div
        {...getRootProps({
          role: "button",
          tabIndex: 0,
          "aria-label": "Upload a PDF file",
        })}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          isDragActive
            ? "border-blue-600 bg-blue-50"
            : "border-blue-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={60} className="mx-auto text-blue-600" />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          {isDragActive ? "Drop your PDF here" : "Drag & Drop a single PDF"}
        </h2>
        <p className="mt-3 text-gray-500">
          or click the button below to select one PDF
        </p>
        <div className="mt-8">
          <span className={primaryButtonClass}>Select PDF File</span>
        </div>
      </div>

      {/* File info + remove */}
      {file && (
        <div className="mt-8 rounded-xl border bg-gray-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className={`${iconBoxClass} shrink-0`}>
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">
                  {file.name}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">
                  {formatFileSize(file.size)}
                  {pageCount !== null && <span> · {pageCount} pages</span>}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              aria-label="Remove uploaded PDF"
              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Extraction mode selector */}
      {file && pageCount !== null && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Extraction method
          </h3>
          <div
            role="radiogroup"
            aria-label="Extraction mode"
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            {MODES.map((option) => {
              const Icon = option.icon;
              const isSelected = mode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setMode(option.id)}
                  className={`rounded-2xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600"
                      : "border-gray-200/70 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className={`${iconBoxClass} mb-3`}>
                    <Icon size={22} />
                  </div>
                  <p className="font-semibold text-gray-900">{option.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Mode inputs */}
          <div className="mt-6 rounded-2xl border border-gray-200/70 bg-white p-6">
            {mode === "range" && (
              <label htmlFor="range-input" className="block">
                <span className="text-sm font-medium text-gray-700">
                  Page range (1 to {pageCount})
                </span>
                <input
                  id="range-input"
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="1-5"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            )}

            {mode === "custom" && (
              <label htmlFor="custom-input" className="block">
                <span className="text-sm font-medium text-gray-700">
                  Custom pages (1 to {pageCount}, comma-separated)
                </span>
                <input
                  id="custom-input"
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="1,3,5,8"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            )}

            {mode === "odd" && (
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <ArrowDownToLine size={16} className="text-blue-600" />
                Every odd-numbered page will be extracted into one new PDF.
              </p>
            )}

            {mode === "even" && (
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <ArrowDownToLine size={16} className="text-blue-600" />
                Every even-numbered page will be extracted into one new PDF.
              </p>
            )}

            <div className="mt-6">
              <Button
                onClick={handleExtract}
                disabled={!canExtract || isProcessing}
                loading={isProcessing}
              >
                {isProcessing ? "Extracting" : "Extract Pages"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

