/// <reference types="vite/client" />
import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { app, db, auth as rawFirebaseAuth, firebaseConfig, databaseId, isFirebaseConfigured } from './firebaseConfig';
import {
  supabase,
  isSupabaseConfigured,
  supabaseAuthWrapper,
  toAuthUser,
  type SupabaseAuthUser,
  type SupabaseAuthCredential,
  AUTHORIZED_ADMIN_EMAIL
} from './supabase';

import {
  syncUserProfileToSupabase,
  getUserProfileFromSupabase,
  fetchQuestionsFromSupabase,
  bulkUploadQuestionsToSupabase,
  fetchCurrentAffairsFromSupabase,
  saveCurrentAffairToSupabase,
  fetchMockTestsFromSupabase,
  saveMockTestToSupabase,
  fetchMockTestAttemptsFromSupabase,
  saveMockTestAttemptToSupabase,
  fetchBookmarksFromSupabase,
  saveBookmarkToSupabase,
  deleteBookmarkFromSupabase,
  syncAppToSupabase
} from '../services/supabaseService';

export { app, db, isFirebaseConfigured, AUTHORIZED_ADMIN_EMAIL };

// ---------------------------------------------------------------------------
// Types & Signatures Matching Firebase Auth Interface
// ---------------------------------------------------------------------------
export type User = SupabaseAuthUser | FirebaseUser;

export interface ConfirmationResult {
  verificationId?: string;
  confirm: (verificationCode: string) => Promise<{ user: User }>;
}

// ---------------------------------------------------------------------------
// Supabase-Routed Auth Object (Preserving Firebase `auth` signature)
// ---------------------------------------------------------------------------
export const auth: any = {
  get currentUser(): User | null {
    const supaUser = supabaseAuthWrapper.currentUser;
    if (supaUser) return supaUser as unknown as User;
    if (rawFirebaseAuth?.currentUser) return rawFirebaseAuth.currentUser;
    return null;
  },
  signOut: async () => {
    await supabaseAuthWrapper.signOut();
    if (rawFirebaseAuth) {
      try {
        await rawFirebaseAuth.signOut();
      } catch (e) {
        // ignore
      }
    }
  },
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return supabaseAuthWrapper.onAuthStateChange((user) => {
      callback(user as unknown as User);
    });
  },
  app: app,
};

// ---------------------------------------------------------------------------
// Core Auth Functions Routed to Supabase Auth
// ---------------------------------------------------------------------------

/**
 * Register new user with Email & Password via Supabase Auth
 */
export async function registerWithEmailPassword(
  email: string,
  pass: string,
  displayName?: string
): Promise<User> {
  const cred = await supabaseAuthWrapper.signUpWithEmail(email, pass, displayName);
  const user = cred.user as unknown as User;
  
  // Sync to database
  await syncUserProfileToFirestore(user, { displayName: displayName || email.split('@')[0] });
  syncUserProfileToSupabase(user, { displayName: displayName || email.split('@')[0] }).catch(() => {});
  
  return user;
}

/**
 * Login user with Email & Password via Supabase Auth
 */
export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<User> {
  const cred = await supabaseAuthWrapper.signInWithEmail(email, pass);
  const user = cred.user as unknown as User;

  // Sync to database
  await syncUserProfileToFirestore(user);
  syncUserProfileToSupabase(user).catch(() => {});

  return user;
}

/**
 * Reset password for email via Supabase Auth
 */
export async function resetUserPassword(email: string): Promise<void> {
  await supabaseAuthWrapper.resetPassword(email);
}

/**
 * Log out user from Supabase Auth (and Firebase fallback)
 */
export async function logoutUser(): Promise<void> {
  await supabaseAuthWrapper.signOut();
  if (rawFirebaseAuth) {
    try {
      await rawFirebaseAuth.signOut();
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Real-time Authentication State Listener routed to Supabase Auth
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return supabaseAuthWrapper.onAuthStateChange((supaUser) => {
    callback(supaUser as unknown as User);
  });
}

// ---------------------------------------------------------------------------
// Firebase Auth SDK Function Replacements (Identical Signatures)
// ---------------------------------------------------------------------------

export async function signInWithEmailAndPassword(
  _authInstance: any,
  email: string,
  pass: string
): Promise<{ user: User }> {
  const cred = await supabaseAuthWrapper.signInWithEmail(email, pass);
  return { user: cred.user as unknown as User };
}

export async function createUserWithEmailAndPassword(
  _authInstance: any,
  email: string,
  pass: string
): Promise<{ user: User }> {
  const cred = await supabaseAuthWrapper.signUpWithEmail(email, pass);
  return { user: cred.user as unknown as User };
}

export async function signOut(_authInstance?: any): Promise<void> {
  await logoutUser();
}

export async function sendPasswordResetEmail(
  _authInstance: any,
  email: string
): Promise<void> {
  await supabaseAuthWrapper.resetPassword(email);
}

export async function updateProfile(
  user: any,
  profile: { displayName?: string; photoURL?: string }
): Promise<void> {
  await supabaseAuthWrapper.updateUserProfile(profile);
  if (user) {
    if (profile.displayName) user.displayName = profile.displayName;
    if (profile.photoURL) user.photoURL = profile.photoURL;
  }
}

export function onAuthStateChanged(
  _authInstance: any,
  nextOrObserver: ((user: User | null) => void) | { next: (user: User | null) => void }
): () => void {
  const callback = typeof nextOrObserver === 'function' ? nextOrObserver : nextOrObserver.next;
  return supabaseAuthWrapper.onAuthStateChange((user) => {
    callback(user as unknown as User);
  });
}

// ---------------------------------------------------------------------------
// Google Sign-In Provider & Popup Wrapper
// ---------------------------------------------------------------------------
export class GoogleAuthProvider {
  providerId = 'google.com';
}

export async function signInWithPopup(
  _authInstance: any,
  _provider?: any
): Promise<{ user: User }> {
  const res = await supabaseAuthWrapper.signInWithGoogle();
  if (res.error) {
    throw new Error(res.error);
  }
  const user = (res.user || supabaseAuthWrapper.currentUser) as unknown as User;
  if (!user) {
    throw new Error('Google sign-in incomplete');
  }
  await syncUserProfileToFirestore(user);
  syncUserProfileToSupabase(user).catch(() => {});
  return { user };
}

// ---------------------------------------------------------------------------
// Phone Authentication Wrapper (reCAPTCHA & ConfirmationResult)
// ---------------------------------------------------------------------------
export class RecaptchaVerifier {
  constructor(_auth: any, _container: string | HTMLElement, _parameters?: any) {}
  async render(): Promise<number> {
    return 1;
  }
  clear(): void {
    // no-op
  }
  async verify(): Promise<string> {
    return 'verified';
  }
}

export function createRecaptchaVerifier(containerId: string): RecaptchaVerifier | null {
  if (typeof window === 'undefined') return null;
  const containerEl = document.getElementById(containerId);
  if (containerEl) {
    containerEl.innerHTML = '';
  }
  const verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

export async function signInWithPhoneNumber(
  _authInstance: any,
  phoneNumber: string,
  _appVerifier?: any
): Promise<ConfirmationResult> {
  const cleanDigits = String(phoneNumber || '').replace(/\D/g, '');
  const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : (cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+91${cleanDigits}`);

  const res = await supabaseAuthWrapper.signInWithPhone(formattedPhone);
  if (!res.success && res.error) {
    throw new Error(res.error);
  }

  const confirmationResult: ConfirmationResult = {
    verificationId: `supa_verif_${Date.now()}`,
    confirm: async (verificationCode: string) => {
      const cred = await supabaseAuthWrapper.verifyPhoneOtp(formattedPhone, verificationCode);
      const user = cred.user as unknown as User;
      await syncUserProfileToFirestore(user, { phoneNumber: formattedPhone });
      syncUserProfileToSupabase(user, { phoneNumber: formattedPhone }).catch(() => {});
      return { user };
    },
  };

  return confirmationResult;
}

export async function requestFirebasePhoneOtp(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string; errorCode?: string; formattedPhone: string }> {
  const cleanDigits = String(phoneNumber || '').replace(/\D/g, '');
  const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : (cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+91${cleanDigits}`);

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    return {
      success: true,
      confirmationResult,
      formattedPhone
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to send OTP via Supabase Auth',
      errorCode: 'auth/phone-failed',
      formattedPhone
    };
  }
}

export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string,
  phoneNumber: string
): Promise<{ success: boolean; user?: User; error?: string; errorCode?: string }> {
  try {
    const cred = await confirmationResult.confirm(otpCode.trim());
    if (cred.user) {
      await syncUserProfileToFirestore(cred.user, {
        phoneNumber: (cred.user as any).phoneNumber || phoneNumber
      });
      return {
        success: true,
        user: cred.user
      };
    }
    return {
      success: false,
      error: 'Unable to verify code. Please try again.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'OTP verification failed',
      errorCode: 'auth/invalid-verification-code'
    };
  }
}

// ---------------------------------------------------------------------------
// User Profile & Document Sync in Firestore
// ---------------------------------------------------------------------------
export async function syncUserProfileToFirestore(user: User, additionalData: Record<string, any> = {}) {
  try {
    if (!user || !user.uid) return null;
    const isAuthorizedAdmin = Boolean(user.email && user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase());

    const payload: Record<string, any> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || additionalData.displayName || '',
      phoneNumber: user.phoneNumber || additionalData.phoneNumber || '',
      photoURL: user.photoURL || '',
      lastLoginAt: new Date().toISOString(),
      isPremium: isAuthorizedAdmin ? true : false,
      role: isAuthorizedAdmin ? 'admin' : 'student',
      ...additionalData
    };

    // Always sync to Supabase PostgreSQL profile
    syncUserProfileToSupabase(user, additionalData).catch(err => {
      console.warn('Supabase background profile sync notice:', err);
    });

    if (!db || !isFirebaseConfigured) {
      localStorage.setItem(`aspirant_user_profile_${user.uid}`, JSON.stringify(payload));
      return payload;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userDocRef);

    if (!existingSnap.exists()) {
      payload.createdAt = new Date().toISOString();
    }

    await setDoc(userDocRef, payload, { merge: true });
    return payload;
  } catch (err) {
    console.warn('User profile sync notice:', err);
    return null;
  }
}

export async function getUserProfileFromFirestore(uid: string) {
  try {
    if (!db || !isFirebaseConfigured) {
      const cached = localStorage.getItem(`aspirant_user_profile_${uid}`);
      return cached ? JSON.parse(cached) : null;
    }
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch user profile:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper functions for Current Affairs
// ---------------------------------------------------------------------------
export async function fetchCurrentAffairsFromFirestore() {
  const supaItems = await fetchCurrentAffairsFromSupabase();
  if (supaItems && supaItems.length > 0) {
    return supaItems;
  }
  if (!db || !isFirebaseConfigured) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'currentAffairs'));
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching current affairs:', err);
    return [];
  }
}

export async function saveCurrentAffairToFirestore(item: { appId: string; month: string; title: string; content: string; publishedDate: string }) {
  saveCurrentAffairToSupabase(item).catch(() => {});
  if (!db || !isFirebaseConfigured) return `ca_${Date.now()}`;
  try {
    const docRef = await addDoc(collection(db, 'currentAffairs'), {
      ...item,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (err) {
    console.warn('Notice saving current affair:', err);
    return `ca_${Date.now()}`;
  }
}

export async function bulkUploadCurrentAffairsToFirestore(items: any[]) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    for (const item of items) {
      await addDoc(collection(db, 'currentAffairs'), {
        ...item,
        createdAt: Timestamp.now()
      });
    }
    return true;
  } catch (err) {
    console.warn('Notice bulk uploading current affairs:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// Helper functions for Questions / MCQs
// ---------------------------------------------------------------------------
export async function fetchQuestionsFromFirestore(filter?: {
  appId?: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  subtopic?: string;
}) {
  const supaQuestions = await fetchQuestionsFromSupabase(filter);
  if (supaQuestions && supaQuestions.length > 0) {
    return supaQuestions;
  }
  if (!db || !isFirebaseConfigured) return [];
  try {
    const qRef = collection(db, 'questions');
    const constraints: any[] = [];
    if (filter?.appId) constraints.push(where('appId', '==', filter.appId));
    if (filter?.subjectId) constraints.push(where('subjectId', '==', filter.subjectId));
    if (filter?.unitId) constraints.push(where('unitId', '==', filter.unitId));
    if (filter?.topicId) constraints.push(where('topicId', '==', filter.topicId));
    if (filter?.subtopic) constraints.push(where('subtopic', '==', filter.subtopic));

    const q = constraints.length > 0 ? query(qRef, ...constraints) : qRef;
    const querySnapshot = await getDocs(q);
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() });
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching questions:', err);
    return [];
  }
}

export async function bulkUploadQuestionsToFirestore(questions: any[]) {
  bulkUploadQuestionsToSupabase(questions).catch(() => {});
  if (!db || !isFirebaseConfigured) return true;
  try {
    for (const q of questions) {
      await addDoc(collection(db, 'questions'), {
        ...q,
        createdAt: Timestamp.now()
      });
    }
    return true;
  } catch (err) {
    console.warn('Notice bulk uploading questions:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// Helper functions for Mock Tests
// ---------------------------------------------------------------------------
export async function fetchMockTestsFromFirestore(appId?: string, userId?: string) {
  const supabaseTests = await fetchMockTestsFromSupabase(appId, userId);
  if (supabaseTests && supabaseTests.length > 0) {
    return supabaseTests;
  }
  if (!db || !isFirebaseConfigured) return [];
  try {
    const mtRef = collection(db, 'mockTests');
    const querySnapshot = await getDocs(mtRef);
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (appId && data.appId && data.appId !== appId && data.appId !== 'all') {
        return;
      }
      if (data.isOfficial || data.status === 'published') {
        items.push({ id: docSnap.id, ...data });
      } else if (userId && data.creatorUserId === userId) {
        items.push({ id: docSnap.id, ...data });
      }
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching mock tests:', err);
    return [];
  }
}

export async function saveMockTestToFirestore(mockTest: any) {
  const docId = mockTest.id || `mt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const mockTestWithId = {
    ...mockTest,
    id: docId,
    createdAt: mockTest.createdAt || new Date().toISOString()
  };
  saveMockTestToSupabase(mockTestWithId).catch(err => {
    console.warn('Notice saving mock test to Supabase:', err);
  });
  if (!db || !isFirebaseConfigured) return mockTestWithId;
  try {
    await setDoc(doc(db, 'mockTests', docId), mockTestWithId);
    return mockTestWithId;
  } catch (err) {
    console.warn('Notice saving mock test:', err);
    return mockTestWithId;
  }
}

export async function updateMockTestInFirestore(id: string, updates: any) {
  saveMockTestToSupabase({ id, ...updates }).catch(() => {});
  if (!db || !isFirebaseConfigured) return true;
  try {
    await setDoc(doc(db, 'mockTests', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Notice updating mock test:', err);
    return true;
  }
}

export async function deleteMockTestFromFirestore(id: string) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    await deleteDoc(doc(db, 'mockTests', id));
    return true;
  } catch (err) {
    console.warn('Notice deleting mock test:', err);
    return true;
  }
}

export async function saveMockTestAttemptToFirestore(attempt: any) {
  const attemptId = attempt.id || `mta-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const dataWithId = {
    ...attempt,
    id: attemptId
  };
  saveMockTestAttemptToSupabase(dataWithId).catch(err => {
    console.warn('Notice saving test attempt to Supabase:', err);
  });
  if (!db || !isFirebaseConfigured) return dataWithId;
  try {
    await setDoc(doc(db, 'mockTestAttempts', attemptId), dataWithId);
    return dataWithId;
  } catch (err) {
    console.warn('Notice saving mock test attempt:', err);
    return dataWithId;
  }
}

export async function fetchMockTestAttemptsFromFirestore(appId?: string, userId?: string) {
  const supabaseAttempts = await fetchMockTestAttemptsFromSupabase(userId, appId);
  if (supabaseAttempts && supabaseAttempts.length > 0) {
    return supabaseAttempts;
  }
  if (!db || !isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'mockTestAttempts');
    const querySnapshot = await getDocs(ref);
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      if (appId && d.appId && d.appId !== appId) return;
      if (userId && d.userId && d.userId !== userId) return;
      items.push({ id: docSnap.id, ...d });
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching mock test attempts:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Bookmark helper functions
// ---------------------------------------------------------------------------
export async function fetchBookmarksFromFirestore(userId: string, appId?: string) {
  const supabaseBookmarks = await fetchBookmarksFromSupabase(userId, appId);
  if (supabaseBookmarks && supabaseBookmarks.length > 0) {
    return supabaseBookmarks;
  }
  if (!db || !isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'bookmarks');
    const querySnapshot = await getDocs(ref);
    const items: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.userId === userId) {
        if (!appId || d.appId === appId || d.appId === 'all') {
          items.push({ id: docSnap.id, ...d });
        }
      }
    });
    return items;
  } catch (err) {
    console.warn('Notice fetching bookmarks:', err);
    return [];
  }
}

export async function saveBookmarkToFirestore(bookmark: any) {
  const docId = bookmark.id || `${bookmark.userId}_${bookmark.itemType}_${bookmark.itemId}`;
  const dataWithId = {
    ...bookmark,
    id: docId
  };
  saveBookmarkToSupabase(dataWithId).catch(err => {
    console.warn('Notice saving bookmark to Supabase:', err);
  });
  if (!db || !isFirebaseConfigured) return dataWithId;
  try {
    await setDoc(doc(db, 'bookmarks', docId), dataWithId);
    return dataWithId;
  } catch (err) {
    console.warn('Notice saving bookmark:', err);
    return dataWithId;
  }
}

export async function deleteBookmarkFromFirestore(id: string) {
  deleteBookmarkFromSupabase(id).catch(err => {
    console.warn('Notice deleting bookmark from Supabase:', err);
  });
  if (!db || !isFirebaseConfigured) return true;
  try {
    await deleteDoc(doc(db, 'bookmarks', id));
    return true;
  } catch (err) {
    console.warn('Notice deleting bookmark:', err);
    return true;
  }
}

export async function deleteMultipleBookmarksFromFirestore(ids: string[]) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    for (const id of ids) {
      await deleteDoc(doc(db, 'bookmarks', id));
    }
    return true;
  } catch (err) {
    console.warn('Notice bulk deleting bookmarks:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// Practice History & Exam Results Persistence
// ---------------------------------------------------------------------------
export async function savePracticeResultToFirestore(result: {
  userId: string;
  appId: string;
  subjectId: string;
  unitId?: string;
  topicId?: string;
  subtopic?: string;
  score: number;
  total: number;
  accuracy: number;
  timeSpentSeconds: number;
  answers: Record<string, any>;
}) {
  if (!db || !isFirebaseConfigured) return `pr_${Date.now()}`;
  try {
    const docRef = await addDoc(collection(db, 'practiceResults'), {
      ...result,
      createdAt: new Date().toISOString(),
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (err) {
    console.warn('Notice saving practice result:', err);
    return `pr_${Date.now()}`;
  }
}

export async function fetchUserPracticeHistoryFromFirestore(userId: string, appId?: string) {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'practiceResults');
    const constraints: any[] = [where('userId', '==', userId)];
    if (appId) constraints.push(where('appId', '==', appId));

    const q = query(ref, ...constraints);
    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach((d) => results.push({ id: d.id, ...d.data() }));
    return results;
  } catch (err) {
    console.warn('Notice fetching practice history:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Subscriptions & Purchases Sync
// ---------------------------------------------------------------------------
export async function recordPurchaseInFirestore(purchase: Record<string, any>) {
  const purchaseId = purchase.orderId || purchase.id || `pur_${Date.now()}`;
  if (!db || !isFirebaseConfigured) return purchaseId;
  try {
    await setDoc(doc(db, 'purchases', purchaseId), {
      ...purchase,
      id: purchaseId,
      timestamp: Timestamp.now(),
      createdAt: purchase.createdAt || new Date().toISOString()
    });
    return purchaseId;
  } catch (err) {
    console.warn('Notice recording purchase:', err);
    return purchaseId;
  }
}

export async function fetchUserPurchasesFromFirestore(userId: string, appId?: string) {
  if (!db || !isFirebaseConfigured) return [];
  try {
    const ref = collection(db, 'purchases');
    const snap = await getDocs(ref);
    const results: any[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.userId === userId || data.email === userId) {
        if (!appId || data.appId === appId || data.appId === 'all') {
          results.push({ id: d.id, ...data });
        }
      }
    });
    return results;
  } catch (err) {
    console.warn('Notice fetching purchases:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Subjects & Syllabus Cloud Sync
// ---------------------------------------------------------------------------
export async function syncAppSyllabusToFirestore(appId: string, syllabus: any[]) {
  if (!db || !isFirebaseConfigured) return true;
  try {
    await setDoc(doc(db, 'appSyllabus', appId), {
      appId,
      syllabus,
      updatedAt: new Date().toISOString(),
      timestamp: Timestamp.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Notice syncing syllabus:', err);
    return true;
  }
}

export async function fetchAppSyllabusFromFirestore(appId: string) {
  if (!db || !isFirebaseConfigured) return null;
  try {
    const docSnap = await getDoc(doc(db, 'appSyllabus', appId));
    if (docSnap.exists()) {
      return docSnap.data().syllabus || null;
    }
    return null;
  } catch (err) {
    console.warn('Notice fetching syllabus:', err);
    return null;
  }
}
