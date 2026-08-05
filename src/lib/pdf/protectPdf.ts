import {
  PDFDocument,
  PDFHeader,
  type SecurityOptions,
} from "@cantoo/pdf-lib";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type PermissionPresetId =
  | "full-access"
  | "no-printing"
  | "no-copying"
  | "no-modifying"
  | "restricted";

export type PermissionPreset = {
  id: PermissionPresetId;
  label: string;
  description: string;
};

export type ProtectPdfOptions = {
  /** Password a reader must enter to open the PDF. */
  userPassword: string;
  /** Password that grants full (owner) access, bypassing restrictions. */
  ownerPassword: string;
  /** Permission preset applied to the document. */
  preset: PermissionPresetId;
};

/* ------------------------------------------------------------------ */
/* Constants — single source of truth for the permission presets       */
/* ------------------------------------------------------------------ */

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: "full-access",
    label: "Full Access",
    description: "Readers can print, copy and modify after entering the password.",
  },
  {
    id: "no-printing",
    label: "No Printing",
    description: "Readers can view, copy and annotate but cannot print.",
  },
  {
    id: "no-copying",
    label: "No Copying",
    description: "Readers can view and print but cannot copy or extract text.",
  },
  {
    id: "no-modifying",
    label: "No Modifying",
    description: "Readers can view and print but cannot edit, annotate or fill forms.",
  },
  {
    id: "restricted",
    label: "Restricted",
    description: "Readers can only view. Printing, copying and editing are disabled.",
  },
];

/**
 * Map a permission preset to the `UserPermissions` object passed to
 * `pdfDoc.encrypt()`. All fields default to `false` (denied) unless the
 * preset explicitly grants them, giving the most restrictive baseline.
 */
function presetToPermissions(
  preset: PermissionPresetId
): NonNullable<SecurityOptions["permissions"]> {
  switch (preset) {
    case "full-access":
      return {
        printing: true,
        modifying: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true,
      };
    case "no-printing":
      return {
        printing: false,
        modifying: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true,
      };
    case "no-copying":
      return {
        printing: true,
        modifying: true,
        copying: false,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true,
      };
    case "no-modifying":
      return {
        printing: true,
        modifying: false,
        copying: true,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      };
    case "restricted":
    default:
      return {
        printing: false,
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      };
  }
}

/* ------------------------------------------------------------------ */
/* Main API                                                           */
/* ------------------------------------------------------------------ */

/**
 * Encrypt a PDF with a user password and an owner password, applying a
 * permission preset. Runs entirely in the browser.
 *
 * The encryption algorithm is selected by `@cantoo/pdf-lib` based on the
 * document header version. To guarantee a strong, broadly-compatible cipher
 * regardless of the input file, the pages are copied into a fresh document
 * whose header is forced to PDF 1.7, which the library maps to revision 4
 * (128-bit AES). The original file is never uploaded anywhere.
 *
 * @param file    - The PDF file to protect.
 * @param options - User password, owner password and permission preset.
 * @returns      - The encrypted PDF bytes ready for download.
 */
export async function protectPdf(
  file: File,
  options: ProtectPdfOptions
): Promise<Uint8Array<ArrayBuffer>> {
  if (!options.userPassword.trim()) {
    throw new Error("A user password is required.");
  }
  if (!options.ownerPassword.trim()) {
    throw new Error("An owner password is required.");
  }

  const fileBytes = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(fileBytes);
  const outputPdf = await PDFDocument.create();

  // Copy every page so the output document is independent of the source
  // (allowing us to control the header/encryption below).
  const totalPages = sourcePdf.getPageCount();
  if (totalPages === 0) {
    throw new Error("This PDF has no pages.");
  }
  const pageIndices = sourcePdf.getPageIndices();
  const copiedPages = await outputPdf.copyPages(sourcePdf, pageIndices);
  copiedPages.forEach((page) => outputPdf.addPage(page));

  // Force PDF 1.7 so the encryption uses AES-128 (revision 4) rather than
  // the weaker RC4 cipher that older headers would select.
  outputPdf.context.header = PDFHeader.forVersion(1, 7);

  outputPdf.encrypt({
    userPassword: options.userPassword,
    ownerPassword: options.ownerPassword,
    permissions: presetToPermissions(options.preset),
  });

  const saved = await outputPdf.save();
  // Copy into a fresh ArrayBuffer-backed Uint8Array so the bytes are
  // guaranteed to be a valid BlobPart (the library returns ArrayBufferLike).
  return new Uint8Array(saved);
}
