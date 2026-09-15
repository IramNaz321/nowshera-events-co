import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  ArrowUpDown, 
  X, 
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';
import { EventWithStats } from '../../types/database';
import { EventCard } from '../common/EventCard';

interface EventDiscoveryPageProps {
  events: EventWithStats[];
  loading: boolean;
  onViewDetails: (eventId: string) => void;
  onRegister: (eventId: string) => void;
  registeringEventId: string | null;
}

export const EventDiscoveryPage: React.FC<EventDiscoveryPageProps> = ({
  events = [],
  loading,
  onViewDetails,
  onRegister,
  registeringEventId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'registered'>('all');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'seats_desc'>('date_asc');

  const categories = ['All', 'Workshop', 'Seminar', 'Conference', 'Hackathon', 'Community'];
  const safeEvents = Array.isArray(events) ? events : [];

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return safeEvents
      .filter((ev) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = ev.title.toLowerCase().includes(q);
          const matchesDesc = ev.description.toLowerCase().includes(q);
          const matchesLoc = ev.location.toLowerCase().includes(q);
          const matchesSpeaker = ev.speaker_name?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesSpeaker) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
          return false;
        }

        // Availability filter
        if (availabilityFilter === 'available' && ev.available_seats <= 0) {
          return false;
        }
        if (availabilityFilter === 'registered' && !ev.is_registered) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_asc') {
          return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        }
        if (sortBy === 'date_desc') {
          return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
        }
        if (sortBy === 'seats_desc') {
          return b.available_seats - a.available_seats;
        }
        return 0;
      });
  }, [events, searchQuery, selectedCategory, availabilityFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F3FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Upcoming Events
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse published workshops, seminars and conferences in Nowshera. Seats are updated in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-3 py-2 rounded-xl border border-purple-100 shadow-2xs">
          <Layers className="w-4 h-4 text-[#6D28D9]" />
          <span>Showing <strong className="text-gray-900">{filteredEvents.length}</strong> of {events.length} events</span>
        </div>
      </div>

      {/* Search & Filters Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100/80 shadow-xs space-y-4">
        
        {/* Top row: Search input & sorting */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="events-search-input"
              type="text"
              placeholder="Search by event title, speaker, topic, or venue in Nowshera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                id="sort-events-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-700 hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] cursor-pointer"
              >
                <option value="date_asc">Earliest Date First</option>
                <option value="date_desc">Latest Date First</option>
                <option value="seats_desc">Most Seats Available</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Quick availability filter */}
            <select
              id="filter-availability-select"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="appearance-none px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-700 hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] cursor-pointer"
            >
              <option value="all">All Seats Status</option>
              <option value="available">Seats Available Only</option>
              <option value="registered">My Registered Events</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-cat-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#6D28D9] text-white shadow-xs'
                  : 'bg-purple-50/70 text-gray-600 hover:bg-purple-100 hover:text-[#6D28D9]'
              }`}
            >
              {cat}
            </button>
          ))}

          {(selectedCategory !== 'All' || searchQuery || availabilityFilter !== 'all') && (
            <button
              id="reset-all-filters-btn"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setAvailabilityFilter('all');
              }}
              className="ml-auto text-xs font-bold text-red-600 hover:text-red-700 hover:underline shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-purple-100 p-4 space-y-4 animate-pulse">
              <div className="h-48 bg-purple-100/60 rounded-xl"></div>
              <div className="h-4 bg-purple-100/60 rounded w-3/4"></div>
              <div className="h-3 bg-purple-100/40 rounded w-full"></div>
              <div className="h-3 bg-purple-100/40 rounded w-5/6"></div>
              <div className="pt-2 flex justify-between">
                <div className="h-8 bg-purple-100/60 rounded w-1/2"></div>
                <div className="h-8 bg-purple-100/60 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        /* Event Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={onViewDetails}
              onRegister={onRegister}
              isRegistering={registeringEventId === event.id}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div 
          id="events-empty-state"
          className="bg-white rounded-3xl border border-purple-100/80 p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6D28D9] flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-heading">
            No matching events found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            We couldn't find any events matching your criteria. Try adjusting your search keywords or clearing applied filters.
          </p>
          <button
            id="empty-state-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setAvailabilityFilter('all');
            }}
            className="px-5 py-2 rounded-xl bg-[#6D28D9] text-white text-xs font-bold shadow-md hover:bg-[#5B21B6] transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
};
