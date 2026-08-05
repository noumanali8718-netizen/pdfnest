"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  UploadCloud,
  Trash2,
  RotateCcw,
  RotateCw,
  ArrowUpToLine,
  ArrowDownToLine,
  GripVertical,
  Image as ImageIcon,
  Download,
  Plus,
  Info,
} from "lucide-react";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import {
  PAGE_MARGINS,
  createImageObjectUrl,
  isSupportedImage,
  loadImageElement,
  computeImagePlacement,
  resolvePageSize,
  getRotatedDimensions,
  imagesToPdf,
  type BackgroundId,
  type ImageFitId,
  type ImageItem,
  type ImagesToPdfOptions,
  type OrientationId,
  type PageMarginId,
  type PageSizeId,
} from "@/lib/pdf/imagesToPdf";

/* ------------------------------------------------------------------ */
/* Settings — single source of truth                                  */
/* ------------------------------------------------------------------ */

const PAGE_SIZE_OPTIONS: { id: PageSizeId; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "a4", label: "A4" },
  { id: "letter", label: "Letter" },
  { id: "legal", label: "Legal" },
];

const ORIENTATION_OPTIONS: { id: OrientationId; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

const MARGIN_OPTIONS: { id: PageMarginId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

const FIT_OPTIONS: { id: ImageFitId; label: string; description: string }[] = [
  { id: "contain", label: "Contain", description: "Whole image fits inside the page" },
  { id: "cover", label: "Cover", description: "Image fills the page, may crop" },
  { id: "stretch", label: "Stretch", description: "Image stretches to fill the page" },
];

const BACKGROUND_OPTIONS: { id: BackgroundId; label: string }[] = [
  { id: "white", label: "White" },
  { id: "transparent", label: "Transparent" },
];

/* ------------------------------------------------------------------ */
/* Helper — preview geometry for a single image                       */
/* ------------------------------------------------------------------ */

type PreviewGeometry = {
  pageWidth: number;
  pageHeight: number;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
};

function computePreviewGeometry(
  image: ImageItem,
  naturalWidth: number,
  naturalHeight: number,
  options: ImagesToPdfOptions
): PreviewGeometry | null {
  if (!naturalWidth || !naturalHeight) return null;

  const rotated = getRotatedDimensions(naturalWidth, naturalHeight, image.rotation);
  const pageSize = resolvePageSize(rotated.width, rotated.height, options);
  const margin = PAGE_MARGINS[options.margin];
  const placement = computeImagePlacement(
    pageSize.width,
    pageSize.height,
    rotated.width,
    rotated.height,
    options.fit,
    margin
  );

  return {
    pageWidth: pageSize.width,
    pageHeight: pageSize.height,
    imageX: placement.x,
    imageY: placement.y,
    imageWidth: placement.width,
    imageHeight: placement.height,
  };
}

/* ------------------------------------------------------------------ */
/* Sortable image card                                                */
/* ------------------------------------------------------------------ */

type SortableImageCardProps = {
  image: ImageItem;
  index: number;
  totalImages: number;
  thumbnailUrl: string;
  dimensions: { width: number; height: number } | null;
  onRemove: (id: string) => void;
  onRotateLeft: (id: string) => void;
  onRotateRight: (id: string) => void;
  onMoveToTop: (id: string) => void;
  onMoveToBottom: (id: string) => void;
};

function SortableImageCard({
  image,
  index,
  totalImages,
  thumbnailUrl,
  dimensions,
  onRemove,
  onRotateLeft,
  onRotateRight,
  onMoveToTop,
  onMoveToBottom,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto" as unknown as number,
  };

  const isFirst = index === 0;
  const isLast = index === totalImages - 1;
  const formatLabel =
    (image.file.type && image.file.type.split("/")[1]?.toUpperCase()) ||
    image.file.name.split(".").pop()?.toUpperCase() ||
    "IMAGE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all ${
        isDragging
          ? "cursor-grabbing border-blue-400 shadow-md"
          : "cursor-grab border-gray-200/70 hover:shadow-md"
      }`}
    >
      {/* Drag handle — visual cue only, entire card is draggable */}
      <div aria-hidden="true" className="touch-none rounded-lg p-1.5 text-gray-400">
        <GripVertical size={20} />
      </div>

      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={`Preview of ${image.file.name}`}
          className="h-full w-full object-contain"
        />
      </div>

      {/* File info + dimensions */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {image.file.name}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {formatLabel} · {formatFileSize(image.file.size)}
          {dimensions && (
            <span className="ml-1">
              · {dimensions.width}×{dimensions.height}
              {image.rotation % 360 !== 0 && (
                <span className="ml-1 font-medium text-blue-600">
                  · rotated {image.rotation}°
                </span>
              )}
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onMoveToTop(image.id)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isFirst}
          aria-label={`Move ${image.file.name} to top`}
          title="Move to top"
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowUpToLine size={16} />
        </button>
        <button
          type="button"
          onClick={() => onMoveToBottom(image.id)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isLast}
          aria-label={`Move ${image.file.name} to bottom`}
          title="Move to bottom"
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowDownToLine size={16} />
        </button>
        <button
          type="button"
          onClick={() => onRotateLeft(image.id)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Rotate ${image.file.name} left`}
          title="Rotate left"
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          onClick={() => onRotateRight(image.id)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Rotate ${image.file.name} right`}
          title="Rotate right"
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RotateCw size={16} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(image.id)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Remove ${image.file.name}`}
          title="Remove"
          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Images To PDF tool                                                 */
/* ------------------------------------------------------------------ */

export default function ImagesToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [dimensions, setDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const objectUrlsRef = useRef<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [pageSize, setPageSize] = useState<PageSizeId>("a4");
  const [orientation, setOrientation] = useState<OrientationId>("auto");
  const [margin, setMargin] = useState<PageMarginId>("medium");
  const [fit, setFit] = useState<ImageFitId>("contain");
  const [background, setBackground] = useState<BackgroundId>("white");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  /* ------- Image loading ------- */

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const supported: File[] = [];
    for (const file of acceptedFiles) {
      if (!isSupportedImage(file)) {
        toast.error(`Unsupported image type: ${file.name}`);
        continue;
      }
      supported.push(file);
    }
    if (supported.length === 0) return;

    const newItems: ImageItem[] = [];
    const newUrls: Record<string, string> = {};
    const now = Date.now();

    supported.forEach((file, index) => {
      const id = `img-${now}-${index}`;
      const url = createImageObjectUrl(file);
      newItems.push({ id, file, rotation: 0 });
      newUrls[id] = url;
    });

    setImages((current) => [...current, ...newItems]);

    setThumbnailUrls((current) => {
      const next = { ...current, ...newUrls };
      return next;
    });

    // Load dimensions asynchronously.
    setDimensions((current) => {
      const next = { ...current };
      newItems.forEach((item) => {
        loadImageElement(newUrls[item.id])
          .then((el) => {
            setDimensions((dims) => ({
              ...dims,
              [item.id]: {
                width: el.naturalWidth,
                height: el.naturalHeight,
              },
            }));
          })
          .catch((error) => {
            console.error(error);
            toast.error(`Image could not be loaded: ${item.file.name}`);
          });
      });
      return next;
    });

    toast.success(
      supported.length === 1
        ? "1 image added"
        : `${supported.length} images added`
    );
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
      "image/gif": [".gif"],
    },
  });

  /* ------- Reordering ------- */

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  }, []);

  const handleMoveToTop = useCallback((id: string) => {
    setImages((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index <= 0) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }, []);

  const handleMoveToBottom = useCallback((id: string) => {
    setImages((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1 || index >= current.length - 1) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.push(item);
      return next;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((current) => current.filter((item) => item.id !== id));

    setThumbnailUrls((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    setDimensions((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    // Revoke the object URL to free memory.
    const url = objectUrlsRef.current[id];
    if (url) {
      URL.revokeObjectURL(url);
      delete objectUrlsRef.current[id];
    }
  }, []);

  const handleRotateLeft = useCallback((id: string) => {
    setImages((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, rotation: (item.rotation - 90 + 360) % 360 }
          : item
      )
    );
  }, []);

  const handleRotateRight = useCallback((id: string) => {
    setImages((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      )
    );
  }, []);

  /* ------- Object URL cleanup on unmount ------- */

  useEffect(() => {
    return () => {
      Object.values(objectUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url)
      );
      objectUrlsRef.current = {};
    };
  }, []);

  /* ------- Options for conversion ------- */

  const options: ImagesToPdfOptions = useMemo(
    () => ({ pageSize, orientation, margin, fit, background }),
    [pageSize, orientation, margin, fit, background]
  );

  /* ------- Live preview (lightweight, CSS-based) ------- */

  const previewGeometry = useMemo(() => {
    if (images.length === 0) return null;
    // Use the first image for the preview, sized to a fixed preview canvas.
    const first = images[0];
    const dims = dimensions[first.id];
    if (!dims) return null;

    const geometry = computePreviewGeometry(first, dims.width, dims.height, options);
    if (!geometry) return null;

    // Scale the page geometry down to a fixed preview width.
    const previewWidth = 260;
    const scale = previewWidth / geometry.pageWidth;
    return {
      pageWidth: previewWidth,
      pageHeight: geometry.pageHeight * scale,
      imageX: geometry.imageX * scale,
      imageY: geometry.imageY * scale,
      imageWidth: geometry.imageWidth * scale,
      imageHeight: geometry.imageHeight * scale,
      fit,
      background,
    };
  }, [images, dimensions, options, fit, background]);

  /* ------- Conversion ------- */

  const handleConvert = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    try {
      setIsProcessing(true);

      // Load image elements (reusing object URLs so no double-loading).
      const loadedImages = new Map<string, HTMLImageElement>();
      for (const item of images) {
        const url =
          thumbnailUrls[item.id] ?? createImageObjectUrl(item.file);
        if (!objectUrlsRef.current[item.id]) {
          objectUrlsRef.current[item.id] = url;
        }
        try {
          const el = await loadImageElement(url);
          loadedImages.set(item.id, el);
        } catch (error) {
          console.error(error);
          toast.error(`Image could not be loaded: ${item.file.name}`);
          return;
        }
      }

      const bytes = await imagesToPdf(images, options, loadedImages);
      const blob = new Blob([bytes], { type: "application/pdf" });

      const baseName =
        images.length === 1
          ? images[0].file.name.replace(/\.[^.]+$/, "") || "image"
          : "images";
      saveAs(blob, `${baseName}.pdf`);

      toast.success(
        images.length === 1
          ? "Image converted to PDF successfully!"
          : `${images.length} images converted to PDF successfully!`
      );
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message || "PDF generation failed");
      } else {
        toast.error("PDF generation failed");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const canConvert = images.length > 0 && !isProcessing;

  /* ------- Render helpers for options ------- */

  const renderOptionGroup = <T extends string>({
    title,
    options: opts,
    value,
    onChange,
    columns = 2,
  }: {
    title: string;
    options: { id: T; label: string; description?: string }[];
    value: T;
    onChange: (value: T) => void;
    columns?: number;
  }) => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div
        role="radiogroup"
        aria-label={title}
        className={`mt-4 grid gap-3 ${
          columns === 4 ? "grid-cols-2 sm:grid-cols-4" : `grid-cols-2 sm:grid-cols-${columns}`
        }`}
      >
        {opts.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.id)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isSelected
                  ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-600"
                  : "border-gray-200/70 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="block font-semibold">{option.label}</span>
              {option.description && (
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
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
          {isDragActive ? "Drop your images here" : "Drag & Drop your images"}
        </h2>
        <p className="mt-3 text-gray-500">
          or click the button below to select images
        </p>
        <p className="mt-3 text-xs text-gray-400">
          JPG · PNG · WEBP · BMP · GIF — add as many as you like
        </p>
        <div className="mt-8">
          <Button onClick={open}>Select Images</Button>
        </div>
      </div>

      {/* Image list + settings */}
      {images.length > 0 && (
        <div className="mt-8 space-y-8">
          {/* Image list */}
          <div className="rounded-2xl border border-gray-200/70 bg-gray-50 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Your images
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                  {images.length} image{images.length > 1 ? "s" : ""} ·{" "}
                  {formatFileSize(
                    images.reduce((sum, item) => sum + item.file.size, 0)
                  )}
                </p>
                <Button variant="secondary" onClick={open}>
                  <Plus size={16} />
                  Add More
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {images.map((image, index) => (
                    <SortableImageCard
                      key={image.id}
                      image={image}
                      index={index}
                      totalImages={images.length}
                      thumbnailUrl={thumbnailUrls[image.id] ?? ""}
                      dimensions={dimensions[image.id] ?? null}
                      onRemove={handleRemove}
                      onRotateLeft={handleRotateLeft}
                      onRotateRight={handleRotateRight}
                      onMoveToTop={handleMoveToTop}
                      onMoveToBottom={handleMoveToBottom}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <p className="mt-4 text-center text-xs text-gray-400">
              Drag images to reorder them before converting
            </p>
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              PDF settings
            </h3>
            <div className="mt-6 space-y-8">
              {renderOptionGroup({
                title: "Page size",
                options: PAGE_SIZE_OPTIONS,
                value: pageSize,
                onChange: setPageSize,
                columns: 4,
              })}

              {renderOptionGroup({
                title: "Orientation",
                options: ORIENTATION_OPTIONS,
                value: orientation,
                onChange: setOrientation,
                columns: 3,
              })}

              {renderOptionGroup({
                title: "Margins",
                options: MARGIN_OPTIONS,
                value: margin,
                onChange: setMargin,
                columns: 4,
              })}

              {renderOptionGroup({
                title: "Image fit",
                options: FIT_OPTIONS,
                value: fit,
                onChange: setFit,
                columns: 3,
              })}

              {renderOptionGroup({
                title: "Background",
                options: BACKGROUND_OPTIONS,
                value: background,
                onChange: setBackground,
                columns: 2,
              })}
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            {previewGeometry ? (
              <div className="mt-4 flex flex-col items-center gap-4 lg:flex-row lg:items-start">
                <div
                  className={`rounded-md border shadow-sm ${
                    background === "transparent"
                      ? "bg-slate-100"
                      : "bg-white"
                  }`}
                  style={{
                    width: previewGeometry.pageWidth,
                    height: previewGeometry.pageHeight,
                    maxHeight: 400,
                  }}
                  role="img"
                  aria-label="Live preview of the first image on the page"
                >
                  <div
                    className="relative h-full w-full"
                    style={
                      fit === "cover"
                        ? { overflow: "hidden" }
                        : undefined
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailUrls[images[0]?.id] ?? ""}
                      alt=""
                      className="absolute"
                      style={{
                        left: previewGeometry.imageX,
                        top: previewGeometry.imageY,
                        width: previewGeometry.imageWidth,
                        height: previewGeometry.imageHeight,
                        objectFit:
                          fit === "stretch"
                            ? "fill"
                            : fit === "cover"
                            ? "cover"
                            : "contain",
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <Info size={16} className="text-blue-600" />
                    Live preview of page 1 using {PAGE_SIZE_OPTIONS.find((o) => o.id === pageSize)?.label} size
                    {pageSize !== "original" && ` · ${ORIENTATION_OPTIONS.find((o) => o.id === orientation)?.label}`} at
                    {MARGIN_OPTIONS.find((o) => o.id === margin)?.label} margins.
                  </p>
                  <p className="mt-1">
                    This is a lightweight visual guide — the real PDF is generated once when you click Convert.
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                Preview will appear once your first image finishes loading.
              </p>
            )}
          </div>

          {/* Convert */}
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
            <Button
              onClick={handleConvert}
              disabled={!canConvert}
              loading={isProcessing}
            >
              {isProcessing ? "Converting" : (
                <>
                  <Download size={16} />
                  {images.length === 1 ? "Convert to PDF" : "Convert to PDF"}
                </>
              )}
            </Button>
            <p className="mt-3 text-sm text-gray-500">
              The output file will be saved as{" "}
              <span className="font-medium text-gray-700">
                {images.length === 1
                  ? images[0].file.name.replace(/\.[^.]+$/, "") + ".pdf"
                  : "images.pdf"}
              </span>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

