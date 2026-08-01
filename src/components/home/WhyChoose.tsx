"use client";

import {
  ShieldCheck,
  Lock,
  Zap,
  UserCheck,
  Laptop,
  BadgeCheck,
} from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { cardBaseClass, iconBoxClass } from "@/lib/uiClasses";

type Feature = {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Browser-Based Processing",
    description:
      "Your PDF files are processed directly in your browser. Nothing is uploaded to our servers.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Your documents stay on your device, giving you complete control over your data.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Modern browser technology delivers fast PDF processing without waiting for server uploads.",
  },
  {
    icon: UserCheck,
    title: "No Registration",
    description:
      "Start using PDFNest instantly without creating an account.",
  },
  {
    icon: Laptop,
    title: "Works Everywhere",
    description:
      "Compatible with Windows, macOS, Linux, Android and iPhone using any modern browser.",
  },
  {
    icon: BadgeCheck,
    title: "Free to Use",
    description:
      "Use the available PDF tools without subscriptions or hidden fees.",
  },
];

export default function WhyChoose() {
  return (
    <section id="features" className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          title="Why Choose PDFNest"
          subtitle="Fast, private, and reliable PDF tools built to simplify your workflow."
        />

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className={`${cardBaseClass} p-8`}>
                {/* Icon */}
                <div className={`${iconBoxClass} mb-5`}>
                  <Icon size={24} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

