"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  ArrowUpDown,
  GripVertical,
  ArrowUpToLine,
  ArrowDownToLine,
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
import { getPageCount } from "@/lib/pdf/split";
import { reorderPdf } from "@/lib/pdf/reorder";
import { iconBoxClass } from "@/lib/uiClasses";

type Page = {
  number: number;
  label: string;
};

function SortablePageCard({
  page,
  index,
  onMoveToTop,
  onMoveToBottom,
  totalPages,
}: {
  page: Page;
  index: number;
  onMoveToTop: (pageNumber: number) => void;
  onMoveToBottom: (pageNumber: number) => void;
  totalPages: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: page.number,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto" as unknown as number,
  };

  // Disabled state is based ONLY on the card's current position in the list.
  const isFirst = index === 0;
  const isLast = index === totalPages - 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-200 ${
        isDragging
          ? "cursor-grabbing border-blue-400 shadow-md"
          : "cursor-grab border-gray-200/70 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        {/* Drag handle — visual cue only, entire card is draggable */}
        <div
          aria-hidden="true"
          className="touch-none rounded-lg p-1.5 text-gray-400"
        >
          <GripVertical size={20} />
        </div>

        {/* Page number */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
          {page.number}
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">
            Page {page.number}
          </p>
          <p className="text-sm text-gray-500">
            Page {page.number} of {totalPages}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {/* Move to top */}
        <button
          type="button"
          onClick={() => onMoveToTop(page.number)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isFirst}
          aria-label={`Move page ${page.number} to top`}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowUpToLine size={16} />
        </button>

        {/* Move to bottom */}
        <button
          type="button"
          onClick={() => onMoveToBottom(page.number)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isLast}
          aria-label={`Move page ${page.number} to bottom`}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowDownToLine size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ReorderTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    getPageCount(file)
      .then((count) => {
        if (!cancelled) {
          setPageCount(count);
          // Build initial page list
          const initialPages: Page[] = [];
          for (let i = 1; i <= count; i++) {
            initialPages.push({ number: i, label: `Page ${i}` });
          }
          setPages(initialPages);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("This file could not be read as a PDF.");
          setFile(null);
          setPageCount(null);
          setPages([]);
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
    setPages([]);
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
    setPages([]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPages((current) => {
      const oldIndex = current.findIndex((p) => p.number === active.id);
      const newIndex = current.findIndex((p) => p.number === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleMoveToTop = (pageNumber: number) => {
    setPages((current) => {
      const index = current.findIndex((p) => p.number === pageNumber);
      if (index <= 0) return current;
      const item = current[index];
      const next = [...current];
      next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const handleMoveToBottom = (pageNumber: number) => {
    setPages((current) => {
      const index = current.findIndex((p) => p.number === pageNumber);
      if (index === -1 || index >= current.length - 1) return current;
      const item = current[index];
      const next = [...current];
      next.splice(index, 1);
      next.push(item);
      return next;
    });
  };

  const handleDownload = async () => {
    if (!file) {
      toast.error("Please upload a PDF.");
      return;
    }

    if (pages.length === 0) {
      toast.error("Nothing to reorder.");
      return;
    }

    try {
      setIsProcessing(true);
      const pageOrder = pages.map((p) => p.number);
      const bytes = await reorderPdf(file, pageOrder);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = file.name.replace(/\.pdf$/i, "") ?? "document";
      saveAs(blob, `${baseName}-reordered.pdf`);
      toast.success("PDF reordered successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("PDF could not be processed.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isOrderChanged = pages.some((page, index) => page.number !== index + 1);

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

      {/* Page reorder list */}
      {file && pageCount !== null && pages.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Rearrange pages
              </h3>
            </div>
            <p className="text-sm text-gray-500">
              Drag to reorder · {pages.length} page
              {pages.length > 1 ? "s" : ""}
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pages.map((p) => p.number)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {pages.map((page, index) => (
                  <SortablePageCard
                    key={page.number}
                    page={page}
                    index={index}
                    onMoveToTop={handleMoveToTop}
                    onMoveToBottom={handleMoveToBottom}
                    totalPages={pages.length}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Download button */}
          <div className="mt-8">
            <Button
              onClick={handleDownload}
              disabled={isProcessing}
              loading={isProcessing}
            >
              {isProcessing ? "Processing" : "Download Reordered PDF"}
            </Button>

            {!isOrderChanged && pageCount !== null && pageCount > 1 && (
              <p className="mt-3 text-sm text-gray-500">
                Drag pages to change their order, then download the result.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
