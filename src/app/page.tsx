import { HeroSection } from '@/components/home/hero-section';
import { StatsSection } from '@/components/home/stats-section';
import { VaccinationDriveSection } from '@/components/home/vaccination-drive-section';
import { VisitingCampsSection } from '@/components/home/visiting-camps-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';

export default function Home() {
  return (
    <div className="flex flex-col bg-background">
      <HeroSection />
      <StatsSection />
      <div className="bg-muted/40">
        <VaccinationDriveSection />
      </div>
      <VisitingCampsSection />
      <div className="bg-muted/40">
        <TestimonialsSection />
      </div>
    </div>
  );
}
