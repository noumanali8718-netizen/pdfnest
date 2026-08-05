import type { Metadata } from "next";
import { FileX } from "lucide-react";
import DeleteTool from "@/components/delete/DeleteTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Delete Pages from PDF Online Free | PDFNest",
  description:
    "Delete pages from a PDF file online for free. Remove unwanted pages directly in your browser. No uploads required.",
  alternates: {
    canonical: "/delete-pages",
  },
  openGraph: {
    title: "Delete Pages from PDF Online Free | PDFNest",
    description:
      "Delete pages from a PDF file online for free. Remove unwanted pages directly in your browser. No uploads required.",
    url: "/delete-pages",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Delete Pages from PDF Online Free | PDFNest",
    description:
      "Delete pages from a PDF file online for free. Remove unwanted pages directly in your browser. No uploads required.",
  },
};

export default function DeletePagesPage() {
  return (
    <ToolLayout
      title="Delete Pages"
      icon={FileX}
      description="Remove unwanted pages from a PDF directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.split,
        TOOL_REFERENCES.extract,
        TOOL_REFERENCES.compress,
      ]}
    >
      <DeleteTool />
    </ToolLayout>
  );
}

