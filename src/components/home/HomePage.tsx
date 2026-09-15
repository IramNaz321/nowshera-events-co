import React from 'react';
import { 
  Compass, 
  Ticket, 
  Users, 
  CalendarCheck, 
  SlidersHorizontal, 
  BarChart3, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  MapPin,
  Calendar,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { EventWithStats } from '../../types/database';
import { EventCard } from '../common/EventCard';
import { useAuth } from '../../context/AuthContext';

interface HomePageProps {
  events?: EventWithStats[];
  featuredEvents?: EventWithStats[];
  onNavigate: (view: string, params?: { eventId?: string }) => void;
  onViewDetails?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  events = [], 
  featuredEvents: propFeaturedEvents, 
  onNavigate, 
  onViewDetails,
  onRegister = () => {} 
}) => {
  const { user } = useAuth();

  const safeEvents = Array.isArray(events) ? events : [];
  // Highlight top 3 upcoming published events
  const featuredEvents = propFeaturedEvents && Array.isArray(propFeaturedEvents)
    ? propFeaturedEvents.slice(0, 3)
    : safeEvents.filter((e) => e.status === 'Published').slice(0, 3);

  const features = [
    {
      id: 'feat-1',
      icon: Compass,
      title: '1. Discover Events',
      desc: 'Find upcoming events easily.',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'feat-2',
      icon: Ticket,
      title: '2. Easy Registration',
      desc: 'Reserve your seat in seconds.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      id: 'feat-3',
      icon: Users,
      title: '3. Live Seat Availability',
      desc: 'Always know how many seats are available.',
      color: 'from-purple-600 to-fuchsia-600',
    },
    {
      id: 'feat-4',
      icon: CalendarCheck,
      title: '4. My Registrations',
      desc: 'Keep all your registrations organized.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'feat-5',
      icon: SlidersHorizontal,
      title: '5. Event Management',
      desc: 'Admins can create and manage events.',
      color: 'from-purple-700 to-indigo-800',
    },
    {
      id: 'feat-6',
      icon: BarChart3,
      title: '6. Smart Reports',
      desc: 'Track registrations and event performance.',
      color: 'from-fuchsia-600 to-purple-700',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-[#F5F3FF] via-[#FAF9FF] to-white border-b border-purple-100/70">
        
        {/* Soft Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#A78BFA]/20 blur-3xl"></div>
          <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-purple-300/15 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-purple-200/80 shadow-2xs text-[#6D28D9] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Nowshera's Premier Event &amp; Workshop Hub</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1F2937] tracking-tight leading-[1.15] font-heading">
                Discover Events. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#A78BFA]">
                  Reserve Your Seat.
                </span> <br />
                Make Memories.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover exciting workshops, seminars and community events around Nowshera. Reserve your seat in seconds and keep all your registrations in one place.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="hero-explore-events-btn"
                  onClick={() => onNavigate('events')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {user ? (
                  <button
                    id="hero-my-registrations-btn"
                    onClick={() => onNavigate('my-registrations')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-purple-50/50 text-[#6D28D9] font-bold text-sm border-2 border-purple-200 hover:border-purple-300 shadow-2xs transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>My Registrations</span>
                  </button>
                ) : (
                  <button
                    id="hero-create-account-btn"
                    onClick={() => onNavigate('register')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-purple-50/50 text-[#6D28D9] font-bold text-sm border-2 border-purple-200 hover:border-purple-300 shadow-2xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>Create Account</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Instant Digital Passes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Live Seat Availability
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Zero Hidden Fees
                </span>
              </div>
            </div>

            {/* Right Illustration & Visual Element */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Visual Backdrop Frame */}
                <div className="relative rounded-3xl bg-gradient-to-tr from-[#A78BFA]/30 to-[#F5F3FF] p-3 shadow-2xl border border-white/60">
                  <div className="overflow-hidden rounded-2xl bg-white shadow-inner">
                    <img 
                      src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80" 
                      alt="Nowshera Events and Conferences"
                      referrerPolicy="no-referrer"
                      className="w-full h-72 sm:h-80 object-cover hover:scale-105 transition-transform duration-700" 
                    />
                    
                    {/* Floating live reservation badge */}
                    <div className="p-4 bg-white/95 backdrop-blur-md border-t border-purple-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">Nowshera AI Summit</div>
                          <div className="text-[10px] text-gray-500">Live Registration Active</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                        95% Booked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating badge 1 */}
                <div className="absolute -bottom-5 -left-4 bg-white rounded-2xl p-3.5 shadow-xl border border-purple-100 flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Fast Booking</div>
                    <div className="text-xs font-extrabold text-gray-800">1-Click Seat Reservation</div>
                  </div>
                </div>

                {/* Floating badge 2 */}
                <div className="hidden sm:flex absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-lg border border-purple-100 items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-bold text-[#6D28D9]">Row Level Security (RLS)</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: EVERYTHING YOU NEED FOR BETTER EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-[#F5F3FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
            Features &amp; Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Everything You Need for Better Events
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            A complete suite tailored for Nowshera community organizers, speakers, and enthusiastic learners.
          </p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                id={feat.id}
                className="group relative bg-white p-7 rounded-2xl border border-purple-100/80 shadow-xs hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-heading group-hover:text-[#6D28D9] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-50 flex items-center text-xs font-semibold text-[#6D28D9] group-hover:translate-x-1 transition-transform">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED EVENTS SECTION */}
      {featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold text-[#6D28D9] uppercase tracking-wider mb-1">
                Upcoming Highlights
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading">
                Explore Popular Nowshera Events
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Handpicked conferences and workshops with open seat registrations.
              </p>
            </div>

            <button
              id="home-view-all-events-btn"
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#6D28D9] text-xs font-bold transition-all shrink-0"
            >
              <span>View All Events ({safeEvents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={(id) => (onViewDetails ? onViewDetails(id) : onNavigate('event-details', { eventId: id }))}
                onRegister={onRegister}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#A78BFA] text-white p-8 sm:p-12 shadow-xl shadow-purple-600/15">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              Host Your Next Event
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold font-heading leading-tight">
              Ready to bring people together in Nowshera?
            </h3>
            <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
              Create and manage conferences, technical workshops, and civic gatherings with automated capacity management and real-time attendee tracking.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                id="cta-admin-dash-btn"
                onClick={() => onNavigate('admin-dashboard')}
                className="px-6 py-3 rounded-xl bg-white text-[#6D28D9] font-bold text-xs shadow-md hover:bg-purple-50 transition-all"
              >
                Open Admin Dashboard
              </button>
              <button
                id="cta-explore-btn"
                onClick={() => onNavigate('events')}
                className="px-6 py-3 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-white font-bold text-xs border border-white/20 transition-all"
              >
                Browse Upcoming Calendar
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
