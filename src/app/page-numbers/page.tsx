import type { Metadata } from "next";
import { Hash } from "lucide-react";
import PageNumbersTool from "@/components/pageNumbers/PageNumbersTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online Free | PDFNest",
  description:
    "Add page numbers to your PDF online for free. Choose position, format, font size, margin and color. No uploads required.",
  alternates: {
    canonical: "/page-numbers",
  },
  openGraph: {
    title: "Add Page Numbers to PDF Online Free | PDFNest",
    description:
      "Add page numbers to your PDF online for free. Choose position, format, font size, margin and color. No uploads required.",
    url: "/page-numbers",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Page Numbers to PDF Online Free | PDFNest",
    description:
      "Add page numbers to your PDF online for free. Choose position, format, font size, margin and color. No uploads required.",
  },
};

export default function PageNumbersPage() {
  return (
    <ToolLayout
      title="Add Page Numbers"
      icon={Hash}
      description="Add page numbers to your PDF directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.split,
        TOOL_REFERENCES.extract,
        TOOL_REFERENCES.delete,
      ]}
    >
      <PageNumbersTool />
    </ToolLayout>
  );
}

