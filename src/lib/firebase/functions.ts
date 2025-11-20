/**
 * Firebase Cloud Functions Client SDK
 * Provides client-side functions to call Cloud Functions
 */

import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { app } from './client';

let functions: Functions | null = null;

if (typeof window !== 'undefined' && app) {
  try {
    functions = getFunctions(app);
  } catch (error) {
    console.warn('Firebase Functions initialization failed:', error);
  }
}

export { functions };

export async function triggerEvolution() {
  if (!functions) {
    throw new Error('Firebase is not configured. Please set up Firebase credentials in .env.local file. See FIREBASE_SETUP.md for instructions.');
  }

  try {
    const triggerEvolutionFunction = httpsCallable(functions, 'triggerEvolution');
    const result = await triggerEvolutionFunction();
    return result.data as { success: boolean; message: string };
  } catch (error: any) {
    if (error.code === 'auth/invalid-api-key' || error.message?.includes('invalid-api-key')) {
      throw new Error('Firebase is not configured. Please set up Firebase credentials in .env.local file. See FIREBASE_SETUP.md for instructions.');
    }
    throw error;
  }
}

export async function getEvolutionStatus() {
  if (!functions) {
    throw new Error('Firebase is not configured. Please set up Firebase credentials in .env.local file. See FIREBASE_SETUP.md for instructions.');
  }

  try {
    const getEvolutionStatusFunction = httpsCallable(functions, 'getEvolutionStatus');
    const result = await getEvolutionStatusFunction();
    return result.data;
  } catch (error: any) {
    if (error.code === 'auth/invalid-api-key' || error.message?.includes('invalid-api-key')) {
      throw new Error('Firebase is not configured. Please set up Firebase credentials in .env.local file. See FIREBASE_SETUP.md for instructions.');
    }
    throw error;
  }
}