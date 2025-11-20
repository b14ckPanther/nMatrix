import Link from 'next/link';
import { EvolutionStatus } from '@/components/evolution/evolution-status';
import { LatestVersions } from '@/components/evolution/latest-versions';
import { Hero } from '@/components/home/hero';
import { Features } from '@/components/home/features';
import { GlitchyFooter } from '@/components/ui/glitchy-footer';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Evolution Status
          </h2>
          <EvolutionStatus />
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Latest Evolution Versions
          </h2>
          <LatestVersions />
        </div>
      </section>
      <GlitchyFooter />
    </main>
  );
}
