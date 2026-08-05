import type { Metadata } from "next";
import { Droplets } from "lucide-react";
import WatermarkTool from "@/components/watermark/WatermarkTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online Free | PDFNest",
  description:
    "Add text or image watermarks to your PDF online for free. Choose position, rotation, opacity, scale and color. No uploads required.",
  alternates: {
    canonical: "/watermark-pdf",
  },
  openGraph: {
    title: "Add Watermark to PDF Online Free | PDFNest",
    description:
      "Add text or image watermarks to your PDF online for free. Choose position, rotation, opacity, scale and color. No uploads required.",
    url: "/watermark-pdf",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Watermark to PDF Online Free | PDFNest",
    description:
      "Add text or image watermarks to your PDF online for free. Choose position, rotation, opacity, scale and color. No uploads required.",
  },
};

export default function WatermarkPdfPage() {
  return (
    <ToolLayout
      title="Watermark PDF"
      icon={Droplets}
      description="Add text or image watermarks to your PDF directly in your browser. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.pageNumbers,
        TOOL_REFERENCES.rotate,
        TOOL_REFERENCES.compress,
      ]}
    >
      <WatermarkTool />
    </ToolLayout>
  );
}
