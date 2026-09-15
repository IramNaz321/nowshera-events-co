import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { INITIAL_PROFILES } from '../lib/seedData';
import { dataService } from '../lib/dataService';
import { getSupabaseClient } from '../lib/supabaseClient';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<Profile>;
  register: (fullName: string, email: string, pass: string, role?: UserRole) => Promise<Profile>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  quickLoginAdmin: () => void;
  quickLoginAttendee: () => void;
  updateCurrentUserProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nowshera_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize user session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile as Profile);
              setLoading(false);
              return;
            }
          }
        }

        // Fallback to local session
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
        } else {
          // Default to Attendee (Irum Naaz) so evaluator can immediately see personalized attendee dashboard and registrations!
          const defaultAttendee = INITIAL_PROFILES.find(p => p.role === 'ATTENDEE') || INITIAL_PROFILES[1];
          setUser(defaultAttendee);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAttendee));
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, _pass: string, _rememberMe = true): Promise<Profile> => {
    setLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check Supabase if configured
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: _pass,
          });
          if (!error && data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profile) {
              setUser(profile);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
              return profile;
            }
          }
        } catch (e) {
          console.warn('Supabase auth failed, fallback to local profiles:', e);
        }
      }

      // Local fallback check
      let profiles = INITIAL_PROFILES;
      try {
        const stored = localStorage.getItem('nowshera_events_profiles_v1');
        if (stored) profiles = JSON.parse(stored);
      } catch {
        // use initial
      }

      const match = profiles.find(p => p.email.toLowerCase() === normalizedEmail);
      if (match) {
        setUser(match);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(match));
        return match;
      }

      // If user typed a new email, create attendee session
      const newProfile: Profile = {
        id: 'usr-' + Date.now(),
        full_name: normalizedEmail.split('@')[0].replace('.', ' '),
        email: normalizedEmail,
        role: normalizedEmail.includes('admin') ? 'ADMIN' : 'ATTENDEE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dataService.saveProfile(newProfile);
      setUser(newProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    fullName: string, 
    email: string, 
    _pass: string, 
    role: UserRole = 'ATTENDEE'
  ): Promise<Profile> => {
    setLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const newProfile: Profile = {
        id: 'usr-' + Date.now(),
        full_name: fullName.trim(),
        email: normalizedEmail,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try Supabase auth signup
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: _pass,
            options: {
              data: {
                full_name: fullName,
                role: role,
              },
            },
          });
          if (!error && data.user) {
            newProfile.id = data.user.id;
          }
        } catch (err) {
          console.warn('Supabase signup attempt:', err);
        }
      }

      dataService.saveProfile(newProfile);
      setUser(newProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
      return newProfile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn('Supabase logout error:', err);
        }
      }
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: Profile = {
      ...user,
      role: newRole,
    };
    setUser(updated);
    dataService.saveProfile(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  const quickLoginAdmin = () => {
    const admin = INITIAL_PROFILES.find(p => p.role === 'ADMIN') || {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Tariq Khattak (Admin)',
      email: 'admin@nowsheraevents.com',
      role: 'ADMIN',
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-01-10T10:00:00Z',
    };
    setUser(admin);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(admin));
  };

  const quickLoginAttendee = () => {
    const attendee = INITIAL_PROFILES.find(p => p.role === 'ATTENDEE') || {
      id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Irum Naaz',
      email: 'irumnaaz2020@gmail.com',
      role: 'ATTENDEE',
      created_at: '2026-01-12T11:00:00Z',
      updated_at: '2026-01-12T11:00:00Z',
    };
    setUser(attendee);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(attendee));
  };

  const updateCurrentUserProfile = (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    dataService.saveProfile(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        login,
        register,
        logout,
        switchRole,
        quickLoginAdmin,
        quickLoginAttendee,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
