/**
 * Firestore Database Utilities
 * Helper functions for interacting with Firestore collections
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './client';
import type {
  VersionDNA,
  Review,
  Mutation,
  Snapshot,
  Config,
  Approval,
  Experiment,
  AnalyticsEvent,
} from '@/types/evolution';

// Collection names
export const COLLECTIONS = {
  VERSIONS: 'versions',
  REVIEWS: 'reviews',
  MUTATIONS: 'mutations',
  SNAPSHOTS: 'snapshots',
  CONFIGS: 'configs',
  APPROVALS: 'approvals',
  EXPERIMENTS: 'experiments',
  ANALYTICS: 'analytics',
  USERS: 'users',
} as const;

// Helper function to convert Firestore Timestamp to Date
const timestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
};

// Helper function to convert Date to Firestore Timestamp
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Helper function to convert document data with timestamps
const convertTimestamps = <T extends DocumentData>(data: T): T => {
  const converted: any = { ...data };
  for (const key in converted) {
    const value = converted[key];
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      // Check if it's a Firestore Timestamp
      converted[key] = timestampToDate(value as Timestamp);
    } else if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
      // Recursively convert nested objects
      converted[key] = convertTimestamps(value as DocumentData);
    }
  }
  return converted as T;
};

// Helper to remove undefined fields (Firestore rejects undefined)
const removeUndefinedFields = <T extends Record<string, any>>(data: T): Partial<T> => {
  const cleaned: Partial<T> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleaned[key as keyof T] = value;
    }
  });
  return cleaned;
};

// Versions
export const versions = {
  async create(version: Omit<VersionDNA, 'id'>): Promise<string> {
    const ref = doc(collection(db, COLLECTIONS.VERSIONS));
    const versionData: any = {
      ...version,
      id: ref.id,
      createdAt: dateToTimestamp(version.createdAt),
      deployedAt: version.deployedAt ? dateToTimestamp(version.deployedAt) : null,
      approvedAt: version.approvedAt ? dateToTimestamp(version.approvedAt) : null,
    };
    await setDoc(ref, versionData);
    return ref.id;
  },

  async get(id: string): Promise<VersionDNA | null> {
    const ref = doc(db, COLLECTIONS.VERSIONS, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = convertTimestamps({ id: snap.id, ...snap.data() } as VersionDNA);
    // Ensure mutations is always an array
    if (!Array.isArray(data.mutations)) {
      data.mutations = [];
    }
    // Ensure lineage is always an array
    if (!Array.isArray(data.lineage)) {
      data.lineage = [];
    }
    return data;
  },

  async getAll(constraints: QueryConstraint[] = []): Promise<VersionDNA[]> {
    const q = query(collection(db, COLLECTIONS.VERSIONS), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = convertTimestamps({ id: doc.id, ...doc.data() } as VersionDNA);
      // Ensure mutations is always an array
      if (!Array.isArray(data.mutations)) {
        data.mutations = [];
      }
      // Ensure lineage is always an array
      if (!Array.isArray(data.lineage)) {
        data.lineage = [];
      }
      return data;
    });
  },

  async update(id: string, updates: Partial<VersionDNA>): Promise<void> {
    const ref = doc(db, COLLECTIONS.VERSIONS, id);
    const updateData: any = { ...updates };
    if (updateData.deployedAt) {
      updateData.deployedAt = dateToTimestamp(updateData.deployedAt);
    }
    if (updateData.approvedAt) {
      updateData.approvedAt = dateToTimestamp(updateData.approvedAt);
    }
    await updateDoc(ref, removeUndefinedFields(updateData));
  },
};

// Reviews
export const reviews = {
  async create(review: Omit<Review, 'id'>): Promise<string> {
    const ref = doc(collection(db, COLLECTIONS.REVIEWS));
    const reviewData: any = {
      ...review,
      id: ref.id,
      createdAt: dateToTimestamp(review.createdAt),
      addressedAt: review.addressedAt ? dateToTimestamp(review.addressedAt) : null,
    };
    await setDoc(ref, reviewData);
    return ref.id;
  },

  async getByVersion(versionId: string): Promise<Review[]> {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('versionId', '==', versionId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) =>
      convertTimestamps({ id: doc.id, ...doc.data() } as Review)
    );
  },
};

// Mutations
export const mutations = {
  async create(mutation: Omit<Mutation, 'id'>): Promise<string> {
    const ref = doc(collection(db, COLLECTIONS.MUTATIONS));
    await setDoc(ref, { ...mutation, id: ref.id });
    return ref.id;
  },

  async get(id: string): Promise<Mutation | null> {
    const ref = doc(db, COLLECTIONS.MUTATIONS, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Mutation;
  },
};

// Snapshots
export const snapshots = {
  async create(snapshot: Omit<Snapshot, 'id'>): Promise<string> {
    const ref = doc(collection(db, COLLECTIONS.SNAPSHOTS));
    const snapshotData: any = {
      ...snapshot,
      id: ref.id,
      createdAt: dateToTimestamp(snapshot.createdAt),
    };
    await setDoc(ref, snapshotData);
    return ref.id;
  },

  async getLatest(): Promise<Snapshot | null> {
    const q = query(
      collection(db, COLLECTIONS.SNAPSHOTS),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return convertTimestamps({ id: doc.id, ...doc.data() } as Snapshot);
  },
};

// Configs
export const configs = {
  async get(key: string): Promise<Config | null> {
    const ref = doc(db, COLLECTIONS.CONFIGS, key);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return convertTimestamps({ id: snap.id, ...snap.data() } as Config);
  },

  async set(config: Config): Promise<void> {
    const ref = doc(db, COLLECTIONS.CONFIGS, config.key);
    const configData: any = {
      ...config,
      updatedAt: dateToTimestamp(config.updatedAt),
    };
    await setDoc(ref, configData);
  },
};

// Approvals
export const approvals = {
  async create(approval: Omit<Approval, 'id'>): Promise<string> {
    const ref = doc(collection(db, COLLECTIONS.APPROVALS));
    const approvalData: any = {
      ...approval,
      id: ref.id,
      requestedAt: dateToTimestamp(approval.requestedAt),
      reviewedAt: approval.reviewedAt ? dateToTimestamp(approval.reviewedAt) : null,
    };
    await setDoc(ref, approvalData);
    return ref.id;
  },

  async getPending(): Promise<Approval[]> {
    const q = query(
      collection(db, COLLECTIONS.APPROVALS),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) =>
      convertTimestamps({ id: doc.id, ...doc.data() } as Approval)
    );
  },

  async update(id: string, updates: Partial<Approval>): Promise<void> {
    const ref = doc(db, COLLECTIONS.APPROVALS, id);
    const updateData: any = { ...updates };
    if (updateData.reviewedAt) {
      updateData.reviewedAt = dateToTimestamp(updateData.reviewedAt);
    }
    await updateDoc(ref, removeUndefinedFields(updateData));
  },
};

// Analytics
export const analytics = {
  async create(event: Omit<AnalyticsEvent, 'id'>): Promise<string> {
    const ref = doc(collection(db, COLLECTIONS.ANALYTICS));
    const eventData: any = {
      ...event,
      id: ref.id,
      timestamp: dateToTimestamp(event.timestamp),
    };
    await setDoc(ref, eventData);
    return ref.id;
  },

  async getByExperiment(experimentId: string, limitCount: number = 1000): Promise<AnalyticsEvent[]> {
    const q = query(
      collection(db, COLLECTIONS.ANALYTICS),
      where('experimentId', '==', experimentId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) =>
      convertTimestamps({ id: doc.id, ...doc.data() } as AnalyticsEvent)
    );
  },
};
