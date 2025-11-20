/**
 * A/B Testing Client Utilities
 * Client-side functions for A/B testing
 */

import React from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/functions';

/**
 * Assigns user to an experiment variant
 */
export async function assignVariant(experimentId: string, userId?: string): Promise<string | null> {
  try {
    if (!functions) {
      throw new Error('Firebase Functions not initialized');
    }

    const assignVariantFunction = httpsCallable(functions, 'assignExperimentVariant');
    const result = await assignVariantFunction({ experimentId, userId });
    const data = result.data as { variantId: string | null };
    return data.variantId;
  } catch (error: any) {
    console.error('Variant assignment failed:', error);
    return null;
  }
}

/**
 * Tracks an analytics event
 */
export async function trackEvent(
  eventType: 'page_view' | 'click' | 'conversion' | 'engagement' | 'error',
  metadata?: Record<string, any>,
  experimentId?: string,
  variantId?: string
): Promise<string | null> {
  try {
    if (!functions) {
      throw new Error('Firebase Functions not initialized');
    }

    // Generate or get session ID
    const sessionId = getOrCreateSessionId();

    const trackEventFunction = httpsCallable(functions, 'trackAnalyticsEvent');
    const result = await trackEventFunction({
      eventType,
      experimentId,
      variantId,
      metadata: metadata || {},
      sessionId,
    });

    const data = result.data as { eventId: string };
    return data.eventId;
  } catch (error: any) {
    console.error('Event tracking failed:', error);
    return null;
  }
}

/**
 * Gets or creates a session ID
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';

  let sessionId = sessionStorage.getItem('nmmatrix-session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('nmmatrix-session-id', sessionId);
  }
  return sessionId;
}

/**
 * Hook for A/B testing
 */
export function useExperiment(experimentId: string): {
  variantId: string | null;
  trackEvent: (eventType: string, metadata?: Record<string, any>) => Promise<void>;
} {
  const [variantId, setVariantId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function assign() {
      const id = await assignVariant(experimentId);
      setVariantId(id);
    }

    assign();
  }, [experimentId]);

  const track = async (eventType: string, metadata?: Record<string, any>) => {
    await trackEvent(eventType as any, metadata, experimentId, variantId || undefined);
  };

  return { variantId, trackEvent: track };
}
