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
  Image as ImageIcon,
  FileImage,
  Loader2,
  Download,
  SlidersHorizontal,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import { getPageCount } from "@/lib/pdf/split";
import {
  pdfToImages,
  qualityToJpegValue,
  type ImageFormat,
  type ImageQuality,
} from "@/lib/pdf/toImages";
import { iconBoxClass } from "@/lib/uiClasses";

type FormatOption = {
  id: ImageFormat;
  icon: typeof ImageIcon;
  title: string;
  description: string;
};

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "jpg",
    icon: ImageIcon,
    title: "JPG",
    description: "Small file size, good for photos and documents",
  },
  {
    id: "png",
    icon: FileImage,
    title: "PNG",
    description: "Lossless quality, supports transparency",
  },
];

type QualityOption = {
  id: ImageQuality;
  icon: typeof SlidersHorizontal;
  title: string;
  description: string;
};

const QUALITY_OPTIONS: QualityOption[] = [
  {
    id: "low",
    icon: SlidersHorizontal,
    title: "Low",
    description: "Smallest file size",
  },
  {
    id: "medium",
    icon: SlidersHorizontal,
    title: "Medium",
    description: "Balanced quality and size",
  },
  {
    id: "high",
    icon: SlidersHorizontal,
    title: "High",
    description: "Best image quality",
  },
];

type ResolutionOption = {
  id: "standard" | "high" | "ultra";
  icon: typeof FileImage;
  title: string;
  description: string;
  scale: number;
};

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    id: "standard",
    icon: FileImage,
    title: "Standard",
    description: "1× page size",
    scale: 1,
  },
  {
    id: "high",
    icon: FileImage,
    title: "High",
    description: "2× page size",
    scale: 2,
  },
  {
    id: "ultra",
    icon: FileImage,
    title: "Ultra",
    description: "3× page size",
    scale: 3,
  },
];

export default function PdfToImagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [format, setFormat] = useState<ImageFormat>("jpg");
  const [quality, setQuality] = useState<ImageQuality>("medium");
  const [resolution, setResolution] = useState<ResolutionOption["id"]>(
    "standard"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{
    format: ImageFormat;
    count: number;
  } | null>(null);

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
    setResultCount(null);
    setLastResult(null);
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
    setResultCount(null);
    setLastResult(null);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please upload a PDF first.");
      return;
    }

    const scale =
      RESOLUTION_OPTIONS.find((option) => option.id === resolution)?.scale ?? 1;
    const qualityValue = qualityToJpegValue(quality);

    try {
      setIsProcessing(true);
      const images = await pdfToImages(file, {
        format,
        scale,
        quality: qualityValue,
      });

      if (images.length === 0) {
        toast.error("No pages could be converted.");
        return;
      }

      if (images.length === 1) {
        saveAs(images[0].blob, images[0].filename);
      } else {
        const zip = new JSZip();
        images.forEach((image) => {
          zip.file(image.filename, image.blob);
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const baseName = file.name.replace(/\.pdf$/i, "") || "document";
        saveAs(zipBlob, `${baseName}-${format}.zip`);
      }

      setResultCount(images.length);
      setLastResult({ format, count: images.length });
      toast.success(
        `Converted ${images.length} page${
          images.length > 1 ? "s" : ""
        } to ${format.toUpperCase()} successfully!`
);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unexpected conversion error.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!file || !lastResult) return;
    // Re-run conversion with the same settings so the user can download again.
    void handleConvert();
  };

  const canConvert = !!file && !!pageCount;

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

      {/* Options */}
      {file && pageCount !== null && (
        <div className="mt-8 space-y-8">
          {/* Format */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Output format
            </h3>
            <div
              role="radiogroup"
              aria-label="Output format"
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              {FORMAT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = format === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setFormat(option.id)}
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
          </div>

          {/* Resolution */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Resolution
            </h3>
            <div
              role="radiogroup"
              aria-label="Resolution"
              className="mt-4 grid gap-4 sm:grid-cols-3"
            >
              {RESOLUTION_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = resolution === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setResolution(option.id)}
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
          </div>

          {/* Quality (JPG only) */}
          {format === "jpg" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                JPEG quality
              </h3>
              <div
                role="radiogroup"
                aria-label="JPEG quality"
                className="mt-4 grid gap-4 sm:grid-cols-3"
              >
                {QUALITY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = quality === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setQuality(option.id)}
                      className={`rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600"
                          : "border-gray-200/70 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className={`${iconBoxClass} mb-3`}>
                        <Icon size={20} />
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
            </div>
          )}

          <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
            <Button
              onClick={handleConvert}
              disabled={!canConvert || isProcessing}
              loading={isProcessing}
            >
              {isProcessing ? "Converting" : "Convert to Images"}
            </Button>
            <p className="mt-3 text-sm text-gray-500">
              Each page will be exported as a{" "}
              <span className="font-medium text-gray-700">
                {format.toUpperCase()}
              </span>{" "}
              image. If the PDF has more than one page, a ZIP file containing
              all images will be downloaded.
            </p>
          </div>

          {/* Result */}
          {resultCount !== null && lastResult && (
            <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Result</h3>
              <p className="mt-2 text-sm text-gray-600">
                Successfully converted{" "}
                <span className="font-semibold text-gray-900">
                  {resultCount} page{resultCount > 1 ? "s" : ""}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">
                  {lastResult.format.toUpperCase()}
                </span>
                .
              </p>
              <div className="mt-5">
                <Button
                  variant="secondary"
                  onClick={handleDownloadAgain}
                  disabled={isProcessing}
                  className="group"
                >
                  <Download size={16} />
                  {isProcessing ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Converting...
                    </span>
                  ) : (
                    "Download again"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
