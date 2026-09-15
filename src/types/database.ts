export type UserRole = 'ADMIN' | 'ATTENDEE';

export type EventStatus = 'Draft' | 'Published' | 'Completed' | 'Cancelled';

export type RegistrationStatus = 'active' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:mm
  location: string;
  capacity: number;
  status: EventStatus;
  category?: 'Workshop' | 'Seminar' | 'Conference' | 'Community' | 'Hackathon';
  image_url?: string;
  speaker_name?: string;
  speaker_role?: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
  // Joined fields for UI convenience
  event?: EventItem;
  profile?: Profile;
}

export interface EventWithStats extends EventItem {
  registered_count: number;
  available_seats: number;
  is_registered?: boolean;
  user_registration_id?: string;
  user_registration_status?: RegistrationStatus;
}

export interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  totalRegistrations: number;
  activeRegistrations: number;
  cancelledRegistrations: number;
  availableSeats: number;
  totalCapacity: number;
  occupancyRate: number;
}
