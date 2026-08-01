"use client";

export default function Header() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <button
          onClick={() => scrollTo("hero")}
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm shadow-blue-600/30 transition-all duration-200 group-hover:shadow-md group-hover:shadow-blue-600/40">
            P
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            PDFNest
          </span>
        </button>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => scrollTo("tools")}
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 cursor-pointer"
          >
            Tools
          </button>

          <button
            onClick={() => scrollTo("features")}
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 cursor-pointer"
          >
            Features
          </button>

          <button
            onClick={() => scrollTo("faq")}
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 cursor-pointer"
          >
            FAQ
          </button>

          <a
            href="#"
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            Blog
          </a>

          <a
            href="#"
            className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            Contact
          </a>
        </nav>

        {/* Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
            Sign In
          </button>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 active:scale-[0.98] cursor-pointer">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
