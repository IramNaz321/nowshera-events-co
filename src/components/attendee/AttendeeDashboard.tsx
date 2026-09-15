import React from 'react';
import { 
  Ticket, 
  Calendar, 
  CalendarCheck, 
  Compass, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  QrCode,
  AlertCircle
} from 'lucide-react';
import { EventWithStats, Registration } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { EventCard } from '../common/EventCard';

interface AttendeeDashboardProps {
  myRegistrations: Registration[];
  availableEvents: EventWithStats[];
  onNavigate: (view: string, params?: { eventId?: string }) => void;
  onViewDetails: (eventId: string) => void;
  onCancelRegistration: (registrationId: string) => void;
}

export const AttendeeDashboard: React.FC<AttendeeDashboardProps> = ({
  myRegistrations = [],
  availableEvents = [],
  onNavigate,
  onViewDetails,
  onCancelRegistration,
}) => {
  const { user } = useAuth();
  const safeRegistrations = Array.isArray(myRegistrations) ? myRegistrations : [];
  const safeAvailableEvents = Array.isArray(availableEvents) ? availableEvents : [];

  const activeRegistrations = safeRegistrations.filter(r => r.status === 'active');
  const upcomingEventsCount = safeAvailableEvents.length;

  // Next active event for the banner
  const nextRegistration = activeRegistrations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#F5F3FF] via-white to-[#FAF9FF] p-6 sm:p-8 rounded-3xl border border-purple-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Attendee Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-heading">
            Welcome back 👋 {user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
            Track your reserved seats, view personalized digital tickets, and discover new community workshops across Nowshera.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="attendee-explore-btn"
            onClick={() => onNavigate('events')}
            className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Events</span>
          </button>
          <button
            id="attendee-view-passes-btn"
            onClick={() => onNavigate('my-registrations')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-[#6D28D9] border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Ticket className="w-4 h-4" />
            <span>My Passes</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Upcoming Registrations */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Upcoming Registrations
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-1 font-heading">
              {activeRegistrations.length}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Events you are scheduled to attend
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6D28D9] flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Registrations */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Active Registrations
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1 font-heading">
              {activeRegistrations.length}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Confirmed seats with QR pass
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Events Available */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Events Available
            </div>
            <div className="text-3xl font-extrabold text-[#6D28D9] mt-1 font-heading">
              {upcomingEventsCount}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Open for registration in Nowshera
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#6D28D9] flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Featured Next Event Ticket Highlight */}
      {nextRegistration && nextRegistration.event && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-950/20 border border-purple-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Your Next Confirmed Event
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading">
                {nextRegistration.event.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-purple-200">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {nextRegistration.event.event_date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {nextRegistration.event.event_time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {nextRegistration.event.location}
                </span>
              </div>
            </div>

            {/* Simulated pass card */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
              <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-gray-900" />
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-white uppercase tracking-wider text-[10px]">Pass Confirmed</div>
                <div className="text-[11px] text-purple-200">Reg: {nextRegistration.id}</div>
                <button
                  onClick={() => onViewDetails(nextRegistration.event_id)}
                  className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1 pt-1"
                >
                  View Details &amp; Pass <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Upcoming Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-heading">
              Your Upcoming Events
            </h2>
            <p className="text-xs text-gray-500">
              Conferences and workshops you have registered to attend.
            </p>
          </div>
          <button
            onClick={() => onNavigate('my-registrations')}
            className="text-xs font-bold text-[#6D28D9] hover:underline flex items-center gap-1"
          >
            <span>View All Registrations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeRegistrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRegistrations.map((reg) => {
              if (!reg.event) return null;
              // Format as EventWithStats
              const evStats: EventWithStats = {
                ...reg.event,
                registered_count: 0,
                available_seats: 1,
                is_registered: true,
                user_registration_id: reg.id,
                user_registration_status: reg.status,
              };

              return (
                <EventCard
                  key={reg.id}
                  event={evStats}
                  onViewDetails={onViewDetails}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-purple-100 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6D28D9] flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">You have no active registrations yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Browse available workshops and seminars in Nowshera and reserve your seat instantly.
            </p>
            <button
              onClick={() => onNavigate('events')}
              className="px-4 py-2 bg-[#6D28D9] text-white rounded-xl text-xs font-bold hover:bg-[#5B21B6]"
            >
              Explore Upcoming Events
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
