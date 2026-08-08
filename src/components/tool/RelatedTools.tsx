import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { cardBaseClass, iconBoxClass } from "@/lib/uiClasses";

export type RelatedTool = {
  icon: LucideIcon;
  title: string;
  description: string;
  status: "available" | "coming-soon";
  href?: string;
};

type RelatedToolsProps = {
  tools: RelatedTool[];
};

export default function RelatedTools(props: RelatedToolsProps) {
  

  const { tools } = props;

  

  return (
    <section className="pb-24">
      <div className="mt-8">
        <SectionHeading
          title="Related Tools"
          subtitle="More ways to get the most out of your PDFs."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.slice(0, 4).map((tool) => {
            const Icon = tool.icon;
            const isAvailable = tool.status === "available";

            return (
              <article
                key={tool.title}
                className={`${cardBaseClass} relative p-6`}
              >
                {isAvailable && tool.href ? (
                  <Link
                    href={tool.href}
                    className="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    aria-label={`Open ${tool.title} tool`}
                  />
                ) : null}

                <div className={`${iconBoxClass} mb-4`}>
                  <Icon size={24} />
                </div>

                <h3 className="text-base font-semibold text-gray-900">
                  {tool.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {tool.description}
                </p>

                <div className="mt-4">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-gray-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Coming Soon
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

