"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  Loader2,
  Scissors,
  Layers,
  FileStack,
  ListOrdered,
  FileDown,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import {
  getPageCount,
  splitPdfRange,
  splitPdfSinglePage,
  splitPdfEveryPage,
  splitPdfEveryN,
  type SplitMode,
} from "@/lib/pdf/split";
import { iconBoxClass } from "@/lib/uiClasses";

const BASE_NAME = "split";

function splitModes() {
  return [
    {
      id: "range" as const,
      icon: Layers,
      title: "Page range",
      description: "Extract pages 1-5, 3-9, 10-12",
    },
    {
      id: "single" as const,
      icon: Scissors,
      title: "Single page",
      description: "Extract one page",
    },
    {
      id: "every" as const,
      icon: FileStack,
      title: "Every page",
      description: "Each page becomes its own PDF",
    },
    {
      id: "everyN" as const,
      icon: ListOrdered,
      title: "Every N pages",
      description: "Split after every 2, 5, 10 pages",
    },
  ];
}

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<SplitMode>("range");
  const [rangeInput, setRangeInput] = useState("");
  const [pageInput, setPageInput] = useState("");
  const [intervalInput, setIntervalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (next.type !== "application/pdf" && !next.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF file.");
      return;
    }
    setFile(next);
    setRangeInput("");
    setPageInput("");
    setIntervalInput("");
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    noClick: false,
  });

  const removeFile = () => {
    setFile(null);
    setRangeInput("");
    setPageInput("");
    setIntervalInput("");
  };

  const handleSplit = async () => {
    if (!file) {
      toast.error("Please upload a PDF first.");
      return;
    }

    let outputName = BASE_NAME;
    let bytes: Uint8Array<ArrayBuffer> | Uint8Array<ArrayBuffer>[];

    try {
      setIsProcessing(true);

      if (mode === "range") {
        const match = rangeInput.trim().match(/^(\d+)\s*-\s*(\d+)$/);
        if (!match) {
          toast.error("Invalid page range. Use a format like 1-5.");
          return;
        }
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        if (start < 1 || end < start || !pageCount || end > pageCount) {
          toast.error("Invalid page range for this PDF.");
          return;
        }
        bytes = await splitPdfRange(file, start, end);
        outputName = `pages-${start}-to-${end}`;
      } else if (mode === "single") {
        const page = parseInt(pageInput.trim(), 10);
        if (!Number.isInteger(page) || page < 1 || !pageCount || page > pageCount) {
          toast.error("Invalid page number for this PDF.");
          return;
        }
        bytes = await splitPdfSinglePage(file, page);
        outputName = `page-${page}`;
      } else if (mode === "every") {
        bytes = await splitPdfEveryPage(file);
      } else {
        const interval = parseInt(intervalInput.trim(), 10);
        if (!Number.isInteger(interval) || interval < 1 || !pageCount || interval > pageCount) {
          toast.error("Invalid interval. Enter a number between 1 and the total page count.");
          return;
        }
        bytes = await splitPdfEveryN(file, interval);
        outputName = `every-${interval}-pages`;
      }
    } catch {
      toast.error("PDF could not be processed.");
      return;
    } finally {
      setIsProcessing(false);
    }

    try {
      if (Array.isArray(bytes)) {
        if (bytes.length === 0) {
          toast.error("PDF could not be processed.");
          return;
        }

        if (bytes.length === 1) {
          const blob = new Blob([bytes[0]], { type: "application/pdf" });
          saveAs(blob, `${BASE_NAME}.pdf`);
        } else {
          const zip = new JSZip();
          const baseName = file.name.replace(/\.pdf$/i, "");
          bytes.forEach((byte, index) => {
            zip.file(`${baseName}-${index + 1}.pdf`, byte);
          });
          const zipBlob = await zip.generateAsync({ type: "blob" });
          saveAs(zipBlob, `${outputName}.zip`);
        }
        toast.success("Split completed successfully!");
      } else {
        const blob = new Blob([bytes], { type: "application/pdf" });
        saveAs(blob, `${outputName}.pdf`);
        toast.success("Split completed successfully!");
      }
    } catch {
      toast.error("Could not download the split files.");
    }
  };

  const canSplit =
    !!file &&
    !!pageCount &&
    (mode !== "range" || rangeInput.trim().length > 0) &&
    (mode !== "single" || pageInput.trim().length > 0) &&
    (mode !== "everyN" || intervalInput.trim().length > 0);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
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
          <Button onClick={() => undefined}>Select PDF File</Button>
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
                <p className="truncate font-medium text-gray-900">{file.name}</p>
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

      {/* Split mode selector */}
      {file && pageCount !== null && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900">Split mode</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {splitModes().map((option) => {
              const Icon = option.icon;
              const isSelected = mode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMode(option.id)}
                  aria-pressed={isSelected}
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
                  <p className="mt-1 text-sm text-gray-500">{option.description}</p>
                </button>
              );
            })}
          </div>

          {/* Mode inputs */}
          <div className="mt-6 rounded-2xl border border-gray-200/70 bg-white p-6">
            {mode === "range" && (
              <label htmlFor="range-input" className="block">
                <span className="text-sm font-medium text-gray-700">
                  Page range (e.g. 1-5)
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

            {mode === "single" && (
              <label htmlFor="single-input" className="block">
                <span className="text-sm font-medium text-gray-700">
                  Page number (1 to {pageCount})
                </span>
                <input
                  id="single-input"
                  type="number"
                  min={1}
                  max={pageCount}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  placeholder="5"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            )}

            {mode === "everyN" && (
              <label htmlFor="interval-input" className="block">
                <span className="text-sm font-medium text-gray-700">
                  Pages per file (1 to {pageCount})
                </span>
                <input
                  id="interval-input"
                  type="number"
                  min={1}
                  max={pageCount}
                  value={intervalInput}
                  onChange={(e) => setIntervalInput(e.target.value)}
                  placeholder="5"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            )}

            {mode === "every" && (
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <FileDown size={16} className="text-blue-600" />
                Each of the {pageCount} pages will be downloaded as a separate PDF
                (or a ZIP if there are multiple).
              </p>
            )}

            <div className="mt-6">
              <Button onClick={handleSplit} disabled={!canSplit || isProcessing}>
                {isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Splitting...
                  </span>
                ) : (
                  "Split PDF"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

