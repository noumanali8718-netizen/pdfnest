import type { Metadata } from "next";
import { FileImage } from "lucide-react";
import ImagesToPdfTool from "@/components/imagesToPdf/ImagesToPdfTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Images to PDF Online Free | PDFNest",
  description:
    "Convert JPG, PNG, WEBP, BMP and GIF images into a single PDF online for free. No uploads required. Everything works securely in your browser.",
  alternates: {
    canonical: "/images-to-pdf",
  },
  openGraph: {
    title: "Images to PDF Online Free | PDFNest",
    description:
      "Convert JPG, PNG, WEBP, BMP and GIF images into a single PDF online for free. No uploads required. Everything works securely in your browser.",
    url: "/images-to-pdf",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Images to PDF Online Free | PDFNest",
    description:
      "Convert JPG, PNG, WEBP, BMP and GIF images into a single PDF online for free. No uploads required. Everything works securely in your browser.",
  },
};

export default function ImagesToPdfPage() {
  return (
    <ToolLayout
      title="Images to PDF"
      icon={FileImage}
      description="Combine JPG, PNG, WEBP, BMP and GIF images into a single PDF directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.pdfToImages,
        TOOL_REFERENCES.compress,
        TOOL_REFERENCES.watermark,
      ]}
    >
      <ImagesToPdfTool />
    </ToolLayout>
  );
}
