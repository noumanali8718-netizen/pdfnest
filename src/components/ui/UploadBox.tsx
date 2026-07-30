"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, UploadCloud } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import { mergePdf } from "@/lib/mergePdf";
import Button from "./Button";

export default function UploadBox() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

      const blob = new Blob([mergedBytes], {
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

          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium">
                    📄 {file.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}