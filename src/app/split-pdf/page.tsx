import type { Metadata } from "next";
import { Scissors } from "lucide-react";
import SplitTool from "@/components/split/SplitTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Split PDF Online Free | PDFNest",
  description:
    "Split one PDF into multiple PDFs online for free. Extract every page, a range, or chunks directly in your browser. No uploads required.",
  alternates: {
    canonical: "/split-pdf",
  },
  openGraph: {
    title: "Split PDF Online Free | PDFNest",
    description:
      "Split one PDF into multiple PDFs online for free. Extract every page, a range, or chunks directly in your browser. No uploads required.",
    url: "/split-pdf",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Online Free | PDFNest",
    description:
      "Split one PDF into multiple PDFs online for free. Extract every page, a range, or chunks directly in your browser. No uploads required.",
  },
};

export default function SplitPdfPage() {
  return (
    <ToolLayout
      title="Split PDF"
      icon={Scissors}
      description="Split one PDF into multiple PDFs directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.extract,
        TOOL_REFERENCES.delete,
        TOOL_REFERENCES.compress,
      ]}
    >
      <SplitTool />
    </ToolLayout>
  );
}

