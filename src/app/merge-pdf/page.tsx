import type { Metadata } from "next";
import { Files } from "lucide-react";

import UploadBox from "@/components/ui/UploadBox";
import ToolLayout from "@/components/tool/ToolLayout";
import { TOOL_REFERENCES } from "@/lib/toolReferences";

export const metadata: Metadata = {
  title: "Merge PDF Online Free | PDFNest",
  description:
    "Merge multiple PDF files into one document for free. Secure, fast, and works entirely in your browser.",
};

export default function MergePdfPage() {
  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into a single document directly in your browser. No uploads required."
      icon={Files}
      relatedTools={[
        TOOL_REFERENCES.split,
        TOOL_REFERENCES.compress,
        TOOL_REFERENCES.reorder,
        TOOL_REFERENCES.extract,
      ]}
    >
      <div className="mx-auto max-w-4xl px-4">
        <UploadBox />
      </div>
    </ToolLayout>
  );
}