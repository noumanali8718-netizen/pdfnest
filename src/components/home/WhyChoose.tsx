"use client";

import { Cpu, Lock, Zap, Gift } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { cardBaseClass, iconBoxClass } from "@/lib/uiClasses";
import Reveal from "@/components/ui/Reveal";

type Feature = {
  icon: typeof Cpu;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Cpu,
    title: "Browser Processing",
    description:
      "Your files are processed entirely in your browser. Nothing is ever uploaded to our servers.",
  },
  {
    icon: Lock,
    title: "Privacy",
    description:
      "Your documents stay on your device, giving you complete control and total peace of mind.",
  },
  {
    icon: Zap,
    title: "Fast",
    description:
      "Modern browser technology delivers instant results without waiting on server uploads.",
  },
  {
    icon: Gift,
    title: "Free Forever",
    description:
      "Use every available tool with no subscriptions, no trials, and no hidden fees.",
  },
];

export default function WhyChoose() {
  return (
    <section id="features" className="bg-slate-50 py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Why PDFNest"
            title="Why Choose PDFNest"
            subtitle="Fast, private, and reliable PDF tools built to simplify your workflow."
          />
        </Reveal>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal key={feature.title} delay={index * 0.08}>
                <article className={`${cardBaseClass} h-full p-8`}>
                  <div className={`${iconBoxClass} mb-5`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-[22px] font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
