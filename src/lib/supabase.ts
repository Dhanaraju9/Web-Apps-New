import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

const getCleanEnv = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (
    trimmed.toUpperCase().includes('YOUR_') ||
    trimmed === 'https://xyzcompany.supabase.co' ||
    trimmed === 'MY_SUPABASE_URL' ||
    trimmed === 'MY_SUPABASE_ANON_KEY'
  ) {
    return '';
  }
  return trimmed;
};

// ---------------------------------------------------------------------------
// Supabase Project Credentials & Configuration
// ---------------------------------------------------------------------------
export const supabaseUrl =
  getCleanEnv(import.meta.env.VITE_SUPABASE_URL) ||
  getCleanEnv(import.meta.env.SUPABASE_URL) ||
  'https://demo-appsc-portal.supabase.co';

export const supabaseAnonKey =
  getCleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  getCleanEnv(import.meta.env.SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIn0.demoKey';

// Basic check to ensure environment variables are present
const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(getCleanEnv(rawUrl) && getCleanEnv(rawKey));

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase Config Check]: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not configured. Falling back to local/demo persistence mode.'
  );
}

// ---------------------------------------------------------------------------
// Supabase Client Initialization
// ---------------------------------------------------------------------------
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const AUTHORIZED_ADMIN_EMAIL = 'sobhadhanaraju0@gmail.com';

// ---------------------------------------------------------------------------
// Supabase Auth User Interface (Firebase User Compatible Signature)
// ---------------------------------------------------------------------------
export interface SupabaseAuthUser {
  uid: string;
  id: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  role?: string;
  isPremium?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  delete?: () => Promise<void>;
  reload?: () => Promise<void>;
  toJSON?: () => object;
}

export interface SupabaseAuthCredential {
  user: SupabaseAuthUser;
  session?: Session | null;
}

/**
 * Normalizes Supabase User object to match Firebase User interface signature
 */
export function toAuthUser(user: any): SupabaseAuthUser | null {
  if (!user) return null;
  const uid = user.id || user.uid || (typeof user === 'string' ? user : `user_${Date.now()}`);
  const email = user.email || user.user_metadata?.email || null;
  const isAuthorizedAdmin = email ? String(email).toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() : false;
  
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.displayName ||
    user.user_metadata?.name ||
    user.displayName ||
    (email ? email.split('@')[0] : null) ||
    'Aspirant';

  const phoneNumber = user.phone || user.phoneNumber || user.user_metadata?.phone || null;
  const photoURL = user.user_metadata?.avatar_url || user.photoURL || null;
  const emailVerified = Boolean(user.email_confirmed_at || user.emailVerified);

  return {
    uid,
    id: uid,
    email,
    displayName,
    phoneNumber,
    photoURL,
    emailVerified,
    isAnonymous: false,
    role: isAuthorizedAdmin ? 'admin' : (user.user_metadata?.role || 'student'),
    isPremium: isAuthorizedAdmin || Boolean(user.user_metadata?.is_premium),
    metadata: {
      creationTime: user.created_at || new Date().toISOString(),
      lastSignInTime: user.last_sign_in_at || new Date().toISOString(),
    },
    getIdToken: async (_forceRefresh?: boolean) => {
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.access_token) return data.session.access_token;
        } catch (e) {
          // fallback
        }
      }
      return `supa_token_${uid}_${Date.now()}`;
    },
    toJSON: () => ({ uid, email, displayName, phoneNumber, photoURL }),
  };
}

// ---------------------------------------------------------------------------
// Supabase Authentication Service Wrapper
// ---------------------------------------------------------------------------
let _cachedCurrentUser: SupabaseAuthUser | null = null;

export const supabaseAuthWrapper = {
  get currentUser(): SupabaseAuthUser | null {
    if (_cachedCurrentUser) return _cachedCurrentUser;
    const localEmail = localStorage.getItem('aspirant_user_email');
    const localUid = localStorage.getItem('aspirant_user_uid');
    if (localEmail && localUid) {
      _cachedCurrentUser = toAuthUser({ id: localUid, email: localEmail });
      return _cachedCurrentUser;
    }
    return null;
  },

  set currentUser(user: SupabaseAuthUser | null) {
    _cachedCurrentUser = user;
  },

  /**
   * Login with Email & Password via Supabase Auth
   */
  async signInWithEmail(email: string, pass: string): Promise<SupabaseAuthCredential> {
    const cleanEmail = email.trim();

    if (!isSupabaseConfigured) {
      const mockUser = toAuthUser({
        id: localStorage.getItem('aspirant_user_uid') || `supa_${Date.now()}`,
        email: cleanEmail,
      })!;
      _cachedCurrentUser = mockUser;
      localStorage.setItem('aspirant_user_email', cleanEmail);
      localStorage.setItem('aspirant_user_uid', mockUser.uid);
      return { user: mockUser };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (error) {
      throw new Error(error.message || 'Invalid email or password');
    }

    const user = toAuthUser(data.user)!;
    _cachedCurrentUser = user;
    localStorage.setItem('aspirant_user_email', cleanEmail);
    localStorage.setItem('aspirant_user_uid', user.uid);
    return { user, session: data.session };
  },

  /**
   * Register with Email & Password via Supabase Auth
   */
  async signUpWithEmail(email: string, pass: string, displayName?: string): Promise<SupabaseAuthCredential> {
    const cleanEmail = email.trim();
    const name = displayName || cleanEmail.split('@')[0];

    if (!isSupabaseConfigured) {
      const mockUser = toAuthUser({
        id: `supa_${Date.now()}`,
        email: cleanEmail,
        displayName: name,
      })!;
      _cachedCurrentUser = mockUser;
      localStorage.setItem('aspirant_user_email', cleanEmail);
      localStorage.setItem('aspirant_user_uid', mockUser.uid);
      return { user: mockUser };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        data: {
          full_name: name,
          displayName: name,
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to create account with Supabase Auth');
    }

    const rawUser = data.user || data.session?.user || { id: `supa_${Date.now()}`, email: cleanEmail, displayName: name };
    const user = toAuthUser(rawUser)!;
    _cachedCurrentUser = user;
    localStorage.setItem('aspirant_user_email', cleanEmail);
    localStorage.setItem('aspirant_user_uid', user.uid);
    return { user, session: data.session };
  },

  /**
   * Sign In with Google via Supabase OAuth
   */
  async signInWithGoogle(): Promise<{ user?: SupabaseAuthUser; error?: string }> {
    if (!isSupabaseConfigured) {
      const mockUser = toAuthUser({
        id: `google_${Date.now()}`,
        email: 'aspirant.google@gmail.com',
        displayName: 'Google Aspirant',
      })!;
      _cachedCurrentUser = mockUser;
      localStorage.setItem('aspirant_user_email', mockUser.email!);
      localStorage.setItem('aspirant_user_uid', mockUser.uid);
      return { user: mockUser };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return { error: error.message };
    }
    return { user: _cachedCurrentUser || undefined };
  },

  /**
   * Request Phone OTP via Supabase Auth
   */
  async signInWithPhone(phoneNumber: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const cleanDigits = String(phoneNumber || '').replace(/\D/g, '');
    const formatted = cleanDigits.length === 10 ? `+91${cleanDigits}` : (cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+91${cleanDigits}`);

    if (!isSupabaseConfigured) {
      return { success: true, message: `OTP sent via fallback to ${formatted}` };
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: formatted,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  /**
   * Verify Phone OTP via Supabase Auth
   */
  async verifyPhoneOtp(phoneNumber: string, token: string): Promise<SupabaseAuthCredential> {
    const cleanDigits = String(phoneNumber || '').replace(/\D/g, '');
    const formatted = cleanDigits.length === 10 ? `+91${cleanDigits}` : (cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+91${cleanDigits}`);

    if (!isSupabaseConfigured) {
      const mockUser = toAuthUser({
        id: `phone_${Date.now()}`,
        phone: formatted,
        phoneNumber: formatted,
        displayName: `Aspirant (${formatted.slice(-4)})`,
      })!;
      _cachedCurrentUser = mockUser;
      localStorage.setItem('aspirant_user_uid', mockUser.uid);
      localStorage.setItem('aspirant_user_phone', formatted);
      return { user: mockUser };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: token.trim(),
      type: 'sms',
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Invalid OTP verification code');
    }

    const user = toAuthUser(data.user)!;
    _cachedCurrentUser = user;
    localStorage.setItem('aspirant_user_uid', user.uid);
    if (user.email) localStorage.setItem('aspirant_user_email', user.email);
    return { user, session: data.session };
  },

  /**
   * Reset Password for user via Supabase Auth
   */
  async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim();
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
  },

  /**
   * Sign out current user from Supabase Auth
   */
  async signOut(): Promise<void> {
    _cachedCurrentUser = null;
    localStorage.removeItem('aspirant_user_email');
    localStorage.removeItem('aspirant_user_uid');
    localStorage.removeItem('aspirant_user_phone');
    localStorage.removeItem('aspirant_user_logged_in');

    if (!isSupabaseConfigured) return;

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Notice signing out from Supabase Auth:', err);
    }
  },

  /**
   * Update Profile data for current user
   */
  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<SupabaseAuthUser | null> {
    if (!isSupabaseConfigured) {
      if (_cachedCurrentUser) {
        if (updates.displayName) _cachedCurrentUser.displayName = updates.displayName;
        if (updates.photoURL) _cachedCurrentUser.photoURL = updates.photoURL;
      }
      return _cachedCurrentUser;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: updates.displayName,
        displayName: updates.displayName,
        avatar_url: updates.photoURL,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = toAuthUser(data.user);
    _cachedCurrentUser = user;
    return user;
  },

  /**
   * Subscribe to real-time auth state changes
   */
  onAuthStateChange(callback: (user: SupabaseAuthUser | null) => void): () => void {
    if (!isSupabaseConfigured) {
      const email = localStorage.getItem('aspirant_user_email');
      const uid = localStorage.getItem('aspirant_user_uid');
      if (email && uid) {
        const u = toAuthUser({ id: uid, email });
        _cachedCurrentUser = u;
        callback(u);
      } else {
        callback(null);
      }
      return () => {};
    }

    // Initial session verification
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u = toAuthUser(data.session.user);
        _cachedCurrentUser = u;
        callback(u);
      } else {
        callback(null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = toAuthUser(session.user);
        _cachedCurrentUser = user;
        if (user) {
          if (user.email) localStorage.setItem('aspirant_user_email', user.email);
          localStorage.setItem('aspirant_user_uid', user.uid);
        }
        callback(user);
      } else {
        _cachedCurrentUser = null;
        callback(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  },
};

// Aliases for direct module imports
export const registerWithSupabaseEmailPassword = (email: string, pass: string, name?: string) =>
  supabaseAuthWrapper.signUpWithEmail(email, pass, name).then((res) => res.user);

export const loginWithSupabaseEmailPassword = (email: string, pass: string) =>
  supabaseAuthWrapper.signInWithEmail(email, pass).then((res) => res.user);

export const resetSupabaseUserPassword = (email: string) =>
  supabaseAuthWrapper.resetPassword(email);

export const logoutSupabaseUser = () =>
  supabaseAuthWrapper.signOut();

export const subscribeToSupabaseAuthChanges = (cb: (user: SupabaseAuthUser | null) => void) =>
  supabaseAuthWrapper.onAuthStateChange(cb);

export const loginWithSupabaseGoogle = () =>
  supabaseAuthWrapper.signInWithGoogle();

export const supabaseAuth = supabaseAuthWrapper;
export default supabase;
