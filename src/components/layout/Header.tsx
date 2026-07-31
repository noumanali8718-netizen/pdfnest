"use client";

export default function Header() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            P
          </div>
          <span className="text-xl font-bold text-gray-900">
            PDFNest
          </span>
        </button>

        {/* Navigation */}
        <nav className="hidden gap-8 md:flex">
          <button
            onClick={() => scrollTo("tools")}
            className="text-gray-600 hover:text-black transition cursor-pointer"
          >
            Tools
          </button>

          <button
            onClick={() => scrollTo("features")}
            className="text-gray-600 hover:text-black transition cursor-pointer"
          >
            Features
          </button>

          <button
            onClick={() => scrollTo("faq")}
            className="text-gray-600 hover:text-black transition cursor-pointer"
          >
            FAQ
          </button>

          <a
            href="#"
            className="text-gray-600 hover:text-black transition"
          >
            Blog
          </a>

          <a
            href="#"
            className="text-gray-600 hover:text-black transition"
          >
            Contact
          </a>
        </nav>

        {/* Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 transition cursor-pointer">
            Sign In
          </button>

          <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 transition cursor-pointer">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
