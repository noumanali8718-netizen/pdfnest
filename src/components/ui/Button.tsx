"use client";

import { Loader2 } from "lucide-react";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/uiClasses";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

  const variants = {
    primary: primaryButtonClass,
    secondary: secondaryButtonClass,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
