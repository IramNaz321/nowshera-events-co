import React from 'react';
import { 
  Calendar, 
  Users, 
  Ticket, 
  BarChart3, 
  PlusCircle, 
  CalendarDays, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { DashboardStats, EventWithStats, Registration } from '../../types/database';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
  stats: DashboardStats;
  events: EventWithStats[];
  allRegistrations: Registration[];
  onNavigate: (view: string, params?: { eventId?: string }) => void;
  onCreateEventClick: () => void;
  onViewAttendees: (eventId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  events = [],
  allRegistrations = [],
  onNavigate,
  onCreateEventClick,
  onViewAttendees,
}) => {
  const { user } = useAuth();
  const safeEvents = Array.isArray(events) ? events : [];
  const safeRegistrations = Array.isArray(allRegistrations) ? allRegistrations : [];

  // Protect admin view
  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Administrator Access Required</h2>
        <p className="text-xs text-gray-500">
          This dashboard contains restricted event management features. Please switch to the Admin role using the top navigation switcher.
        </p>
      </div>
    );
  }

  // Recent registrations (up to 5)
  const recentRegistrations = [...safeRegistrations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Group events by status
  const draftCount = safeEvents.filter(e => e.status === 'Draft').length;
  const completedCount = safeEvents.filter(e => e.status === 'Completed').length;
  const cancelledCount = safeEvents.filter(e => e.status === 'Cancelled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F5F3FF] via-white to-[#FAF9FF] p-6 sm:p-8 rounded-3xl border border-purple-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-[#6D28D9]" />
            Administrative Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-heading">
            Event Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
            Real-time administrative control of Nowshera events, capacity management, attendee check-ins, and performance reporting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="admin-create-event-top-btn"
            onClick={onCreateEventClick}
            className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
          <button
            onClick={() => onNavigate('admin-events')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-[#6D28D9] border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Manage All Events</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards (As required in prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Events */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Events
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-1 font-heading">
              {stats.totalEvents}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              All hosted &amp; planned sessions
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6D28D9] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Published Events */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Published Events
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 mt-1 font-heading">
              {stats.publishedEvents}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Live and open for booking
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Registrations */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Registrations
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1 font-heading">
              {stats.totalRegistrations}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {stats.activeRegistrations} active • {stats.cancelledRegistrations} cancelled
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Available Seats */}
        <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Available Seats
            </div>
            <div className="text-3xl font-extrabold text-[#6D28D9] mt-1 font-heading">
              {stats.availableSeats}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {stats.occupancyRate}% overall occupancy
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-[#6D28D9] flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Visual Summaries & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Event Performance & Capacity Utilization */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-purple-100/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-heading">
                Event Performance &amp; Capacity Utilization
              </h2>
              <p className="text-xs text-gray-500">
                Live registration count vs total hall capacity per event.
              </p>
            </div>
            <button
              onClick={() => onNavigate('admin-reports')}
              className="text-xs font-bold text-[#6D28D9] hover:underline flex items-center gap-1"
            >
              <span>Full Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bars for each event */}
          <div className="space-y-4">
            {safeEvents.slice(0, 5).map((ev) => {
              const pct = ev.capacity > 0 ? Math.round((ev.registered_count / ev.capacity) * 100) : 0;
              return (
                <div key={ev.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-800 line-clamp-1 max-w-[280px]">
                      {ev.title}
                    </span>
                    <span className="text-gray-500 font-medium">
                      <strong className="text-gray-900">{ev.registered_count}</strong> / {ev.capacity} seats ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-[#A78BFA] to-[#6D28D9]'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breakdown status chips */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-purple-50 text-center">
            <div className="p-3 bg-purple-50/50 rounded-xl">
              <div className="text-[11px] text-gray-500">Drafts</div>
              <div className="text-base font-bold text-gray-900 font-heading">{draftCount}</div>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-xl">
              <div className="text-[11px] text-gray-500">Completed</div>
              <div className="text-base font-bold text-emerald-700 font-heading">{completedCount}</div>
            </div>
            <div className="p-3 bg-rose-50/50 rounded-xl">
              <div className="text-[11px] text-gray-500">Cancelled</div>
              <div className="text-base font-bold text-rose-700 font-heading">{cancelledCount}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Registrations Feed */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-purple-100/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-heading">
                Recent Registrations
              </h2>
              <p className="text-xs text-gray-500">
                Latest attendee sign-ups across all events.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#6D28D9]">
              Live Stream
            </span>
          </div>

          <div className="divide-y divide-purple-50">
            {recentRegistrations.length > 0 ? (
              recentRegistrations.map((reg) => {
                const ev = events.find(e => e.id === reg.event_id);
                return (
                  <div key={reg.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-gray-900 line-clamp-1">
                        {reg.profile?.full_name || 'Attendee ' + reg.user_id.substring(0, 6)}
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-1">
                        {ev?.title || 'Event ' + reg.event_id}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(reg.created_at).toLocaleDateString()} at {new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {reg.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No registrations recorded yet.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('admin-events')}
            className="w-full py-2.5 rounded-xl border border-purple-200 hover:bg-purple-50 text-[#6D28D9] text-xs font-bold transition-all text-center"
          >
            View Event Tables &amp; Manage Attendees
          </button>
        </div>

      </div>

    </div>
  );
};
