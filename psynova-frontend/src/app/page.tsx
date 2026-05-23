import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/marketing/HeroSection';
import { StatsSection } from '@/components/marketing/StatsSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { FeaturedTherapists } from '@/components/marketing/FeaturedTherapists';
import { SpecializationsGrid } from '@/components/marketing/SpecializationsGrid';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { ForTherapistsCTA } from '@/components/marketing/ForTherapistsCTA';
import { FAQSection } from '@/components/marketing/FAQSection';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturedTherapists />
        <SpecializationsGrid />
        <TestimonialsSection />
        <ForTherapistsCTA />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
