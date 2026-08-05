import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import PdfToImagesTool from "@/components/pdfToImages/PdfToImagesTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "PDF to Images Online Free | PDFNest",
  description:
    "Convert PDF pages to JPG or PNG images online for free. No uploads required. Everything works securely in your browser.",
  alternates: {
    canonical: "/pdf-to-images",
  },
  openGraph: {
    title: "PDF to Images Online Free | PDFNest",
    description:
      "Convert PDF pages to JPG or PNG images online for free. No uploads required. Everything works securely in your browser.",
    url: "/pdf-to-images",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Images Online Free | PDFNest",
    description:
      "Convert PDF pages to JPG or PNG images online for free. No uploads required. Everything works securely in your browser.",
  },
};

export default function PdfToImagesPage() {
  return (
    <ToolLayout
      title="PDF to Images"
      icon={ImageIcon}
      description="Convert each PDF page into a high-quality JPG or PNG image directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.split,
        TOOL_REFERENCES.compress,
        TOOL_REFERENCES.rotate,
      ]}
    >
      <PdfToImagesTool />
    </ToolLayout>
  );
}
