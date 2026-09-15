import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from environment or runtime localStorage
export const getStoredSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('nowshera_supabase_url') || '';
  const localKey = localStorage.getItem('nowshera_supabase_anon_key') || '';

  const url = localUrl.trim() || envUrl.trim();
  const key = localKey.trim() || envKey.trim();

  const isConfigured = Boolean(
    url && 
    key && 
    url !== 'https://xyzcompany.supabase.co' && 
    !key.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  );

  return { url, key, isConfigured };
};

let clientInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getStoredSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  if (!clientInstance || lastUrl !== url || lastKey !== key) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      lastUrl = url;
      lastKey = key;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return clientInstance;
};
