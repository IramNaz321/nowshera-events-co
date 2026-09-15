import React from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { EventWithStats } from '../../types/database';

interface EventCardProps {
  event: EventWithStats;
  onViewDetails: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
  isRegistering?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onRegister,
  isRegistering = false,
}) => {
  const isFull = event.available_seats <= 0;
  const isRegistered = Boolean(event.is_registered);
  const occupancyPercentage = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));

  // Format date nicely: "Thu, Oct 15, 2026"
  const formattedDate = new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getCategoryBadgeColor = (category?: string) => {
    switch (category) {
      case 'Hackathon':
        return 'bg-purple-100 text-[#6D28D9] border-purple-200';
      case 'Workshop':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Seminar':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Conference':
        return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      id={`event-card-${event.id}`}
      className="group bg-white rounded-2xl border border-purple-100/90 shadow-xs hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Event Image / Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-purple-50">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {event.category && (
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border backdrop-blur-md shadow-xs ${getCategoryBadgeColor(event.category)}`}>
              {event.category}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          {isRegistered ? (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500 text-white shadow-md flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Registered
            </span>
          ) : isFull ? (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-500 text-white shadow-md flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Sold Out
            </span>
          ) : event.available_seats <= 5 ? (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500 text-white shadow-md">
              Only {event.available_seats} Left
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 backdrop-blur-md text-purple-900 shadow-md">
              {event.available_seats} Seats Available
            </span>
          )}
        </div>

        {/* Date on bottom of image */}
        <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-semibold drop-shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-purple-300" />
          <span>{formattedDate}</span>
          <span className="mx-1 opacity-60">•</span>
          <Clock className="w-3.5 h-3.5 text-purple-300" />
          <span>{event.event_time}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 
            onClick={() => onViewDetails(event.id)}
            className="text-base font-bold text-gray-900 group-hover:text-[#6D28D9] transition-colors line-clamp-2 cursor-pointer font-heading leading-snug"
          >
            {event.title}
          </h3>

          <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-3 flex items-start gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-[#6D28D9] shrink-0 mt-0.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Capacity Meter */}
        <div className="pt-2 border-t border-purple-50 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-medium text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#6D28D9]" />
              Capacity: <span className="font-semibold text-gray-900">{event.registered_count}/{event.capacity}</span>
            </span>
            <span className={event.available_seats <= 5 ? 'text-amber-600 font-bold' : 'text-purple-700 font-semibold'}>
              {event.available_seats} available
            </span>
          </div>
          <div className="w-full bg-purple-50 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercentage >= 100
                  ? 'bg-rose-500'
                  : occupancyPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-[#A78BFA] to-[#6D28D9]'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id={`btn-view-details-${event.id}`}
            onClick={() => onViewDetails(event.id)}
            className="w-full py-2.5 px-3 text-xs font-semibold text-gray-700 bg-purple-50/70 hover:bg-purple-100 hover:text-[#6D28D9] rounded-xl transition-all flex items-center justify-center gap-1"
          >
            <span>View Details</span>
          </button>

          {isRegistered ? (
            <button
              disabled
              className="w-full py-2.5 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl flex items-center justify-center gap-1 cursor-default"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registered</span>
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full py-2.5 px-3 text-xs font-semibold text-gray-400 bg-gray-100 rounded-xl flex items-center justify-center gap-1 cursor-not-allowed"
            >
              <span>Sold Out</span>
            </button>
          ) : onRegister ? (
            <button
              id={`btn-register-now-${event.id}`}
              onClick={() => onRegister(event.id)}
              disabled={isRegistering}
              className="w-full py-2.5 px-3 text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-98 rounded-xl shadow-xs shadow-purple-500/20 transition-all flex items-center justify-center gap-1"
            >
              {isRegistering ? (
                <span>Reserving...</span>
              ) : (
                <>
                  <span>Register Now</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => onViewDetails(event.id)}
              className="w-full py-2.5 px-3 text-xs font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <span>Register</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
