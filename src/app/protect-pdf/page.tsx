import type { Metadata } from "next";
import { Shield } from "lucide-react";
import ProtectPdfTool from "@/components/protectPdf/ProtectPdfTool";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Protect PDF with Password Online Free | PDFNest",
  description:
    "Password-protect and encrypt a PDF online for free with permission presets. No uploads required — everything works securely in your browser.",
  alternates: {
    canonical: "/protect-pdf",
  },
  openGraph: {
    title: "Protect PDF with Password Online Free | PDFNest",
    description:
      "Password-protect and encrypt a PDF online for free with permission presets. No uploads required — everything works securely in your browser.",
    url: "/protect-pdf",
    siteName: "PDFNest",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Protect PDF with Password Online Free | PDFNest",
    description:
      "Password-protect and encrypt a PDF online for free with permission presets. No uploads required — everything works securely in your browser.",
  },
};

export default function ProtectPdfPage() {
  return (
    <ToolLayout
      title="Protect PDF"
      icon={Shield}
      description="Encrypt your PDF with a password directly in your browser and choose what readers are allowed to do. No uploads required."
      relatedTools={[
        TOOL_REFERENCES.merge,
        TOOL_REFERENCES.watermark,
        TOOL_REFERENCES.compress,
        TOOL_REFERENCES.pageNumbers,
      ]}
    >
      <ProtectPdfTool />
    </ToolLayout>
  );
}

