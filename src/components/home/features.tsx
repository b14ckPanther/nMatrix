import {
  SparklesIcon,
  ChartBarIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Autonomous Evolution',
    description: 'Continuously scans, critiques, modifies, and improves itself without human intervention',
    icon: SparklesIcon,
  },
  {
    name: 'Self-Inspection',
    description: 'Analyzes codebase, UI, UX, SEO, accessibility, performance, and content quality',
    icon: CpuChipIcon,
  },
  {
    name: 'Performance Tracking',
    description: 'Monitors and improves load times, bundle size, and user experience metrics',
    icon: ChartBarIcon,
  },
  {
    name: 'Safety Mechanisms',
    description: 'Prevents self-destruction through validation, preview builds, and cost function evaluation',
    icon: ShieldCheckIcon,
  },
  {
    name: 'AI-Driven Improvements',
    description: 'Uses AI to generate natural-language critiques and production-ready code improvements',
    icon: CodeBracketIcon,
  },
  {
    name: 'Version DNA',
    description: 'Tracks evolution history with reasoning, diffs, metrics, and lineage in Firestore',
    icon: RocketLaunchIcon,
  },
];

export function Features() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Evolution System Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
