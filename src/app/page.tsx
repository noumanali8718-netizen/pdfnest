import Hero from "@/components/home/Hero";
import UploadBox from "@/components/ui/UploadBox";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Upload Section — placed directly below hero for immediate action */}
      <section id="upload" className="bg-gradient-to-b from-slate-50 to-white pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <UploadBox />
        </div>
      </section>

      {/* PDF Tools Grid */}
      <section id="tools" />

      {/* How to Merge PDFs (SEO) */}
      <section id="how-to-merge" />

      {/* Why Choose PDFNest + Supported Formats */}
      <section id="features" />

      {/* FAQ */}
      <section id="faq" />

      {/* Final CTA */}

      {/* Footer */}
      <section id="footer" />
    </main>
  );
}
