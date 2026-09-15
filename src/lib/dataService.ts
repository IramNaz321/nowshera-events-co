import { 
  EventItem, 
  EventWithStats, 
  Profile, 
  Registration, 
  DashboardStats,
  UserRole
} from '../types/database';
import { INITIAL_EVENTS, INITIAL_PROFILES, INITIAL_REGISTRATIONS } from './seedData';
import { getSupabaseClient, getStoredSupabaseConfig } from './supabaseClient';

const STORAGE_KEYS = {
  PROFILES: 'nowshera_events_profiles_v1',
  EVENTS: 'nowshera_events_events_v1',
  REGISTRATIONS: 'nowshera_events_registrations_v1',
};

// Local storage helpers
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// Initializer for local database
export function initializeDatabase(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    setLocal(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    setLocal(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
    setLocal(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
  }
}

export function resetDatabaseToDefault(): void {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
}

// Helper to calculate event statistics
function computeStatsForEvent(
  event: EventItem, 
  registrations: Registration[], 
  currentUserId?: string
): EventWithStats {
  const activeRegs = registrations.filter(
    r => r.event_id === event.id && r.status === 'active'
  );
  const registered_count = activeRegs.length;
  const available_seats = Math.max(0, event.capacity - registered_count);

  let is_registered = false;
  let user_registration_id: string | undefined = undefined;
  let user_registration_status: Registration['status'] | undefined = undefined;

  if (currentUserId) {
    const userReg = registrations.find(
      r => r.event_id === event.id && r.user_id === currentUserId && r.status === 'active'
    );
    if (userReg) {
      is_registered = true;
      user_registration_id = userReg.id;
      user_registration_status = userReg.status;
    }
  }

  return {
    ...event,
    registered_count,
    available_seats,
    is_registered,
    user_registration_id,
    user_registration_status,
  };
}

// Helper: Check if event date is in the past
export function isEventPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  return eventDate < today;
}

export const dataService = {
  isSupabaseConfigured(): boolean {
    return getStoredSupabaseConfig().isConfigured;
  },

  // ----------------------------------------------------
  // EVENTS
  // ----------------------------------------------------
  async getEvents(options: { 
    includeAllStatuses?: boolean; 
    currentUserId?: string;
    category?: string;
    search?: string;
  } = {}): Promise<EventWithStats[]> {
    initializeDatabase();
    const supabase = getSupabaseClient();

    let events: EventItem[] = [];
    let registrations: Registration[] = [];

    if (supabase) {
      try {
        let query = supabase.from('events').select('*');
        if (!options.includeAllStatuses) {
          query = query.eq('status', 'Published');
        }
        const { data: evData, error: evErr } = await query.order('event_date', { ascending: true });
        if (evErr) throw evErr;
        events = evData || [];

        const { data: regData } = await supabase.from('registrations').select('*');
        registrations = regData || [];
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
        events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
        registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
      }
    } else {
      events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    }

    // Filter rule 7: Only published upcoming events appear publicly (unless admin explicitly asks for all statuses)
    let filtered = events;
    if (!options.includeAllStatuses) {
      filtered = filtered.filter(ev => ev.status === 'Published' && !isEventPast(ev.event_date));
    }

    // Category filter
    if (options.category && options.category !== 'All') {
      filtered = filtered.filter(ev => ev.category === options.category);
    }

    // Search filter
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(ev => 
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        (ev.speaker_name && ev.speaker_name.toLowerCase().includes(q))
      );
    }

    return filtered.map(ev => computeStatsForEvent(ev, registrations, options.currentUserId));
  },

  async getEventById(id: string, currentUserId?: string): Promise<EventWithStats | null> {
    initializeDatabase();
    const events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);

    const event = events.find(e => e.id === id);
    if (!event) return null;

    return computeStatsForEvent(event, registrations, currentUserId);
  },

  // Rule 11, 12, 13: Only Admins can create and edit events
  async createEvent(
    eventData: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>,
    adminProfile: Profile
  ): Promise<EventItem> {
    if (adminProfile.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only administrators can create events.');
    }

    // Rule 11: Capacity must be a positive whole number
    const capacityNum = Number(eventData.capacity);
    if (!Number.isInteger(capacityNum) || capacityNum <= 0) {
      throw new Error('Validation Error: Capacity must be a positive whole number greater than 0.');
    }

    if (!eventData.title.trim()) {
      throw new Error('Validation Error: Event title is required.');
    }
    if (!eventData.event_date) {
      throw new Error('Validation Error: Event date is required.');
    }
    if (!eventData.location.trim()) {
      throw new Error('Validation Error: Event location is required.');
    }

    const newEvent: EventItem = {
      ...eventData,
      id: 'ev-' + Date.now(),
      capacity: capacityNum,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('events').insert([newEvent]).select().single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('Supabase insert failed, persisting locally:', err);
      }
    }

    const events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    events.unshift(newEvent);
    setLocal(STORAGE_KEYS.EVENTS, events);

    return newEvent;
  },

  async updateEvent(
    id: string,
    updates: Partial<EventItem>,
    adminProfile: Profile
  ): Promise<EventItem> {
    if (adminProfile.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only administrators can update events.');
    }

    const events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found.');
    }

    const existingEvent = events[eventIndex];
    const registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const activeCount = registrations.filter(r => r.event_id === id && r.status === 'active').length;

    // Rule 11: Capacity must be a positive whole number
    if (updates.capacity !== undefined) {
      const cap = Number(updates.capacity);
      if (!Number.isInteger(cap) || cap <= 0) {
        throw new Error('Validation Error: Capacity must be a positive whole number.');
      }
      // Rule 12: Capacity cannot be reduced below active registrations
      if (cap < activeCount) {
        throw new Error(
          `Validation Error: Capacity (${cap}) cannot be less than current active registrations (${activeCount}).`
        );
      }
      updates.capacity = cap;
    }

    const updatedEvent: EventItem = {
      ...existingEvent,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('events').update(updates).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase update failed, continuing locally:', err);
      }
    }

    events[eventIndex] = updatedEvent;
    setLocal(STORAGE_KEYS.EVENTS, events);

    return updatedEvent;
  },

  async deleteEvent(id: string, adminProfile: Profile): Promise<void> {
    if (adminProfile.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only administrators can delete events.');
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('events').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    const events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS).filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.EVENTS, events);

    // Also remove associated registrations
    const regs = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS).filter(
      r => r.event_id !== id
    );
    setLocal(STORAGE_KEYS.REGISTRATIONS, regs);
  },

  // ----------------------------------------------------
  // REGISTRATIONS & BUSINESS RULES ENFORCEMENT
  // ----------------------------------------------------
  async registerForEvent(eventId: string, user: Profile): Promise<Registration> {
    initializeDatabase();

    const events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const event = events.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Event not found.');
    }

    // Rule 4, 5, 7: Status validations
    if (event.status === 'Cancelled') {
      throw new Error('Registration is closed: This event has been cancelled.');
    }
    if (event.status === 'Completed') {
      throw new Error('Registration is closed: This event has already concluded.');
    }
    if (event.status !== 'Published') {
      throw new Error(`Registration is not available because this event is marked as ${event.status}.`);
    }

    // Rule 6: Past events cannot accept registrations
    if (isEventPast(event.event_date)) {
      throw new Error('Registration is closed: This event date has already passed.');
    }

    const registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);

    // Rule 1 & 2: One active registration per attendee per event. Duplicate registration must be rejected.
    const existingActive = registrations.find(
      r => r.event_id === eventId && r.user_id === user.id && r.status === 'active'
    );
    if (existingActive) {
      throw new Error('You are already registered for this event. Check your attendee dashboard for your pass.');
    }

    // Rule 8: Cancelled registrations do not count toward capacity
    const activeRegistrations = registrations.filter(
      r => r.event_id === eventId && r.status === 'active'
    );

    // Rule 3: Full events cannot accept registrations
    if (activeRegistrations.length >= event.capacity) {
      throw new Error('This event is at full capacity. All seats have been reserved.');
    }

    // Check if user had a previous cancelled registration that can be re-activated, or create new
    const previousCancelledIndex = registrations.findIndex(
      r => r.event_id === eventId && r.user_id === user.id && r.status === 'cancelled'
    );

    let finalRegistration: Registration;

    if (previousCancelledIndex !== -1) {
      // Re-activate existing registration record
      registrations[previousCancelledIndex].status = 'active';
      registrations[previousCancelledIndex].updated_at = new Date().toISOString();
      finalRegistration = registrations[previousCancelledIndex];
    } else {
      finalRegistration = {
        id: 'reg-' + Date.now(),
        user_id: user.id,
        event_id: eventId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      registrations.push(finalRegistration);
    }

    // Rule 9: Registration immediately updates available seats
    setLocal(STORAGE_KEYS.REGISTRATIONS, registrations);

    // Sync with Supabase if active
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('registrations').upsert([finalRegistration]);
      } catch (err) {
        console.warn('Supabase registration sync error:', err);
      }
    }

    return finalRegistration;
  },

  // Rule 10: Cancellation immediately updates available seats
  // Rule 14: Attendees can only cancel/access their own registrations
  async cancelRegistration(registrationId: string, user: Profile): Promise<void> {
    initializeDatabase();
    const registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const regIndex = registrations.findIndex(r => r.id === registrationId);

    if (regIndex === -1) {
      throw new Error('Registration record not found.');
    }

    const reg = registrations[regIndex];

    // Rule 14: Check ownership
    if (user.role !== 'ADMIN' && reg.user_id !== user.id) {
      throw new Error('Unauthorized: You can only cancel your own registrations.');
    }

    registrations[regIndex].status = 'cancelled';
    registrations[regIndex].updated_at = new Date().toISOString();

    setLocal(STORAGE_KEYS.REGISTRATIONS, registrations);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('registrations')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', registrationId);
      } catch (err) {
        console.warn('Supabase cancel registration error:', err);
      }
    }
  },

  // Rule 14: Attendees can only access their own registrations
  async getMyRegistrations(userId: string): Promise<Registration[]> {
    initializeDatabase();
    const events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);

    const userRegs = registrations.filter(r => r.user_id === userId);

    return userRegs
      .map(reg => ({
        ...reg,
        event: events.find(e => e.id === reg.event_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Admin: Get attendees for an event
  // Rule 13 & attendee private data protection: Attendee private information must never be visible to other attendees or public users.
  async getEventAttendees(eventId: string, adminProfile: Profile): Promise<{
    registration: Registration;
    profile: Profile;
  }[]> {
    if (adminProfile.role !== 'ADMIN') {
      throw new Error('Access Denied: Attendee lists are confidential and restricted to administrators.');
    }

    initializeDatabase();
    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);

    const eventRegs = registrations.filter(r => r.event_id === eventId);

    return eventRegs.map(reg => {
      const prof = profiles.find(p => p.id === reg.user_id) || {
        id: reg.user_id,
        full_name: 'Attendee (' + reg.user_id.substring(0, 6) + ')',
        email: 'user-' + reg.user_id.substring(0, 6) + '@example.com',
        role: 'ATTENDEE' as UserRole,
        created_at: reg.created_at,
        updated_at: reg.updated_at,
      };
      return {
        registration: reg,
        profile: prof,
      };
    });
  },

  // ----------------------------------------------------
  // STATISTICS & REPORTS
  // ----------------------------------------------------
  async getDashboardStats(): Promise<DashboardStats> {
    initializeDatabase();
    const events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);

    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.status === 'Published').length;
    const activeRegistrations = registrations.filter(r => r.status === 'active').length;
    const cancelledRegistrations = registrations.filter(r => r.status === 'cancelled').length;
    const totalRegistrations = registrations.length;

    const totalCapacity = events.reduce((acc, ev) => acc + (ev.status === 'Published' ? ev.capacity : 0), 0);
    const availableSeats = Math.max(0, totalCapacity - activeRegistrations);
    const occupancyRate = totalCapacity > 0 ? Math.round((activeRegistrations / totalCapacity) * 100) : 0;

    return {
      totalEvents,
      publishedEvents,
      totalRegistrations,
      activeRegistrations,
      cancelledRegistrations,
      availableSeats,
      totalCapacity,
      occupancyRate,
    };
  },

  async getAllProfiles(adminProfile: Profile): Promise<Profile[]> {
    if (adminProfile.role !== 'ADMIN') {
      throw new Error('Access denied: Admin role required.');
    }
    initializeDatabase();
    return getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  async getAllRegistrations(adminProfile: Profile): Promise<Registration[]> {
    if (adminProfile.role !== 'ADMIN') {
      throw new Error('Access denied: Admin role required.');
    }
    initializeDatabase();
    const events = getLocal<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const registrations = getLocal<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);

    return registrations.map(reg => ({
      ...reg,
      event: events.find(e => e.id === reg.event_id),
      profile: profiles.find(p => p.id === reg.user_id),
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  resetToSeedData(): void {
    resetDatabaseToDefault();
  },

  // Save / update profiles in store
  saveProfile(profile: Profile): void {
    initializeDatabase();
    const profiles = getLocal<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex(p => p.id === profile.id || p.email === profile.email);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...profile, updated_at: new Date().toISOString() };
    } else {
      profiles.push(profile);
    }
    setLocal(STORAGE_KEYS.PROFILES, profiles);
  }
};
