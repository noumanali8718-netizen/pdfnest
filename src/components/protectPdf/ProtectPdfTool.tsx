"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  Trash2,
  Shield,
  Lock,
  KeyRound,
  EyeOff,
  Info,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatFileSize } from "@/lib/fileUtils";
import { iconBoxClass } from "@/lib/uiClasses";
import {
  protectPdf,
  PERMISSION_PRESETS,
  type PermissionPresetId,
  type ProtectPdfOptions,
} from "@/lib/pdf/protectPdf";

export default function ProtectPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirmOwner, setConfirmOwner] = useState("");
  const [preset, setPreset] = useState<PermissionPresetId>("full-access");
  const [isProcessing, setIsProcessing] = useState(false);

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
  };

  const handleProtect = async () => {
    if (!file) {
      toast.error("Please upload a PDF first.");
      return;
    }

    const user = userPassword.trim();
    const owner = ownerPassword.trim();

    if (!user) {
      toast.error("Enter a user password.");
      return;
    }
    if (!owner) {
      toast.error("Enter an owner password.");
      return;
    }
    if (owner !== confirmOwner.trim()) {
      toast.error("Owner passwords do not match.");
      return;
    }
    if (user === owner) {
      toast.error("User and owner passwords must be different.");
      return;
    }

    const options: ProtectPdfOptions = {
      userPassword: user,
      ownerPassword: owner,
      preset,
    };

    try {
      setIsProcessing(true);
      const bytes = await protectPdf(file, options);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const baseName = file.name.replace(/\.pdf$/i, "") ?? "document";
      saveAs(blob, `${baseName}-protected.pdf`);
      toast.success("PDF encrypted successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PDF could not be processed.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const canProtect =
    !!file &&
    userPassword.trim().length > 0 &&
    ownerPassword.trim().length > 0 &&
    confirmOwner.trim().length > 0 &&
    ownerPassword.trim() === confirmOwner.trim() &&
    userPassword.trim() !== ownerPassword.trim();

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

      {/* Encryption notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <Lock
          size={20}
          className="mt-0.5 shrink-0 text-blue-600"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold text-gray-900">
            Browser-based encryption
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            Your PDF is encrypted entirely in your browser using 128-bit AES
            encryption. The file never leaves your device.
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

      {/* Password and options */}
      {file && (
        <div className="mt-8 space-y-8">
          {/* User password */}
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <KeyRound size={18} className="text-blue-600" />
              User Password
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Readers must enter this password to open the PDF.
            </p>
            <label htmlFor="user-password" className="sr-only">
              User password
            </label>
            <input
              id="user-password"
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder="Enter user password"
              autoComplete="off"
              className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Owner password */}
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Shield size={18} className="text-blue-600" />
              Owner Password
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Grants full access and allows changing permissions. Must be
              different from the user password.
            </p>

            <label htmlFor="owner-password" className="sr-only">
              Owner password
            </label>
            <input
              id="owner-password"
              type="password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder="Enter owner password"
              autoComplete="off"
              className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            <label htmlFor="confirm-owner" className="sr-only">
              Confirm owner password
            </label>
            <input
              id="confirm-owner"
              type="password"
              value={confirmOwner}
              onChange={(e) => setConfirmOwner(e.target.value)}
              placeholder="Confirm owner password"
              autoComplete="off"
              className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            {ownerPassword.trim().length > 0 &&
              confirmOwner.trim().length > 0 &&
              ownerPassword.trim() !== confirmOwner.trim() && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                  <EyeOff size={14} />
                  Passwords do not match.
                </p>
              )}
          </div>

          {/* Permission preset */}
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Lock size={18} className="text-blue-600" />
              Permission Preset
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Choose what readers with the user password are allowed to do.
            </p>

            <div
              role="radiogroup"
              aria-label="Permission preset"
              className="mt-4 grid gap-3"
            >
              {PERMISSION_PRESETS.map((p) => {
                const isSelected = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setPreset(p.id)}
                    className={`rounded-2xl border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600"
                        : "border-gray-200/70 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{p.label}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action */}
          <div className="rounded-2xl border border-gray-200/70 bg-white p-6">
            <Button
              onClick={handleProtect}
              disabled={!canProtect || isProcessing}
              loading={isProcessing}
            >
              {isProcessing ? "Encrypting" : "Protect PDF"}
            </Button>
            <p className="mt-3 text-sm text-gray-500">
              The encrypted file will be saved as{" "}
              <span className="font-medium text-gray-700">
                {file.name.replace(/\.pdf$/i, "")}-protected.pdf
              </span>
              .
            </p>
          </div>

          <p className="flex items-start gap-2 text-sm text-gray-500">
            <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
            Keep your passwords safe. If you lose the owner password, the PDF
            cannot be unlocked. The original file is never modified.
          </p>
        </div>
      )}
    </div>
  );
}

