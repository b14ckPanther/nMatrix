/**
 * Evolution Cycle Orchestrator
 * Coordinates the entire Evolution Loop: Self-Inspection -> Self-Critique -> Self-Modification -> Evaluation
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { selfInspection } from './self-inspection';
import { selfCritique } from './self-critique';
import { selfModification } from './self-modification';
import { costFunction } from './cost-function';
import type { VersionDNA } from '../../../src/types/evolution';

/**
 * Helper function to remove undefined values from an object
 * Firestore doesn't accept undefined values
 */
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Main evolution cycle function
 * Orchestrates the complete evolution loop
 */
export async function evolutionCycle(
  context: functions.EventContext
): Promise<VersionDNA | null> {
  try {
    functions.logger.info('Starting evolution cycle...');

    // Get current version
    const currentVersionSnap = await admin.firestore()
      .collection('versions')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    let currentVersion: VersionDNA | null = null;
    if (!currentVersionSnap.empty) {
      const doc = currentVersionSnap.docs[0];
      currentVersion = { id: doc.id, ...doc.data() } as VersionDNA;
    }

    // Step 1: Self-Inspection
    functions.logger.info('Step 1: Self-Inspection...');
    const inspection = await selfInspection();

    // Step 2: Self-Critique
    functions.logger.info('Step 2: Self-Critique...');
    const newVersionId = admin.firestore().collection('versions').doc().id;
    const reviews = await selfCritique(inspection, newVersionId);

    if (reviews.length === 0) {
      functions.logger.info('No critiques generated. Evolution cycle complete.');
      return null;
    }

    // Step 3: Self-Modification
    functions.logger.info('Step 3: Self-Modification...');
    const mutations = await selfModification(reviews, newVersionId);

    if (mutations.length === 0) {
      functions.logger.info('No mutations generated. Evolution cycle complete.');
      return null;
    }

    // Step 4: Cost Function Evaluation
    functions.logger.info('Step 4: Cost Function Evaluation...');
    const currentMetrics = currentVersion?.metrics || getDefaultMetrics();
    const costResult = await costFunction(mutations, currentMetrics);

    if (!costResult.allowed) {
      functions.logger.warn(`Mutations rejected by cost function. Score: ${costResult.score}`);
      
      // Store rejected version for record keeping
      const rejectedVersion: VersionDNA = {
        id: newVersionId,
        version: generateVersionString(currentVersion?.version),
        createdAt: new Date(),
        status: 'rejected',
        parentVersionId: currentVersion?.id,
        lineage: currentVersion ? [...currentVersion.lineage, currentVersion.id] : [],
        metrics: currentMetrics,
        reasoning: `Mutations rejected by cost function. ${costResult.reasoning}`,
        mutations,
        costFunctionScore: costResult.score,
      };

      // Prepare Firestore document - convert dates and handle undefined values
      const rejectedVersionDoc: any = {
        ...removeUndefined(rejectedVersion),
        createdAt: admin.firestore.Timestamp.fromDate(rejectedVersion.createdAt),
      };
      // Convert parentVersionId undefined to null for Firestore
      if (rejectedVersion.parentVersionId === undefined) {
        rejectedVersionDoc.parentVersionId = null;
      }

      await admin.firestore().collection('versions').doc(newVersionId).set(rejectedVersionDoc);

      return rejectedVersion;
    }

    // Step 5: Create Version DNA
    functions.logger.info('Step 5: Creating Version DNA...');
    const newVersion: VersionDNA = {
      id: newVersionId,
      version: generateVersionString(currentVersion?.version),
      createdAt: new Date(),
      status: 'pending',
        parentVersionId: currentVersion?.id,
      lineage: currentVersion ? [...currentVersion.lineage, currentVersion.id] : [],
      metrics: {
        ...currentMetrics,
        // Estimated metrics after mutations (would be calculated more accurately in production)
        performance: {
          before: currentMetrics.performance.before,
        },
        bundleSize: {
          before: currentMetrics.bundleSize.before,
        },
        accessibility: {
          before: currentMetrics.accessibility.before,
        },
        seo: {
          before: currentMetrics.seo.before,
        },
      },
      reasoning: `Generated ${mutations.length} mutations addressing ${reviews.length} critiques. ${costResult.reasoning}`,
      mutations,
      costFunctionScore: costResult.score,
    };

    // Store version in Firestore - prepare document with date conversions and undefined handling
    const newVersionDoc: any = {
      ...removeUndefined(newVersion),
      createdAt: admin.firestore.Timestamp.fromDate(newVersion.createdAt),
      deployedAt: null,
      approvedAt: null,
    };
    // Convert parentVersionId undefined to null for Firestore (Firestore doesn't accept undefined)
    if (newVersion.parentVersionId === undefined) {
      newVersionDoc.parentVersionId = null;
    }

    await admin.firestore().collection('versions').doc(newVersionId).set(newVersionDoc);

    // Create approval request
    await admin.firestore().collection('approvals').add({
      versionId: newVersionId,
      mutationIds: mutations.map((m) => m.id),
      status: 'pending',
      requestedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
      feedback: null,
      approvedMutations: [],
      rejectedMutations: [],
    });

    functions.logger.info(`Evolution cycle complete. Created version ${newVersion.version} (${newVersionId})`);
    
    return newVersion;
  } catch (error: any) {
    functions.logger.error('Evolution cycle failed:', error);
    throw error;
  }
}

function generateVersionString(parentVersion?: string): string {
  if (!parentVersion) return '1.0.0';
  
  const parts = parentVersion.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1; // Increment patch version
  return parts.join('.');
}

function getDefaultMetrics(): VersionDNA['metrics'] {
  return {
    performance: {
      before: {
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timeToInteractive: 0,
      },
    },
    bundleSize: {
      before: 0,
    },
    accessibility: {
      before: 0,
    },
    seo: {
      before: 0,
    },
  };
}
