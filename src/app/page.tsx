import Hero from "@/components/home/Hero";
import UploadBox from "@/components/ui/UploadBox";
import ToolsGrid from "@/components/home/ToolsGrid";
import WhyChoose from "@/components/home/WhyChoose";
import HowToMerge from "@/components/home/HowToMerge";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Upload Section — placed directly below hero for immediate action */}
      <section id="upload" className="bg-gradient-to-b from-slate-50 to-white pb-24 pt-8 md:pt-12">
        <div className="mx-auto max-w-7xl px-6">
          <UploadBox />
        </div>
      </section>

      {/* PDF Tools Grid */}
      <ToolsGrid />

      {/* How to Merge PDFs (SEO) */}
      <HowToMerge />

      {/* Why Choose PDFNest + Supported Formats */}
      <WhyChoose />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}

      {/* Footer */}
      <Footer />
    </main>
  );
}
