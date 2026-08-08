// Shared Tailwind class strings reused across multiple card-based sections.
// Centralizing these avoids duplicating long utility lists in each component.
// Premium SaaS card style: soft shadow, large radius, subtle lift on hover.
export const cardBaseClass =
  "group rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_12px_40px_rgba(16,24,40,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

// Icon container: soft blue tint, rounded, scales and fills on hover.
export const iconBoxClass =
  "flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600";

// Primary button style (used by Button and inline CTAs).
export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

// Secondary / outline button style.
export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

