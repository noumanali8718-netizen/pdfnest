import type { Metadata } from "next";
import { ArrowUpDown } from "lucide-react";
import ReorderTool from "@/components/reorder/ReorderTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Reorder PDF Pages Online Free | PDFNest",
  description:
    "Rearrange PDF pages online using drag and drop. Fast, secure and browser-based.",
  alternates: {
    canonical: "/reorder-pages",
  },
  openGraph: {
    title: "Reorder PDF Pages Online Free | PDFNest",
    description:
      "Rearrange PDF pages online using drag and drop. Fast, secure and browser-based.",
    url: "/reorder-pages",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reorder PDF Pages Online Free | PDFNest",
    description:
      "Rearrange PDF pages online using drag and drop. Fast, secure and browser-based.",
  },
};

export default function ReorderPagesPage() {
  return (
    <ToolLayout
      title="Reorder PDF Pages"
      icon={ArrowUpDown}
      description="Rearrange PDF pages directly in your browser using drag and drop. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.split,
        TOOL_REFERENCES.compress,
        TOOL_REFERENCES.extract,
      ]}
    >
      <ReorderTool />
    </ToolLayout>
  );
}
