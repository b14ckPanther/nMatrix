/**
 * A/B Testing Experiment Manager
 * Manages experiments, variant assignment, and analytics tracking
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { Experiment, AnalyticsEvent } from '../../../src/types/evolution';

/**
 * Assigns a user to an experiment variant
 */
export async function assignVariant(
  experimentId: string,
  userId?: string
): Promise<string | null> {
  try {
    const experimentDoc = await admin.firestore()
      .collection('experiments')
      .doc(experimentId)
      .get();

    if (!experimentDoc.exists) {
      functions.logger.warn(`Experiment ${experimentId} not found`);
      return null;
    }

    const experiment = { id: experimentDoc.id, ...experimentDoc.data() } as Experiment;

    if (experiment.status !== 'active') {
      return null;
    }

    // Simple assignment based on hash (deterministic)
    const hash = userId ? hashUserId(userId) : Math.random();
    const assignment = hash % 100;

    let cumulativePercentage = 0;
    for (const variant of experiment.variants) {
      cumulativePercentage += variant.trafficPercentage;
      if (assignment < cumulativePercentage) {
        return variant.id;
      }
    }

    // Fallback to control variant
    const controlVariant = experiment.variants.find((v) => v.isControl);
    return controlVariant?.id || experiment.variants[0]?.id || null;
  } catch (error: any) {
    functions.logger.error(`Variant assignment failed for experiment ${experimentId}:`, error);
    return null;
  }
}

/**
 * Tracks an analytics event
 */
export async function trackEvent(
  event: Omit<AnalyticsEvent, 'id' | 'timestamp'>
): Promise<string> {
  try {
    const eventDoc = admin.firestore().collection('analytics').doc();
    const eventData: AnalyticsEvent = {
      ...event,
      id: eventDoc.id,
      timestamp: new Date(),
    };

    await eventDoc.set({
      ...eventData,
      timestamp: admin.firestore.Timestamp.fromDate(eventData.timestamp),
    });

    return eventDoc.id;
  } catch (error: any) {
    functions.logger.error('Event tracking failed:', error);
    throw error;
  }
}

/**
 * Gets experiment results
 */
export async function getExperimentResults(
  experimentId: string
): Promise<{
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
}[]> {
  try {
    const events = await admin.firestore()
      .collection('analytics')
      .where('experimentId', '==', experimentId)
      .get();

    const variantStats: Record<string, {
      impressions: number;
      conversions: number;
      sessions: Record<string, { startTime: Date; duration: number; bounced: boolean }>;
    }> = {};

    // Process events
    events.docs.forEach((doc) => {
      const event = doc.data() as AnalyticsEvent;
      const variantId = event.variantId || 'unknown';

      if (!variantStats[variantId]) {
        variantStats[variantId] = {
          impressions: 0,
          conversions: 0,
          sessions: {},
        };
      }

      const stats = variantStats[variantId];

      if (event.eventType === 'page_view') {
        stats.impressions++;
        
        // Track session
        const sessionId = event.sessionId;
        if (!stats.sessions[sessionId]) {
          const timestamp = event.timestamp;
          const date = timestamp instanceof admin.firestore.Timestamp
            ? timestamp.toDate()
            : timestamp instanceof Date
            ? timestamp
            : new Date(timestamp);
          stats.sessions[sessionId] = {
            startTime: date,
            duration: 0,
            bounced: true,
          };
        }
      }

      if (event.eventType === 'conversion') {
        stats.conversions++;
        const sessionId = event.sessionId;
        if (stats.sessions[sessionId]) {
          stats.sessions[sessionId].bounced = false;
        }
      }

      if (event.eventType === 'engagement') {
        const sessionId = event.sessionId;
        if (stats.sessions[sessionId]) {
          const timestamp = event.timestamp;
          const eventTime = timestamp instanceof admin.firestore.Timestamp
            ? timestamp.toDate()
            : timestamp instanceof Date
            ? timestamp
            : new Date(timestamp);
          const duration = eventTime.getTime() - stats.sessions[sessionId].startTime.getTime();
          stats.sessions[sessionId].duration = Math.max(stats.sessions[sessionId].duration, duration);
          stats.sessions[sessionId].bounced = false;
        }
      }
    });

    // Calculate metrics
    const results = Object.entries(variantStats).map(([variantId, stats]) => {
      const sessions = Object.values(stats.sessions);
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;
      const bouncedSessions = sessions.filter((s) => s.bounced).length;
      const bounceRate = sessions.length > 0 ? bouncedSessions / sessions.length : 0;

      return {
        variantId,
        impressions: stats.impressions,
        conversions: stats.conversions,
        conversionRate: stats.impressions > 0 ? stats.conversions / stats.impressions : 0,
        avgSessionDuration: avgDuration / 1000, // Convert to seconds
        bounceRate,
      };
    });

    return results;
  } catch (error: any) {
    functions.logger.error(`Experiment results failed for ${experimentId}:`, error);
    throw error;
  }
}

/**
 * Creates a new experiment
 */
export async function createExperiment(
  experiment: Omit<Experiment, 'id' | 'createdAt' | 'metrics'>
): Promise<string> {
  try {
    const experimentDoc = admin.firestore().collection('experiments').doc();
    const experimentData: Experiment = {
      ...experiment,
      id: experimentDoc.id,
      createdAt: new Date(),
      metrics: {
        impressions: 0,
        conversions: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
      },
    };

    await experimentDoc.set({
      ...experimentData,
      createdAt: admin.firestore.Timestamp.fromDate(experimentData.createdAt),
      startDate: admin.firestore.Timestamp.fromDate(experimentData.startDate),
      endDate: experimentData.endDate ? admin.firestore.Timestamp.fromDate(experimentData.endDate) : null,
    });

    return experimentDoc.id;
  } catch (error: any) {
    functions.logger.error('Experiment creation failed:', error);
    throw error;
  }
}

/**
 * Simple hash function for deterministic variant assignment
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// HTTP Callable Function: Assign Variant
export const assignExperimentVariant = functions.https.onCall(async (data, context) => {
  const { experimentId, userId } = data;

  if (!experimentId) {
    throw new functions.https.HttpsError('invalid-argument', 'experimentId is required');
  }

  try {
    const variantId = await assignVariant(experimentId, userId || context.auth?.uid);
    return { variantId };
  } catch (error: any) {
    functions.logger.error('Variant assignment failed:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// HTTP Callable Function: Track Event
export const trackAnalyticsEvent = functions.https.onCall(async (data, context) => {
  const { eventType, experimentId, variantId, metadata, sessionId } = data;

  if (!eventType || !sessionId) {
    throw new functions.https.HttpsError('invalid-argument', 'eventType and sessionId are required');
  }

  try {
    const eventId = await trackEvent({
      experimentId,
      variantId,
      eventType,
      metadata: metadata || {},
      userId: context.auth?.uid,
      sessionId,
    });

    return { eventId };
  } catch (error: any) {
    functions.logger.error('Event tracking failed:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
