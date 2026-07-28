export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">

        <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
          Free • Secure • No Registration Required
        </span>

        <h1 className="mt-8 max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
          All Your PDF Tools
          <br />
          In One Place
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Merge, Split, Compress, Convert and Edit PDFs online for free.
          Fast, secure and easy to use.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700">
            Upload PDF
          </button>

          <button className="rounded-xl border border-gray-300 px-8 py-4 font-semibold hover:bg-gray-100">
            View Tools
          </button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <span>✓ 100% Free</span>
          <span>✓ No Watermarks</span>
          <span>✓ Secure Processing</span>
          <span>✓ Works on Any Device</span>
        </div>

      </div>
    </section>
  );
}