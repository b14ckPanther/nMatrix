/**
 * Cloud Functions Entry Point
 * Contains all Evolution Loop functions: Self-Inspection, Self-Critique, Self-Modification, Evolution & Deployment
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Evolution Loop Functions
export { selfInspection } from './evolution/self-inspection';
export { selfCritique } from './evolution/self-critique';
export { selfModification } from './evolution/self-modification';
import { evolutionCycle } from './evolution/evolution-cycle';
export { evolutionCycle };
export { costFunction } from './evolution/cost-function';
import { approvalHandler } from './evolution/approval-handler';
export { approvalHandler };
export { deploymentHandler } from './evolution/deployment-handler';

// A/B Testing Functions
export {
  assignExperimentVariant,
  trackAnalyticsEvent,
} from './ab-testing/experiment-manager';

// Scheduled Function: Run Evolution Cycle
export const scheduledEvolutionCycle = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('UTC')
  .onRun(async (context) => {
    const config = await admin.firestore().collection('configs').doc('evolution').get();
    const configData = config.data();
    
    if (!configData?.enabled) {
      console.log('Evolution cycle is disabled in config');
      return null;
    }

    await evolutionCycle(context);
    return null;
  });

// Trigger: On Mutation Approval
export const onApprovalUpdate = functions.firestore
  .document('approvals/{approvalId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.status === 'pending' && (after.status === 'approved' || after.status === 'partially_approved')) {
      await approvalHandler(context.params.approvalId, {
        id: context.params.approvalId,
        versionId: after.versionId || '',
        mutationIds: Array.isArray(after.mutationIds) ? after.mutationIds : [],
        status: after.status || 'pending',
        requestedAt: after.requestedAt?.toDate ? after.requestedAt.toDate() : new Date(),
        reviewedBy: after.reviewedBy,
        reviewedAt: after.reviewedAt?.toDate ? after.reviewedAt.toDate() : undefined,
        feedback: after.feedback,
        approvedMutations: Array.isArray(after.approvedMutations) ? after.approvedMutations : [],
        rejectedMutations: Array.isArray(after.rejectedMutations) ? after.rejectedMutations : [],
      } as any);
    }
  });

// HTTP Endpoint: Manual Evolution Trigger (Admin Only)
export const triggerEvolution = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const userData = userDoc.data();
  
  if (!userData || userData.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'User must be an admin');
  }

  try {
    await evolutionCycle({} as functions.EventContext);
    return { success: true, message: 'Evolution cycle started' };
  } catch (error: any) {
    console.error('Evolution cycle error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// HTTP Endpoint: Get Evolution Status (Public - allows unauthenticated access)
export const getEvolutionStatus = functions.https.onCall(async (data, context) => {
  // Allow unauthenticated access for public status checking
  try {
    const latestVersion = await admin.firestore()
      .collection('versions')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    // Only get pending approvals if user is authenticated and admin
    let pendingApprovals = 0;
    if (context.auth) {
      const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();
      if (userData && userData.role === 'admin') {
        const approvals = await admin.firestore()
          .collection('approvals')
          .where('status', '==', 'pending')
          .get();
        pendingApprovals = approvals.size;
      }
    }

    const activeExperiments = await admin.firestore()
      .collection('experiments')
      .where('status', '==', 'active')
      .get();

    return {
      latestVersion: latestVersion.empty ? null : { id: latestVersion.docs[0].id, ...latestVersion.docs[0].data() },
      pendingApprovals,
      activeExperiments: activeExperiments.size,
    };
  } catch (error: any) {
    functions.logger.error('Get evolution status error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});