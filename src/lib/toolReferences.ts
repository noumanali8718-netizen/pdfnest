import {
  Files,
  Scissors,
  FileDown,
  RotateCw,
  FileSearch,
  FileX,
  ArrowUpDown,
  Hash,
Droplets,
  Image as ImageIcon,
  FileImage,
  Shield,
} from "lucide-react";
import type { RelatedTool } from "@/components/tool/RelatedTools";

// Central registry of available PDF tool metadata.
// Used by RelatedTools across tool pages to avoid duplicating
// icon/title/description/href/status definitions in every page.
export const TOOL_REFERENCES: Record<string, RelatedTool> = {
  merge: {
    icon: Files,
    title: "Merge PDF",
    description: "Combine multiple PDFs into one document in seconds.",
    status: "available",
    href: "/",
  },
  split: {
    icon: Scissors,
    title: "Split PDF",
    description: "Separate pages into individual PDF files instantly.",
    status: "available",
    href: "/split-pdf",
  },
compress: {
    icon: FileDown,
    title: "Compress PDF",
    description: "Reduce file size while keeping quality intact.",
    status: "available",
    href: "/compress-pdf",
  },
pdfToImages: {
    icon: ImageIcon,
    title: "PDF to Images",
    description: "Convert each PDF page into a JPG or PNG image.",
    status: "available",
    href: "/pdf-to-images",
  },
  imagesToPdf: {
    icon: FileImage,
    title: "Images to PDF",
    description: "Combine JPG, PNG, WEBP, BMP and GIF images into one PDF.",
    status: "available",
    href: "/images-to-pdf",
  },
  extract: {
    icon: FileSearch,
    title: "Extract Pages",
    description: "Extract selected pages into a new PDF document.",
    status: "available",
    href: "/extract-pages",
  },
  delete: {
    icon: FileX,
    title: "Delete Pages",
    description: "Remove unwanted pages from any PDF file.",
    status: "available",
    href: "/delete-pages",
  },
rotate: {
    icon: RotateCw,
    title: "Rotate PDF",
    description: "Rotate pages to the correct orientation.",
    status: "available",
    href: "/rotate-pdf",
  },
  reorder: {
    icon: ArrowUpDown,
    title: "Reorder Pages",
    description: "Drag and drop pages into any order you like.",
    status: "available",
    href: "/reorder-pages",
  },
  pageNumbers: {
    icon: Hash,
    title: "Add Page Numbers",
    description: "Add page numbers to your PDF in seconds.",
    status: "available",
    href: "/page-numbers",
  },
  watermark: {
    icon: Droplets,
    title: "Watermark PDF",
    description: "Add text or image watermarks to any PDF.",
    status: "available",
    href: "/watermark-pdf",
  },
  protectPdf: {
    icon: Shield,
    title: "Protect PDF",
    description: "Password-protect your PDF files with encryption and permission presets.",
    status: "available",
    href: "/protect-pdf",
  },
};

