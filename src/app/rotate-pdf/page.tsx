import type { Metadata } from "next";
import { RotateCw } from "lucide-react";
import RotateTool from "@/components/rotate/RotateTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Rotate PDF Online Free | PDFNest",
  description:
    "Rotate PDF pages online for free. Rotate all pages or selected pages directly in your browser.",
  alternates: {
    canonical: "/rotate-pdf",
  },
  openGraph: {
    title: "Rotate PDF Online Free | PDFNest",
    description:
      "Rotate PDF pages online for free. Rotate all pages or selected pages directly in your browser.",
    url: "/rotate-pdf",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Online Free | PDFNest",
    description:
      "Rotate PDF pages online for free. Rotate all pages or selected pages directly in your browser.",
  },
};

export default function RotatePdfPage() {
  return (
    <ToolLayout
      title="Rotate PDF"
      icon={RotateCw}
      description="Rotate PDF pages directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.split,
        TOOL_REFERENCES.compress,
        TOOL_REFERENCES.extract,
      ]}
    >
      <RotateTool />
    </ToolLayout>
  );
}

