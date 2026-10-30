import {
  supabase,
  isSupabaseConfigured,
  toAuthUser,
  SupabaseAuthUser,
  supabaseAuthWrapper,
  registerWithSupabaseEmailPassword,
  loginWithSupabaseEmailPassword,
  resetSupabaseUserPassword,
  logoutSupabaseUser,
  subscribeToSupabaseAuthChanges,
  loginWithSupabaseGoogle,
  AUTHORIZED_ADMIN_EMAIL,
} from './supabase';

export {
  supabase,
  isSupabaseConfigured,
  toAuthUser as normalizeSupabaseUser,
  toAuthUser,
  supabaseAuthWrapper,
  registerWithSupabaseEmailPassword,
  loginWithSupabaseEmailPassword,
  resetSupabaseUserPassword,
  logoutSupabaseUser,
  subscribeToSupabaseAuthChanges,
  loginWithSupabaseGoogle,
  AUTHORIZED_ADMIN_EMAIL,
};

export type { SupabaseAuthUser };
export default supabaseAuthWrapper;
