"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  Hash,
  Info,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import { iconBoxClass } from "@/lib/uiClasses";
import {
  addPageNumbers,
  calculatePosition,
  formatPageNumber,
  getPageCount,
  PAGE_NUMBER_COLORS,
  PAGE_NUMBER_FORMATS,
  PAGE_NUMBER_POSITIONS,
  type PageNumberColorId,
  type PageNumberOptions,
} from "@/lib/pdf/pageNumbers";

/* ------------------------------------------------------------------ */
/* Preview — lightweight page-shaped rectangle, NOT a real PDF render  */
/* ------------------------------------------------------------------ */

const PREVIEW_PAGE_WIDTH = 240;
const PREVIEW_PAGE_HEIGHT = 240 * 1.414;

type PreviewProps = {
  options: PageNumberOptions;
  totalPages: number;
};

function Preview({ options, totalPages }: PreviewProps) {
  const { color } = useMemo(
    () => ({ color: PAGE_NUMBER_COLORS[options.colorId] }),
    [options.colorId]
  );

  const preview = useMemo(() => {
    // Reuse the exact same formatter + position math as the pdf-lib
    // pipeline so the preview always matches the generated PDF.
    const label = formatPageNumber(
      options.startingNumber,
      totalPages,
      options.format
    );

    // Rough estimate of text width (Helvetica is ~0.55 * fontSize average).
    const textWidth = label.length * options.fontSize * 0.55;
    const textHeight = options.fontSize * 1.2;

    const { x, y } = calculatePosition(
      PREVIEW_PAGE_WIDTH,
      PREVIEW_PAGE_HEIGHT,
      options.position,
      textWidth,
      textHeight,
      options.margin
    );

    return { label, x, y, textWidth, textHeight };
  }, [options, totalPages]);

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      style={{ width: PREVIEW_PAGE_WIDTH, height: PREVIEW_PAGE_HEIGHT }}
      aria-label="Live preview of where the page number will appear"
      role="img"
    >
      {/* Subtle page gutter lines to give the preview a document feel */}
      <div
        className="absolute inset-y-0 left-0 w-px bg-gray-100"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 w-px bg-gray-100"
        aria-hidden="true"
      />

      <span
        className="pointer-events-none select-none font-sans"
        style={{
          position: "absolute",
          left: preview.x,
          top: preview.y,
          fontSize: options.fontSize,
          lineHeight: 1.2,
          color: color.hex,
          whiteSpace: "nowrap",
        }}
      >
        {preview.label}
      </span>

      {!options.includeFirstPage && (
        <span className="absolute bottom-2 right-3 text-[10px] font-medium text-gray-400">
          First page skipped
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool                                                               */
/* ------------------------------------------------------------------ */

export default function PageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // All options live in one object so the live preview updates instantly
  // whenever any setting changes — no button press required.
  const [options, setOptions] = useState<PageNumberOptions>({
    position: "bottom-center",
    startingNumber: 1,
    format: "1",
    fontSize: 12,
    margin: 30,
    colorId: "black",
    includeFirstPage: true,
  });

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
    setPageCount(null);
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
    setPageCount(null);
  };

  const set = <K extends keyof PageNumberOptions>(
    key: K,
    value: PageNumberOptions[K]
  ) => {
    setOptions((previous) => ({ ...previous, [key]: value }));
  };

  const handleAddNumbers = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    if (!Number.isInteger(options.startingNumber) || options.startingNumber < 1) {
      toast.error("Starting number must be at least 1.");
      return;
    }

    try {
      setIsProcessing(true);
      const bytes = await addPageNumbers(file, options);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = file.name.replace(/\.pdf$/i, "") ?? "document";
      saveAs(blob, `${baseName}-numbered.pdf`);
      toast.success("Page numbers added successfully!");
    } catch {
      toast.error("PDF could not be processed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcess = !!file && pageCount !== null;

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

      {/* Config + preview */}
      {file && pageCount !== null && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Configuration */}
          <div className="space-y-8">
            {/* Position */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Position</h3>
              <div
                role="radiogroup"
                aria-label="Page number position"
                className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
              >
                {PAGE_NUMBER_POSITIONS.map((position) => {
                  const isSelected = options.position === position.id;
                  return (
                    <button
                      key={position.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => set("position", position.id)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600"
                          : "border-gray-200/70 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {position.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Starting number */}
            <div>
              <label
                htmlFor="starting-number"
                className="block text-lg font-semibold text-gray-900"
              >
                Starting number
              </label>
              <input
                id="starting-number"
                type="number"
                min={1}
                step={1}
                value={options.startingNumber}
                onChange={(e) =>
                  set("startingNumber", parseInt(e.target.value, 10) || 0)
                }
                className="mt-3 w-32 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Number format */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Number format
              </h3>
              <div
                role="radiogroup"
                aria-label="Page number format"
                className="mt-4 flex flex-wrap gap-2"
              >
                {PAGE_NUMBER_FORMATS.map((format) => {
                  const isSelected = options.format === format;
                  return (
                    <button
                      key={format}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => set("format", format)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600"
                          : "border-gray-200/70 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {formatPageNumber(1, pageCount, format)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font size */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="font-size"
                  className="text-lg font-semibold text-gray-900"
                >
                  Font size
                </label>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
                  {options.fontSize}px
                </span>
              </div>
              <input
                id="font-size"
                type="range"
                min={10}
                max={24}
                step={2}
                value={options.fontSize}
                onChange={(e) => set("fontSize", parseInt(e.target.value, 10))}
                className="mt-3 w-full accent-blue-600"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>10px</span>
                <span>24px</span>
              </div>
            </div>

            {/* Margin */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="margin"
                  className="text-lg font-semibold text-gray-900"
                >
                  Margin
                </label>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
                  {options.margin}px
                </span>
              </div>
              <input
                id="margin"
                type="range"
                min={10}
                max={40}
                step={10}
                value={options.margin}
                onChange={(e) => set("margin", parseInt(e.target.value, 10))}
                className="mt-3 w-full accent-blue-600"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>10px</span>
                <span>40px</span>
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Text color
              </h3>
              <div
                role="radiogroup"
                aria-label="Page number color"
                className="mt-4 flex flex-wrap gap-3"
              >
                {(Object.keys(PAGE_NUMBER_COLORS) as PageNumberColorId[]).map(
                  (id) => {
                    const preset = PAGE_NUMBER_COLORS[id];
                    const isSelected = options.colorId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={preset.label}
                        onClick={() => set("colorId", id)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60 text-gray-900 ring-2 ring-blue-600"
                            : "border-gray-200/70 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: preset.hex }}
                          aria-hidden="true"
                        />
                        {preset.label}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Include first page */}
            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={options.includeFirstPage}
                  onChange={(e) => set("includeFirstPage", e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 accent-blue-600"
                />
                <span className="text-lg font-semibold text-gray-900">
                  Include First Page
                </span>
              </label>
              {!options.includeFirstPage && (
                <p className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                  <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                  The first page will not receive a number. Numbering starts
                  on the second page.
                </p>
              )}
            </div>
          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-200/70 bg-gray-50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Hash size={18} className="text-blue-600" />
                Preview
              </h3>
              <Preview options={options} totalPages={pageCount} />
              <p className="mt-4 text-center text-sm text-gray-500">
                Page number placement preview
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Action */}
      {file && pageCount !== null && (
        <div className="mt-10 rounded-2xl border border-gray-200/70 bg-white p-6">
          <Button
            onClick={handleAddNumbers}
            disabled={!canProcess || isProcessing}
            loading={isProcessing}
          >
            {isProcessing ? "Adding Numbers" : "Add Page Numbers"}
          </Button>
          <p className="mt-3 text-sm text-gray-500">
            The output file will be saved as{" "}
            <span className="font-medium text-gray-700">
              {file.name.replace(/\.pdf$/i, "")}-numbered.pdf
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
}

