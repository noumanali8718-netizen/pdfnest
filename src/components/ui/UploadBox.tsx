"use client";

import { useRef, useState } from "react";
import Button from "./Button";

export default function UploadBox() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-3xl rounded-2xl border-2 border-dashed border-blue-300 bg-white p-10 text-center shadow-sm">
      <div className="text-6xl">📄</div>

      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        {selectedFile
          ? "File Selected Successfully"
          : "Drag & Drop your PDF here"}
      </h2>

      <p className="mt-3 text-gray-500">
        {selectedFile
          ? selectedFile.name
          : "or click below to choose a file"}
      </p>

      <div className="mt-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={handleSelectFile}
        />

        <Button onClick={() => fileInputRef.current?.click()}>
          {selectedFile ? "Choose Another PDF" : "Select PDF"}
        </Button>
      </div>

      {selectedFile && (
        <p className="mt-6 text-sm text-green-600">
          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
      )}
    </div>
  );
}