"use client";

import {
  ShieldCheck,
  Lock,
  Zap,
  UserCheck,
  Laptop,
  BadgeCheck,
} from "lucide-react";

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
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why Choose PDFNest
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Fast, private, and reliable PDF tools built to simplify your
            workflow.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

