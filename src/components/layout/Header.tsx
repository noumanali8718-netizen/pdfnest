"use client";

import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { primaryButtonClass } from "@/lib/uiClasses";

type NavLink = {
  label: string;
  href?: string;
  id?: string;
};

const navLinks: NavLink[] = [
  { label: "Merge PDF", href: "/merge-pdf" },
  { label: "Split PDF", href: "/split-pdf" },
  { label: "Compress", href: "/compress-pdf" },
  { label: "Convert", href: "/pdf-to-images" },
  { label: "All Tools", id: "tools" },
  { label: "About", id: "features" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm shadow-blue-600/30 transition-all duration-200 group-hover:shadow-md group-hover:shadow-blue-600/40">
            P
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            PDFNest
          </span>
        </Link>

        {/* Navigation */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-8 lg:flex"
        >
          {navLinks.map((link) =>
            link.href ? (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => scrollTo(link.id!)}
                className="cursor-pointer rounded-md text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {link.label}
              </button>
            )
          )}
        </nav>

        {/* CTA */}
        <div className="hidden shrink-0 lg:block">
          <Link href="/" className={primaryButtonClass}>
            Start Free
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen ? (
        <nav
          aria-label="Mobile"
          className="border-t border-slate-100 bg-white lg:hidden"
        >
          <div className="space-y-1 px-6 py-4">
            {navLinks.map((link) =>
              link.href ? (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.id!)}
                  className="block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                >
                  {link.label}
                </button>
              )
            )}
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`${primaryButtonClass} mt-3 w-full`}
            >
              Start Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
