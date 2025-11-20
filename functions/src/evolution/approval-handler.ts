/**
 * Approval Handler Module
 * Processes approved mutations and prepares them for deployment
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { Approval, VersionDNA } from '../../../src/types/evolution';
import { deploymentHandler } from './deployment-handler';

/**
 * Handles approval updates and processes approved mutations
 */
export async function approvalHandler(
  approvalId: string,
  approvalData: Approval
): Promise<void> {
  try {
    functions.logger.info(`Processing approval ${approvalId}`);

    if (approvalData.status !== 'approved' && approvalData.status !== 'partially_approved') {
      functions.logger.info(`Approval ${approvalId} is not approved. Status: ${approvalData.status}`);
      return;
    }

    // Get version
    const versionDoc = await admin.firestore()
      .collection('versions')
      .doc(approvalData.versionId)
      .get();

    if (!versionDoc.exists) {
      throw new Error(`Version ${approvalData.versionId} not found`);
    }

    const version = { id: versionDoc.id, ...versionDoc.data() } as VersionDNA;

    // Update version status
    const approvedMutations = approvalData.approvedMutations || approvalData.mutationIds || [];
    const rejectedMutations = approvalData.rejectedMutations || [];
    
    await admin.firestore()
      .collection('versions')
      .doc(version.id)
      .update({
        status: approvalData.status === 'partially_approved' ? 'approved' : 'approved',
        approvedBy: approvalData.reviewedBy,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedMutations: approvedMutations,
      });

    // If partially approved, mark rejected mutations
    if (rejectedMutations.length > 0) {
      // Update mutation statuses
      const batch = admin.firestore().batch();
      for (const mutationId of rejectedMutations) {
        const mutationRef = admin.firestore().collection('mutations').doc(mutationId);
        batch.update(mutationRef, { validationStatus: 'failed' });
      }
      await batch.commit();
    }

    // Trigger deployment
    await deploymentHandler(version.id, approvedMutations);

    functions.logger.info(`Approval ${approvalId} processed successfully`);
  } catch (error: any) {
    functions.logger.error(`Approval handler failed for ${approvalId}:`, error);
    throw error;
  }
}
