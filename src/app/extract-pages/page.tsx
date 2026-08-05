import type { Metadata } from "next";
import { FileSearch } from "lucide-react";
import ExtractTool from "@/components/extract/ExtractTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Extract Pages from PDF Online Free | PDFNest",
  description:
    "Extract specific pages from a PDF file online for free. No uploads required. Everything works securely in your browser.",
  alternates: {
    canonical: "/extract-pages",
  },
  openGraph: {
    title: "Extract Pages from PDF Online Free | PDFNest",
    description:
      "Extract specific pages from a PDF file online for free. No uploads required. Everything works securely in your browser.",
    url: "/extract-pages",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Extract Pages from PDF Online Free | PDFNest",
    description:
      "Extract specific pages from a PDF file online for free. No uploads required. Everything works securely in your browser.",
  },
};

export default function ExtractPagesPage() {
  return (
    <ToolLayout
      title="Extract Pages"
      icon={FileSearch}
      description="Extract the pages you need from a PDF directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.split,
        TOOL_REFERENCES.delete,
        TOOL_REFERENCES.compress,
      ]}
    >
      <ExtractTool />
    </ToolLayout>
  );
}

