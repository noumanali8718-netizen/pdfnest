"use client";

import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import SortableFileItem from "./SortableFileItem";
import Button from "./Button";
import { mergePdf } from "@/lib/mergePdf";
import { FileItem, generateFileId } from "@/lib/types";

type UploadBoxProps = {
  className?: string;
};

export default function UploadBox({ className = "" }: UploadBoxProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  // Guards against duplicate merge submissions while a merge is already running.
  const mergeInFlight = useRef(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleAddFiles = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const newItems: FileItem[] = acceptedFiles.map((file) => ({
      id: generateFileId(),
      file,
    }));

    setSelectedFiles((previous) => [...previous, ...newItems]);
    toast.success(
      acceptedFiles.length === 1
        ? "1 PDF file added"
        : `${acceptedFiles.length} PDF files added`
    );
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: handleAddFiles,
    onDropRejected: () => {
      toast.error("Only PDF files are accepted.");
    },
    multiple: true,
    noClick: true,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = useCallback((idToRemove: string) => {
    setSelectedFiles((previous) => previous.filter((item) => item.id !== idToRemove));
  }, []);

  const moveFileUp = useCallback((index: number) => {
    setSelectedFiles((previous) => {
      if (index <= 0 || index >= previous.length) return previous;
      return arrayMove(previous, index, index - 1);
    });
  }, []);

  const moveFileDown = useCallback((index: number) => {
    setSelectedFiles((previous) => {
      if (index < 0 || index >= previous.length - 1) return previous;
      return arrayMove(previous, index, index + 1);
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setSelectedFiles((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return items;

      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const sortableItems = useMemo(() => selectedFiles.map((item) => item.id), [selectedFiles]);

  const handleMergePdf = async () => {
    if (selectedFiles.length < 2) {
      toast.error("Please select at least two PDF files to merge.");
      return;
    }

    // Prevent duplicate submissions while a merge is already running.
    if (mergeInFlight.current || isMerging) return;
    mergeInFlight.current = true;

    try {
      setIsMerging(true);

      const files = selectedFiles.map((item) => item.file);
      const mergedBytes = await mergePdf(files);

      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      saveAs(blob, "merged.pdf");

      toast.success("Your PDFs have been merged successfully.");
    } catch {
      // Keep the user-facing error simple and safe. Do not expose internal
      // stack traces or implementation details. This covers password-protected,
      // corrupted, or otherwise unreadable PDFs rejected by pdf-lib.
      toast.error(
        "One or more PDFs could not be read. Please check that the files are valid and not password-protected."
      );
    } finally {
      mergeInFlight.current = false;
      setIsMerging(false);
    }
  };

  const totalSize = selectedFiles.reduce((total, item) => total + item.file.size, 0);

  return (
    <div className={`w-full max-w-3xl ${className}`}>
      <div
        {...getRootProps()}
        className={`group cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 ease-out sm:p-14 ${
          isDragActive
            ? "border-blue-500 bg-blue-50/80 shadow-[0_20px_50px_rgba(37,99,235,0.15)]"
            : "border-blue-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-[0_16px_40px_rgba(16,24,40,0.08)]"
        }`}
      >
        <input {...getInputProps()} />

        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600 ${
            isDragActive ? "scale-110 bg-blue-600 text-white ring-blue-600" : ""
          }`}
        >
          <UploadCloud size={30} strokeWidth={1.5} />
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {isDragActive ? "Drop your PDFs here" : "Upload PDF"}
        </h2>

        <p className="mt-3 text-lg text-slate-500">
          {isDragActive ? (
            "Release to add your files"
          ) : (
            <>
              Drop files here <span className="text-slate-300">&bull;</span> or choose files
            </>
          )}
        </p>

        <p className="mt-6 text-sm text-slate-400">
          PDFs only &bull; No upload to servers &bull; Processes on your device
        </p>

        <div className="mt-8">
          <Button onClick={open}>Select PDF Files</Button>
        </div>
      </div>

      {selectedFiles.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-gray-200/70 bg-gray-50 p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selectedFiles.length} File{selectedFiles.length > 1 ? "s" : ""}
              </p>

              <p className="mt-0.5 text-sm text-gray-500">
                Total Size: {(totalSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={clearAllFiles}>
                Clear All
              </Button>

              <Button onClick={handleMergePdf} disabled={isMerging} loading={isMerging}>
                {isMerging ? "Merging" : "Merge PDFs"}
              </Button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {selectedFiles.map((item, index) => (
                  <SortableFileItem
                    key={item.id}
                    id={item.id}
                    file={item.file}
                    index={index}
                    totalItems={selectedFiles.length}
                    onRemove={removeFile}
                    onMoveUp={moveFileUp}
                    onMoveDown={moveFileDown}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <p className="mt-4 text-center text-xs text-gray-400">
            Drag files or use the arrows to reorder them before merging
          </p>
        </div>
      ) : null}
    </div>
  );
}
