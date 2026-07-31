"use client";

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
  arrayMove,
} from "@dnd-kit/sortable";

import SortableFileItem from "./SortableFileItem";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import { mergePdf } from "@/lib/mergePdf";
import Button from "./Button";

export default function UploadBox() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const sensors = useSensors(
  useSensor(PointerSensor)
);
  const [isMerging, setIsMerging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFiles((previous) => [
        ...previous,
        ...acceptedFiles,
      ]);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((previous) =>
      previous.filter((_, index) => index !== indexToRemove)
    );
  };
  const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  setSelectedFiles((files) => {
    const oldIndex = files.findIndex(
      (_, index) => active.id === files[index].name + index
    );

    const newIndex = files.findIndex(
      (_, index) => over.id === files[index].name + index
    );

    return arrayMove(files, oldIndex, newIndex);
  });
};

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const handleMergePdf = async () => {
    if (selectedFiles.length < 2) {
      toast.error("Please select at least 2 PDF files.");
      return;
    }

    try {
      setIsMerging(true);

const mergedBytes = await mergePdf(selectedFiles);

      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });

      saveAs(blob, "merged.pdf");

      toast.success("PDF merged successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while merging.");
    } finally {
      setIsMerging(false);
    }
  };

  const totalSize = selectedFiles.reduce(
    (total, file) => total + file.size,
    0
  );

  return (
    <div className="mx-auto mt-16 max-w-3xl">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
          isDragActive
            ? "border-blue-600 bg-blue-50"
            : "border-blue-300 bg-white"
        }`}
      >
        <input {...getInputProps()} />

        <UploadCloud
          size={60}
          className="mx-auto text-blue-600"
        />

        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          {isDragActive
            ? "Drop your PDFs here"
            : "Drag & Drop your PDFs"}
        </h2>

        <p className="mt-3 text-gray-500">
          or click the button below
        </p>

        <div className="mt-8">
          <Button onClick={open}>
            Select PDF Files
          </Button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-8 rounded-xl border bg-gray-50 p-6">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="font-semibold text-gray-900">
                {selectedFiles.length} File
                {selectedFiles.length > 1 ? "s" : ""}
              </p>

              <p className="text-sm text-gray-500">
                Total Size: {(totalSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="flex gap-3">

              <Button
                variant="secondary"
                onClick={clearAllFiles}
              >
                Clear All
              </Button>

              <Button
                onClick={handleMergePdf}
                disabled={isMerging}
              >
                {isMerging
                  ? "Merging..."
                  : "Merge PDFs"}
              </Button>

            </div>

          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedFiles.map((file, index) => file.name + index)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {selectedFiles.map((file, index) => (
                  <SortableFileItem
                    key={file.name + index}
                    file={file}
                    index={index}
                    onRemove={removeFile}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

        </div>
      )}
    </div>
  );
}