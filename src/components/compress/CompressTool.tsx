"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  Info,
  Gauge,
  Scale,
  Download,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import { compressPdf, type CompressionLevel } from "@/lib/pdf/compress";
import { iconBoxClass } from "@/lib/uiClasses";

const PRESETS: {
  id: CompressionLevel;
  icon: typeof Gauge;
  title: string;
  description: string;
}[] = [
  {
    id: "low",
    icon: Gauge,
    title: "Standard Optimization",
    description: "Re-saves the PDF and removes unused internal objects.",
  },
  {
    id: "balanced",
    icon: Scale,
    title: "Privacy Optimization (Recommended)",
    description:
      "Also removes document metadata such as title, author, creator and dates.",
  },
  {
    id: "maximum",
    icon: FileText,
    title: "Metadata Cleanup",
    description:
      "Also removes page labels and optional metadata for maximum cleanup.",
  },
];

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("balanced");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    originalSize: number;
    compressedSize: number;
    bytes: Uint8Array<ArrayBuffer>;
  } | null>(null);

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
    setResult(null);
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
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) {
      toast.error("Please upload a PDF first.");
      return;
    }

    try {
      setIsProcessing(true);
      const output = await compressPdf(file, level);

      if (output.compressedSize >= output.originalSize) {
        setResult({
          originalSize: output.originalSize,
          compressedSize: output.originalSize,
          bytes: output.bytes,
        });
        toast.info(
          "Your PDF could not be reduced further in the browser. Downloading the optimized copy."
        );
        return;
      }

      setResult({
        originalSize: output.originalSize,
        compressedSize: output.compressedSize,
        bytes: output.bytes,
      });
      toast.success("PDF optimized successfully!");
    } catch {
      toast.error("This PDF could not be processed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.bytes], { type: "application/pdf" });
    const baseName = file?.name.replace(/\.pdf$/i, "") ?? "document";
    saveAs(blob, `${baseName}-optimized.pdf`);
  };

  const savedBytes =
    result && result.originalSize > result.compressedSize
      ? result.originalSize - result.compressedSize
      : 0;

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

      {/* Browser limitation notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <Info
          size={20}
          className="mt-0.5 shrink-0 text-blue-600"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold text-gray-900">
            About browser optimization
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Browser optimization performs safe, lossless cleanup. Significant
            size reduction — especially for image-heavy PDFs — requires a
            server-side compression engine.
          </p>
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

      {/* Compression level selector */}
      {file && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Optimization level
          </h3>
          <div
            role="radiogroup"
            aria-label="Optimization level"
            className="mt-4 grid gap-4 sm:grid-cols-3"
          >
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = level === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setLevel(preset.id);
                    setResult(null);
                  }}
                  className={`rounded-2xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600"
                      : "border-gray-200/70 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className={`${iconBoxClass} mb-3`}>
                    <Icon size={22} />
                  </div>
                  <p className="font-semibold text-gray-900">{preset.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Honest browser-limitation note below options */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200/70 bg-gray-50 p-4">
            <Info
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-gray-600">
              These are safe, lossless cleanup options, not image
              re-compression. If your PDF is image-heavy, the size may stay
              the same — a server-side engine would be needed for significant
              reduction.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200/70 bg-white p-6">
            <Button
              onClick={handleCompress}
              disabled={isProcessing}
              loading={isProcessing}
            >
              {isProcessing ? "Optimizing" : "Optimize PDF"}
            </Button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200/70 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Result</h3>
          {savedBytes > 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              Your PDF was reduced from{" "}
              <span className="font-semibold text-gray-900">
                {formatFileSize(result.originalSize)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-emerald-600">
                {formatFileSize(result.compressedSize)}
              </span>{" "}
              — you saved{" "}
              <span className="font-semibold text-emerald-600">
                {formatFileSize(savedBytes)}
              </span>
              .
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              The optimized copy is the same size as the original
              ({formatFileSize(result.originalSize)}). This PDF likely
              contains images that can&apos;t be re-encoded in the browser.
            </p>
          )}

          <div className="mt-5">
            <Button
              variant="secondary"
              onClick={handleDownload}
              className="group"
            >
              <Download size={16} />
              Download {savedBytes > 0 ? "compressed" : "optimized"} PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

