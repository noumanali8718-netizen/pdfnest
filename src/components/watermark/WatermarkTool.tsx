"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  Droplets,
  Info,
  Type,
  Image as ImageIcon,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import { iconBoxClass } from "@/lib/uiClasses";
import {
  APPLY_TO_OPTIONS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_STYLES,
  getPageCount,
  OPACITY_MAX,
  OPACITY_MIN,
  ROTATION_MAX,
  ROTATION_MIN,
  SCALE_MAX,
  SCALE_MIN,
  WATERMARK_COLORS,
  WATERMARK_POSITIONS,
  applyWatermark,
  calculateWatermarkPosition,
  type ApplyTo,
  type WatermarkColorId,
  type WatermarkFontStyle,
  type WatermarkOptions,
  type WatermarkPosition,
  type WatermarkType,
} from "@/lib/pdf/watermark";

/* ------------------------------------------------------------------ */
/* Preview — lightweight A4-style page, NOT a real PDF render          */
/* ------------------------------------------------------------------ */

const PREVIEW_PAGE_WIDTH = 240;
const PREVIEW_PAGE_HEIGHT = 240 * 1.414;

type PreviewProps = {
  options: WatermarkOptions;
};

function Preview({ options }: PreviewProps) {
  const { color, rotation, scale, opacity } = useMemo(() => {
    const color =
      options.type === "text"
        ? WATERMARK_COLORS[options.colorId]
        : WATERMARK_COLORS.black;
    // Preview uses the same rotation normalization as the PDF pipeline.
    const rotation = ((options.rotation % 360) + 360) % 360;
    const scale = options.type === "image" ? options.scale : 1;
    return { color, rotation, scale, opacity: options.opacity };
  }, [options]);

  const preview = useMemo(() => {
    const margin = PREVIEW_PAGE_WIDTH * 0.05;
    if (options.type === "text") {
      const textWidth = options.text.length * options.fontSize * 0.55;
      const textHeight = options.fontSize * 1.2;
      const { x, y } = calculateWatermarkPosition(
        PREVIEW_PAGE_WIDTH,
        PREVIEW_PAGE_HEIGHT,
        options.position,
        textWidth,
        textHeight,
        margin
      );
      return { x, y, width: textWidth, height: textHeight };
    }
    const baseExtent = PREVIEW_PAGE_WIDTH * 0.4;
    const drawWidth = baseExtent * options.scale;
    const drawHeight = baseExtent * options.scale;
    const { x, y } = calculateWatermarkPosition(
      PREVIEW_PAGE_WIDTH,
      PREVIEW_PAGE_HEIGHT,
      options.position,
      drawWidth,
      drawHeight,
      margin
    );
    return { x, y, width: drawWidth, height: drawHeight };
  }, [options]);

  const isTile = options.position === "tile";
  const tileStepX = preview.width * 2;
  const tileStepY = preview.height * 2;

  const renderTiles = () => {
    const tiles: React.ReactNode[] = [];
    let id = 0;
    for (
      let y = -preview.height;
      y < PREVIEW_PAGE_HEIGHT + preview.height;
      y += tileStepY
    ) {
      for (
        let x = -preview.width;
        x < PREVIEW_PAGE_WIDTH + preview.width;
        x += tileStepX
      ) {
        tiles.push(
          <div
            key={id++}
            aria-hidden="true"
            className="pointer-events-none select-none"
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: preview.width,
              height: preview.height,
              transform: `rotate(${rotation}deg)`,
              opacity: opacity,
              transformOrigin: "center center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {options.type === "text" ? (
              <span
                style={{
                  fontSize: options.fontSize,
                  lineHeight: 1.2,
                  color: color.hex,
                  fontWeight:
                    options.type === "text" && options.fontStyle === "bold"
                      ? 700
                      : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {options.text}
              </span>
            ) : (
              <span
                style={{
                  width: preview.width,
                  height: preview.height,
                  background: color.hex,
                  opacity: 0.4,
                }}
              />
            )}
          </div>
        );
      }
    }
    return tiles;
  };

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      style={{ width: PREVIEW_PAGE_WIDTH, height: PREVIEW_PAGE_HEIGHT }}
      aria-label="Live preview of where the watermark will appear"
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

      {isTile ? (
        renderTiles()
      ) : (
        <div
          className="pointer-events-none select-none"
          style={{
            position: "absolute",
            left: preview.x,
            top: preview.y,
            width: preview.width,
            height: preview.height,
            transform: `rotate(${rotation}deg)`,
            opacity: opacity,
            transformOrigin: "center center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {options.type === "text" ? (
            <span
              style={{
                fontSize: options.fontSize,
                lineHeight: 1.2,
                color: color.hex,
                fontWeight:
                  options.type === "text" && options.fontStyle === "bold"
                    ? 700
                    : 400,
                whiteSpace: "nowrap",
              }}
            >
              {options.text}
            </span>
          ) : (
            <span
              style={{
                width: preview.width,
                height: preview.height,
                background: color.hex,
                opacity: 0.4,
              }}
            />
          )}
        </div>
      )}

      <p className="absolute bottom-2 text-[10px] font-medium text-gray-400">
        A4 preview
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable option controls                                           */
/* ------------------------------------------------------------------ */

type PositionControlProps = {
  value: WatermarkPosition;
  onChange: (position: WatermarkPosition) => void;
};

function PositionControl({ value, onChange }: PositionControlProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Position</h3>
      <div
        role="radiogroup"
        aria-label="Watermark position"
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {WATERMARK_POSITIONS.map((position) => {
          const isSelected = value === position.id;
          return (
            <button
              key={position.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(position.id)}
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
  );
}

type ApplyToControlProps = {
  value: ApplyTo;
  onChange: (applyTo: ApplyTo) => void;
};

function ApplyToControl({ value, onChange }: ApplyToControlProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Apply to Pages</h3>
      <div
        role="radiogroup"
        aria-label="Pages to apply watermark to"
        className="mt-4 flex flex-wrap gap-2"
      >
        {APPLY_TO_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isSelected
                  ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600"
                  : "border-gray-200/70 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type SliderControlProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
};

function SliderControl({
  id,
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-lg font-semibold text-gray-900">
          {label}
        </label>
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-3 w-full accent-blue-600"
      />
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tool                                                               */
/* ------------------------------------------------------------------ */

export default function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [type, setType] = useState<WatermarkType>("text");

  const [text, setText] = useState("PDFNest");
  const [fontSize, setFontSize] = useState(36);
  const [colorId, setColorId] = useState<WatermarkColorId>("gray");
  const [fontStyle, setFontStyle] = useState<WatermarkFontStyle>("regular");

  const [image, setImage] = useState<File | null>(null);
  const [scale, setScale] = useState(0.5);

  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(0);
  const [applyTo, setApplyTo] = useState<ApplyTo>("all");

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

  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    const next = acceptedFiles[0];
    if (!next) return;
    const isPng = next.type === "image/png";
    const isJpeg =
      next.type === "image/jpeg" ||
      next.type === "image/jpg" ||
      /\.jpe?g$/i.test(next.name);
    if (!isPng && !isJpeg) {
      toast.error("Only PNG and JPG images are supported.");
      return;
    }
    setImage(next);
  }, []);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    open: openImage,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onImageDrop,
    multiple: false,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    noClick: false,
  });

  const removeFile = () => {
    setFile(null);
    setPageCount(null);
  };

  const removeImage = () => {
    setImage(null);
  };

  const options: WatermarkOptions = useMemo(() => {
    if (type === "text") {
      return {
        type,
        text,
        fontSize,
        colorId,
        fontStyle,
        position,
        opacity,
        rotation,
        applyTo,
      };
    }
    return {
      type,
      image: image ?? new File([], ""),
      scale,
      position,
      opacity,
      rotation,
      applyTo,
    };
  }, [
    type,
    text,
    fontSize,
    colorId,
    fontStyle,
    image,
    scale,
    position,
    opacity,
    rotation,
    applyTo,
  ]);

  const handleWatermark = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }
    if (type === "text" && !text.trim()) {
      toast.error("Enter watermark text.");
      return;
    }
    if (type === "image" && !image) {
      toast.error("Select an image.");
      return;
    }

    try {
      setIsProcessing(true);
      const bytes = await applyWatermark(file, options);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = file.name.replace(/\.pdf$/i, "") ?? "document";
      saveAs(blob, `${baseName}-watermarked.pdf`);
      toast.success("Watermark added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("PDF could not be processed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcess = !!file && pageCount !== null && (type === "text" || !!image);

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
            {/* Watermark type */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Watermark Type
              </h3>
              <div
                role="radiogroup"
                aria-label="Watermark type"
                className="mt-4 grid grid-cols-2 gap-3"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={type === "text"}
                  onClick={() => setType("text")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    type === "text"
                      ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600"
                      : "border-gray-200/70 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Type size={18} />
                  Text
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={type === "image"}
                  onClick={() => setType("image")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    type === "image"
                      ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600"
                      : "border-gray-200/70 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <ImageIcon size={18} />
                  Image
                </button>
              </div>
            </div>

            {type === "text" ? (
              <>
                {/* Watermark text */}
                <div>
                  <label
                    htmlFor="watermark-text"
                    className="block text-lg font-semibold text-gray-900"
                  >
                    Watermark text
                  </label>
                  <input
                    id="watermark-text"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Font size */}
                <SliderControl
                  id="watermark-font-size"
                  label="Font size"
                  value={fontSize}
                  min={FONT_SIZE_MIN}
                  max={FONT_SIZE_MAX}
                  step={2}
                  unit="px"
                  onChange={setFontSize}
                />

                {/* Font weight */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Font weight
                  </h3>
                  <div
                    role="radiogroup"
                    aria-label="Font weight"
                    className="mt-4 flex flex-wrap gap-2"
                  >
                    {FONT_STYLES.map((style) => {
                      const isSelected = fontStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setFontStyle(style.id)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600"
                              : "border-gray-200/70 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {style.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text color */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Text color
                  </h3>
                  <div
                    role="radiogroup"
                    aria-label="Watermark text color"
                    className="mt-4 flex flex-wrap gap-3"
                  >
                    {(Object.keys(WATERMARK_COLORS) as WatermarkColorId[]).map(
                      (id) => {
                        const preset = WATERMARK_COLORS[id];
                        const isSelected = colorId === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={preset.label}
                            onClick={() => setColorId(id)}
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
              </>
            ) : (
              <>
                {/* Image upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Watermark image
                  </h3>
                  <div
                    {...getImageRootProps()}
                    className={`mt-4 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
                      isImageDragActive
                        ? "border-blue-600 bg-blue-50"
                        : "border-blue-300 bg-white"
                    }`}
                  >
                    <input {...getImageInputProps()} />
                    <ImageIcon size={36} className="mx-auto text-blue-600" />
                    <p className="mt-3 text-sm font-medium text-gray-700">
                      {isImageDragActive
                        ? "Drop your image here"
                        : image
                        ? image.name
                        : "Drag & drop or click to upload a PNG / JPG"}
                    </p>
                    <div className="mt-4">
                      <Button variant="secondary" onClick={openImage}>
                        {image ? "Replace Image" : "Select Image"}
                      </Button>
                    </div>
                  </div>
                  {image && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                      <p className="truncate text-sm text-gray-700">
                        {image.name} · {formatFileSize(image.size)}
                      </p>
                      <button
                        onClick={removeImage}
                        aria-label="Remove watermark image"
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Scale */}
                <SliderControl
                  id="watermark-scale"
                  label="Scale"
                  value={scale}
                  min={SCALE_MIN}
                  max={SCALE_MAX}
                  step={0.1}
                  unit="×"
                  onChange={setScale}
                />
              </>
            )}

            {/* Position */}
            <PositionControl value={position} onChange={setPosition} />

            {/* Opacity */}
            <SliderControl
              id="watermark-opacity"
              label="Opacity"
              value={opacity}
              min={OPACITY_MIN}
              max={OPACITY_MAX}
              step={0.05}
              onChange={setOpacity}
            />

            {/* Rotation */}
            <SliderControl
              id="watermark-rotation"
              label="Rotation"
              value={rotation}
              min={ROTATION_MIN}
              max={ROTATION_MAX}
              step={1}
              unit="°"
              onChange={setRotation}
            />

            {/* Apply to */}
            <ApplyToControl value={applyTo} onChange={setApplyTo} />

            <p className="flex items-start gap-2 text-sm text-gray-500">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
              Watermarks are drawn on top of your PDF without modifying the
              original content, page size, rotation or metadata.
            </p>
          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-200/70 bg-gray-50 p-5">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Droplets size={18} className="text-blue-600" />
                Preview
              </h3>
              <Preview options={options} />
              <p className="mt-4 text-center text-sm text-gray-500">
                Live watermark preview
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Action */}
      {file && pageCount !== null && (
        <div className="mt-10 rounded-2xl border border-gray-200/70 bg-white p-6">
          <Button
            onClick={handleWatermark}
            disabled={!canProcess || isProcessing}
            loading={isProcessing}
          >
            {isProcessing ? "Adding Watermark" : "Add Watermark"}
          </Button>
          <p className="mt-3 text-sm text-gray-500">
            The output file will be saved as{" "}
            <span className="font-medium text-gray-700">
              {file.name.replace(/\.pdf$/i, "")}-watermarked.pdf
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
}
