export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            P
          </div>

          <span className="text-xl font-bold text-gray-900">
            PDFNest
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden gap-8 md:flex">
          <a href="#" className="text-gray-600 hover:text-black transition">
            Tools
          </a>

          <a href="#" className="text-gray-600 hover:text-black transition">
            Pricing
          </a>

          <a href="#" className="text-gray-600 hover:text-black transition">
            Blog
          </a>

          <a href="#" className="text-gray-600 hover:text-black transition">
            Contact
          </a>
        </nav>

        {/* Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
            Sign In
          </button>

          <button className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}