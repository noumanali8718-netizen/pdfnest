import Hero from "@/components/home/Hero";
import SocialProof from "@/components/home/SocialProof";
import ToolsGrid from "@/components/home/ToolsGrid";
import HowToMerge from "@/components/home/HowToMerge";
import WhyChoose from "@/components/home/WhyChoose";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      {/* Hero with embedded upload area */}
      <Hero />

      {/* Social proof stats */}
      <SocialProof />

      {/* PDF Tools Grid */}
      <ToolsGrid />

      {/* How It Works */}
      <HowToMerge />

      {/* Why Choose PDFNest */}
      <WhyChoose />

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </main>
  );
}
