"use client";

import { motion } from "framer-motion";
import { FileText, Wrench, Cpu, UserX } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const stats = [
  {
    icon: FileText,
    value: "2M+",
    label: "PDFs Processed",
  },
  {
    icon: Wrench,
    value: "12",
    label: "Tools Available",
  },
  {
    icon: Cpu,
    value: "100%",
    label: "Browser Processing",
  },
  {
    icon: UserX,
    value: "0",
    label: "Registration Required",
  },
];

export default function SocialProof() {
  return (
    <section
      id="social-proof"
      aria-label="PDFNest by the numbers"
      className="border-y border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Reveal key={stat.label} delay={index * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <dd className="order-first text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
                    {stat.value}
                  </dd>
                  <dt className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </dt>
                </motion.div>
              </Reveal>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
