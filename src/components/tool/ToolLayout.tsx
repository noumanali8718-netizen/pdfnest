import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ToolHero from "./ToolHero";
import RelatedTools, { type RelatedTool } from "./RelatedTools";

type ToolLayoutProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  children: React.ReactNode;
  relatedTools: RelatedTool[];
};

export default function ToolLayout({
  title,
  description,
  icon,
  badge,
  children,
  relatedTools,
}: ToolLayoutProps) {
  return (
    <main className="bg-gradient-to-b from-white via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="pt-6">
          <ol className="flex items-center gap-1.5 text-sm text-gray-500">
            <li>
              <Link href="/" className="transition hover:text-blue-600">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">
              <ChevronRight size={14} />
            </li>
            <li aria-current="page" className="font-medium text-gray-900">
              {title}
            </li>
          </ol>
        </nav>

        <ToolHero
          title={title}
          description={description}
          icon={icon}
          badge={badge}
        />

        <section className="pb-24">{children}</section>

        <RelatedTools tools={relatedTools} />
      </div>
    </main>
  );
}

