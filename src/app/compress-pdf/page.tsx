import type { Metadata } from "next";
import { FileDown } from "lucide-react";
import CompressTool from "@/components/compress/CompressTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Compress PDF Online Free | PDFNest",
  description:
    "Compress PDF files online for free. Reduce PDF size directly in your browser. No uploads required.",
  alternates: {
    canonical: "/compress-pdf",
  },
  openGraph: {
    title: "Compress PDF Online Free | PDFNest",
    description:
      "Compress PDF files online for free. Reduce PDF size directly in your browser. No uploads required.",
    url: "/compress-pdf",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online Free | PDFNest",
    description:
      "Compress PDF files online for free. Reduce PDF size directly in your browser. No uploads required.",
  },
};

export default function CompressPdfPage() {
  return (
    <ToolLayout
      title="Compress PDF"
      icon={FileDown}
      description="Reduce your PDF's size directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.split,
        TOOL_REFERENCES.extract,
        TOOL_REFERENCES.delete,
      ]}
    >
      <CompressTool />
    </ToolLayout>
  );
}

