"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  RotateCcw,
  RotateCw,
  RotateCwSquare,
  SlidersHorizontal,
  Layers,
  ListOrdered,
  Hash,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import { getPageCount } from "@/lib/pdf/split";
import { rotatePdf } from "@/lib/pdf/rotate";
import { iconBoxClass } from "@/lib/uiClasses";

type RotatePreset = {
  id: "left" | "right" | "flip";
  icon: typeof RotateCcw;
  title: string;
  description: string;
};

const PRESETS: RotatePreset[] = [
  {
    id: "left",
    icon: RotateCcw,
    title: "Rotate Left",
    description: "90° Counter-clockwise",
  },
  {
    id: "right",
    icon: RotateCw,
    title: "Rotate Right",
    description: "90° Clockwise",
  },
  {
    id: "flip",
    icon: RotateCwSquare,
    title: "Rotate 180°",
    description: "Upside Down",
  },
];

type PageSelectionMode = "all" | "range" | "custom";

const SELECTION_MODES: {
  id: PageSelectionMode;
  icon: typeof Layers;
  title: string;
  description: string;
}[] = [
  {
    id: "all",
    icon: Layers,
    title: "All Pages",
    description: "Rotate every page in the PDF",
  },
  {
    id: "range",
    icon: ListOrdered,
    title: "Page Range",
    description: "Rotate a range like 3-8",
  },
  {
    id: "custom",
    icon: Hash,
    title: "Custom Pages",
    description: "Rotate specific pages like 1,3,5,9",
  },
];

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [preset, setPreset] = useState<RotatePreset["id"]>("right");
  const [selectionMode, setSelectionMode] =
    useState<PageSelectionMode>("all");
  const [rangeInput, setRangeInput] = useState("");
  const [customInput, setCustomInput] = useState("");
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
    if (
      next.type !== "application/pdf" &&
      !next.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please upload a valid PDF file.");
      return;
    }
    setFile(next);
    setRangeInput("");
    setCustomInput("");
    setSelectionMode("all");
    setPreset("right");
  }, []);

  const {
    getRootProps,
    getInputProps,
    open,
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
    setCustomInput("");
  };

  const resolvePageNumbers = (): number[] | null => {
    if (!pageCount) return null;

    if (selectionMode === "all") {
      const pages: number[] = [];
      for (let p = 1; p <= pageCount; p++) pages.push(p);
      return pages;
    }

    if (selectionMode === "range") {
      const match = rangeInput.trim().match(/^(\d+)\s*-\s*(\d+)$/);
      if (!match) {
        toast.error("Invalid page range. Use a format like 3-8.");
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

    // custom
    const parts = customInput.trim().split(",");
    const pages: number[] = [];
    const seen = new Set<number>();
    for (const raw of parts) {
      const value = raw.trim();
      if (!/^\d+$/.test(value)) {
        toast.error(
          "Invalid page list. Use comma-separated numbers like 1,3,5,9."
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
  };

  const handleRotate = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    const pages = resolvePageNumbers();
    if (!pages) return;

    if (pages.length === 0) {
      toast.error("Nothing to rotate.");
      return;
    }

    const angle =
      preset === "left" ? -90 : preset === "right" ? 90 : 180;

    try {
      setIsProcessing(true);
      const bytes = await rotatePdf(file, pages, angle);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = file.name.replace(/\.pdf$/i, "") ?? "document";
      saveAs(blob, `${baseName}-rotated.pdf`);
      toast.success(
        `Rotated ${pages.length} page${pages.length > 1 ? "s" : ""} successfully!`
      );
    } catch {
      toast.error("PDF could not be processed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const canRotate =
    !!file &&
    !!pageCount &&
    (selectionMode !== "range" || rangeInput.trim().length > 0) &&
    (selectionMode !== "custom" || customInput.trim().length > 0);

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
          <Button onClick={open}>Select PDF File</Button>
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

      {/* Rotation options + page selection */}
      {file && pageCount !== null && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Rotation angle
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {PRESETS.map((option) => {
              const Icon = option.icon;
              const isSelected = preset === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setPreset(option.id)}
                  className={`rounded-2xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600"
                      : "border-gray-200/70 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className={`${iconBoxClass} mb-3`}>
                    <Icon size={22} />
                  </div>
                  <p className="font-semibold text-gray-900">
                    {option.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900">
              Pages to rotate
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {SELECTION_MODES.map((option) => {
                const Icon = option.icon;
                const isSelected = selectionMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectionMode(option.id)}
                    className={`rounded-2xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600"
                        : "border-gray-200/70 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`${iconBoxClass} mb-3`}>
                      <Icon size={22} />
                    </div>
                    <p className="font-semibold text-gray-900">
                      {option.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selection mode inputs */}
            <div className="mt-6 rounded-2xl border border-gray-200/70 bg-white p-6">
              {selectionMode === "all" && (
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Layers size={16} className="text-blue-600" />
                  Every page (1 to {pageCount}) will be rotated by the
                  selected angle.
                </p>
              )}

              {selectionMode === "range" && (
                <label htmlFor="range-input" className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Page range to rotate (1 to {pageCount})
                  </span>
                  <input
                    id="range-input"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="3-8"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              )}

              {selectionMode === "custom" && (
                <label htmlFor="custom-input" className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Pages to rotate (1 to {pageCount}, comma-separated)
                  </span>
                  <input
                    id="custom-input"
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="1,3,5,9"
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              )}

              <div className="mt-6">
                <Button
                  onClick={handleRotate}
                  disabled={!canRotate || isProcessing}
                  loading={isProcessing}
                >
                  {isProcessing ? "Rotating" : "Rotate PDF"}
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal size={16} className="text-blue-600" />
            Only the selected pages are rotated. All other pages stay
            unchanged and page order is preserved.
          </p>
        </div>
      )}
    </div>
  );
}

