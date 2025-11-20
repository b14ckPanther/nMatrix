/**
 * Self-Critique Module
 * Generates natural-language critiques describing what is inefficient, outdated, poorly designed, redundant, low-performing, unclear, or aesthetically weak
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { Review, ReviewSeverity } from '../../../src/types/evolution';

interface InspectionResult {
  codebase: any;
  ui: any;
  ux: any;
  seo: any;
  content: any;
  folderStructure: any;
}

/**
 * Generates critiques from inspection results
 * In production, this would use an AI model (like OpenAI GPT-4 or similar) to generate natural-language critiques
 */
export async function selfCritique(
  inspection: InspectionResult,
  versionId: string
): Promise<Review[]> {
  try {
    const reviews: Review[] = [];

    // Generate critiques from inspection results
    // This is a simplified version - in production, use AI to generate natural language

    // UI/Accessibility Critiques
    if (inspection.ui.accessibility.score < 0.8) {
      const severity: ReviewSeverity = inspection.ui.accessibility.score < 0.6 ? 'high' : 'medium';
      reviews.push({
        id: '', // Will be set when saved
        versionId,
        createdAt: new Date(),
        severity,
        category: 'accessibility',
        title: 'Accessibility Improvements Needed',
        description: inspection.ui.accessibility.issues.join('. ') || 
          'The application has accessibility issues that may prevent users with disabilities from fully utilizing the interface. Focus on ARIA labels, color contrast, and keyboard navigation.',
        suggestions: [
          'Add proper aria-labels to interactive elements',
          'Improve color contrast ratios to meet WCAG AA standards',
          'Enhance focus indicators for keyboard navigation',
          'Ensure all interactive elements are keyboard accessible',
        ],
        priority: severity === 'high' ? 8 : 5,
        addressed: false,
      });
    }

    // Performance Critiques
    if (inspection.ux.performance.score < 0.8) {
      const severity: ReviewSeverity = inspection.ux.performance.score < 0.6 ? 'high' : 'medium';
      reviews.push({
        id: '',
        versionId,
        createdAt: new Date(),
        severity,
        category: 'performance',
        title: 'Performance Optimization Opportunities',
        description: `Current performance metrics indicate room for improvement. Load time: ${inspection.ux.performance.metrics.loadTime}ms, FCP: ${inspection.ux.performance.metrics.firstContentfulPaint}ms. The cumulative layout shift of ${inspection.ux.performance.metrics.cumulativeLayoutShift} suggests layout instability.`,
        suggestions: [
          'Implement code splitting for faster initial load',
          'Optimize images and use modern formats (WebP, AVIF)',
          'Add lazy loading for below-the-fold content',
          'Reduce JavaScript bundle size through tree shaking',
          'Implement service worker for offline support',
          'Fix layout shifts by setting proper image dimensions',
        ],
        priority: severity === 'high' ? 9 : 6,
        addressed: false,
      });
    }

    // SEO Critiques
    if (inspection.seo.score < 0.8) {
      reviews.push({
        id: '',
        versionId,
        createdAt: new Date(),
        severity: 'medium',
        category: 'seo',
        title: 'SEO Enhancement Opportunities',
        description: inspection.seo.issues.join('. ') ||
          'The application\'s SEO could be improved to enhance discoverability and search engine rankings.',
        suggestions: [
          'Add comprehensive meta descriptions to all pages',
          'Implement complete Open Graph and Twitter Card tags',
          'Add structured data (JSON-LD) for better search understanding',
          'Improve semantic HTML structure',
          'Ensure proper heading hierarchy (h1-h6)',
          'Add alt text to all images',
        ],
        priority: 6,
        addressed: false,
      });
    }

    // Code Quality Critiques
    if (inspection.codebase.quality.score < 0.85) {
      reviews.push({
        id: '',
        versionId,
        createdAt: new Date(),
        severity: 'low',
        category: 'code_quality',
        title: 'Code Quality Improvements',
        description: inspection.codebase.quality.issues.join('. ') ||
          'Code quality can be enhanced for better maintainability and reliability.',
        suggestions: [
          'Improve TypeScript typing coverage',
          'Add comprehensive error handling',
          'Increase unit test coverage',
          'Refactor complex functions into smaller, testable units',
          'Add JSDoc comments for better documentation',
        ],
        priority: 4,
        addressed: false,
      });
    }

    // UI Design Consistency - Higher priority for noticeable UI changes
    if (inspection.ui.design.consistency < 0.90) { // Lower threshold to catch more UI issues
      reviews.push({
        id: '',
        versionId,
        createdAt: new Date(),
        severity: 'medium', // Increased from 'low'
        category: 'ui',
        title: 'Visual Design & UX Enhancements',
        description: inspection.ui.design.issues.join('. ') ||
          'The UI can be enhanced with improved visual design, better color schemes, modern animations, and more engaging user interactions.',
        suggestions: [
          'Enhance color palette and gradients',
          'Add smooth transitions and micro-interactions',
          'Improve visual hierarchy and spacing',
          'Add engaging hover effects and animations',
          'Modernize component styling',
          'Improve typography and font weights',
        ],
        priority: 2, // Higher priority (lower number = higher priority)
        addressed: false,
      });
    }

    // Content Quality
    if (inspection.content.quality.score < 0.85) {
      reviews.push({
        id: '',
        versionId,
        createdAt: new Date(),
        severity: 'medium',
        category: 'content',
        title: 'Content Quality Enhancements',
        description: inspection.content.quality.issues.join('. ') ||
          'Content could be improved to better engage users and communicate value.',
        suggestions: [
          'Make content more engaging and user-focused',
          'Improve clarity of call-to-action elements',
          'Add more compelling value propositions',
          'Enhance content readability',
        ],
        priority: 5,
        addressed: false,
      });
    }

    // Store reviews in Firestore
    const batch = admin.firestore().batch();
    reviews.forEach((review) => {
      const ref = admin.firestore().collection('reviews').doc();
      review.id = ref.id;
      batch.set(ref, {
        ...review,
        createdAt: admin.firestore.Timestamp.fromDate(review.createdAt),
        addressedAt: null,
      });
    });
    await batch.commit();

    functions.logger.info(`Generated ${reviews.length} critiques for version ${versionId}`);

    return reviews;
  } catch (error: any) {
    functions.logger.error('Self-critique failed:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}
