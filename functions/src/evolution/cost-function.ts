/**
 * Cost Function Module
 * Evaluates whether a modification is allowed by measuring improvements in performance, UX, SEO, clarity, accessibility, bundle size, layout stability, or user metrics
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { Mutation, VersionDNA } from '../../../src/types/evolution';

interface CostFunctionResult {
  score: number; // 0-1, higher is better
  allowed: boolean;
  reasoning: string;
  metrics: {
    performanceDelta: number;
    uxDelta: number;
    seoDelta: number;
    accessibilityDelta: number;
    stabilityDelta: number;
    bundleSizeDelta: number;
  };
}

/**
 * Evaluates mutations using cost function
 * Returns score and whether mutations should be allowed
 */
export async function costFunction(
  mutations: Mutation[],
  currentMetrics: VersionDNA['metrics']
): Promise<CostFunctionResult> {
  try {
    // Aggregate impact from all mutations
    let performanceDelta = 0;
    let uxDelta = 0;
    let seoDelta = 0;
    let accessibilityDelta = 0;
    let stabilityDelta = 0;
    let bundleSizeDelta = 0;

    for (const mutation of mutations) {
      performanceDelta += mutation.estimatedImpact.performance || 0;
      uxDelta += mutation.estimatedImpact.ux || 0;
      seoDelta += mutation.estimatedImpact.seo || 0;
      accessibilityDelta += mutation.estimatedImpact.accessibility || 0;
      stabilityDelta += mutation.estimatedImpact.stability || 0;
      
      // Bundle size is negative if reducing size (good)
      // Positive if increasing size (bad)
      if (mutation.type === 'performance_optimization') {
        bundleSizeDelta -= 0.05; // Assume optimization reduces size
      }
    }

    // Clamp deltas to reasonable ranges
    performanceDelta = Math.max(-1, Math.min(1, performanceDelta));
    uxDelta = Math.max(-1, Math.min(1, uxDelta));
    seoDelta = Math.max(-1, Math.min(1, seoDelta));
    accessibilityDelta = Math.max(-1, Math.min(1, accessibilityDelta));
    stabilityDelta = Math.max(-1, Math.min(1, stabilityDelta));
    bundleSizeDelta = Math.max(-1, Math.min(1, bundleSizeDelta));

    // Calculate weighted score
    // Weights sum to 1.0
    // Prioritize UI/UX improvements for more noticeable changes
    const weights = {
      performance: 0.15,  // Reduced from 0.25
      ux: 0.35,           // Increased from 0.25 - prioritize UX!
      seo: 0.10,          // Reduced from 0.15
      accessibility: 0.15, // Same
      stability: 0.15,    // Same
      bundleSize: 0.10,   // Increased from 0.05
    };

    // Normalize deltas to 0-1 range (0.5 = neutral, >0.5 = improvement, <0.5 = degradation)
    const normalizeDelta = (delta: number): number => {
      return Math.max(0, Math.min(1, (delta + 1) / 2));
    };

    const bundleScore = bundleSizeDelta < 0 ? 1 : Math.max(0, 1 - bundleSizeDelta);

    const score =
      normalizeDelta(performanceDelta) * weights.performance +
      normalizeDelta(uxDelta) * weights.ux +
      normalizeDelta(seoDelta) * weights.seo +
      normalizeDelta(accessibilityDelta) * weights.accessibility +
      normalizeDelta(stabilityDelta) * weights.stability +
      bundleScore * weights.bundleSize;

    // Get minimum score threshold from config (default 0.6)
    const configDoc = await admin.firestore().collection('configs').doc('evolution').get();
    const configData = configDoc.data();
    const minScore = configData?.minCostFunctionScore || 0.6;

    const allowed = score >= minScore;

    // Generate reasoning
    const reasoning = generateReasoning(
      score,
      allowed,
      {
        performanceDelta,
        uxDelta,
        seoDelta,
        accessibilityDelta,
        stabilityDelta,
        bundleSizeDelta,
      }
    );

    return {
      score,
      allowed,
      reasoning,
      metrics: {
        performanceDelta,
        uxDelta,
        seoDelta,
        accessibilityDelta,
        stabilityDelta,
        bundleSizeDelta,
      },
    };
  } catch (error: any) {
    functions.logger.error('Cost function evaluation failed:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}

function generateReasoning(
  score: number,
  allowed: boolean,
  metrics: CostFunctionResult['metrics']
): string {
  const improvements: string[] = [];
  const degradations: string[] = [];

  if (metrics.performanceDelta > 0.05) improvements.push(`Performance improvement (+${(metrics.performanceDelta * 100).toFixed(1)}%)`);
  if (metrics.performanceDelta < -0.05) degradations.push(`Performance degradation (${(metrics.performanceDelta * 100).toFixed(1)}%)`);

  if (metrics.uxDelta > 0.05) improvements.push(`UX improvement (+${(metrics.uxDelta * 100).toFixed(1)}%)`);
  if (metrics.uxDelta < -0.05) degradations.push(`UX degradation (${(metrics.uxDelta * 100).toFixed(1)}%)`);

  if (metrics.seoDelta > 0.05) improvements.push(`SEO improvement (+${(metrics.seoDelta * 100).toFixed(1)}%)`);
  if (metrics.seoDelta < -0.05) degradations.push(`SEO degradation (${(metrics.seoDelta * 100).toFixed(1)}%)`);

  if (metrics.accessibilityDelta > 0.05) improvements.push(`Accessibility improvement (+${(metrics.accessibilityDelta * 100).toFixed(1)}%)`);
  if (metrics.accessibilityDelta < -0.05) degradations.push(`Accessibility degradation (${(metrics.accessibilityDelta * 100).toFixed(1)}%)`);

  if (metrics.stabilityDelta > 0.05) improvements.push(`Stability improvement (+${(metrics.stabilityDelta * 100).toFixed(1)}%)`);
  if (metrics.stabilityDelta < -0.05) degradations.push(`Stability degradation (${(metrics.stabilityDelta * 100).toFixed(1)}%)`);

  if (metrics.bundleSizeDelta < -0.05) improvements.push(`Bundle size reduction (${(Math.abs(metrics.bundleSizeDelta) * 100).toFixed(1)}%)`);
  if (metrics.bundleSizeDelta > 0.05) degradations.push(`Bundle size increase (+${(metrics.bundleSizeDelta * 100).toFixed(1)}%)`);

  let reasoning = `Cost function score: ${(score * 100).toFixed(1)}/100. `;

  if (improvements.length > 0) {
    reasoning += `Improvements: ${improvements.join(', ')}. `;
  }

  if (degradations.length > 0) {
    reasoning += `Degradations: ${degradations.join(', ')}. `;
  }

  if (allowed) {
    reasoning += 'Mutations are ALLOWED as they meet the minimum threshold.';
  } else {
    reasoning += 'Mutations are REJECTED as they do not meet the minimum threshold. Potential degradations outweigh improvements.';
  }

  return reasoning;
}
