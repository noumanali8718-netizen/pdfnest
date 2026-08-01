"use client";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-blue-600 text-white shadow-sm shadow-blue-600/25 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 disabled:bg-blue-300 disabled:text-white disabled:shadow-none",
    secondary:
      "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}