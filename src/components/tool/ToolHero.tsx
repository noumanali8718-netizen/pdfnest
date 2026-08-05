import type { LucideIcon } from "lucide-react";
import { iconBoxClass } from "@/lib/uiClasses";

type ToolHeroProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

export default function ToolHero({
  title,
  description,
  icon: Icon,
  badge,
}: ToolHeroProps) {
  return (
    <div className="pb-8 pt-20 text-center md:pt-28">
      {badge ? (
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
          {badge}
        </span>
      ) : null}

      <div className={`${iconBoxClass} mx-auto mb-6`}>
        <Icon size={24} />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
        {title}
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

