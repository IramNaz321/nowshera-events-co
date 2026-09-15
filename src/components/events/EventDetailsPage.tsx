import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Share2, 
  Ticket, 
  ShieldCheck, 
  User, 
  QrCode,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { EventWithStats } from '../../types/database';
import { useAuth } from '../../context/AuthContext';

interface EventDetailsPageProps {
  event: EventWithStats | null;
  onBack: () => void;
  onRegister: (eventId: string) => void;
  onCancelRegistration: (registrationId: string) => void;
  isRegistering?: boolean;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  event,
  onBack,
  onRegister,
  onCancelRegistration,
  isRegistering = false,
}) => {
  const { user } = useAuth();
  const [copiedShare, setCopiedShare] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6D28D9] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Event Not Found</h2>
        <p className="text-sm text-gray-500">The event you are looking for does not exist or has been removed.</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-[#6D28D9] text-white text-xs font-bold"
        >
          Back to Events Catalog
        </button>
      </div>
    );
  }

  const isFull = event.available_seats <= 0;
  const isRegistered = Boolean(event.is_registered);
  const isCancelled = event.status === 'Cancelled';
  const isCompleted = event.status === 'Completed';
  const isDraft = event.status === 'Draft';
  const occupancyPercentage = Math.min(100, Math.round((event.registered_count / event.capacity) * 100));

  const formattedDate = new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & share */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-events"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#6D28D9] transition-colors py-2 px-3 rounded-xl hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upcoming Events</span>
        </button>

        <button
          id="btn-share-event"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:border-purple-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedShare ? 'Link Copied!' : 'Share Event'}</span>
        </button>
      </div>

      {/* Large Event Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-purple-100 bg-gray-900 h-72 sm:h-96">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Category & Status Chips */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {event.category && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6D28D9] text-white shadow-md">
              {event.category}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
            isCancelled 
              ? 'bg-rose-600 text-white' 
              : isCompleted 
              ? 'bg-gray-600 text-white' 
              : isDraft 
              ? 'bg-amber-600 text-white' 
              : 'bg-emerald-600 text-white'
          }`}>
            {event.status}
          </span>
        </div>

        {/* Banner Title & Quick Info */}
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight drop-shadow-md">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-purple-100 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#A78BFA]" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#A78BFA]" />
              {event.event_time} PKT
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#A78BFA]" />
              {event.location}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Reservation Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Description, Speaker, Location details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* About Event */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100/80 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-gray-900 font-heading">
              About This Event
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line font-normal">
              {event.description}
            </p>
          </div>

          {/* Speaker / Facilitator info */}
          {event.speaker_name && (
            <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-heading">
                Keynote Speaker / Session Lead
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6D28D9] flex items-center justify-center font-bold text-base shadow-xs">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900">{event.speaker_name}</div>
                  <div className="text-xs text-[#6D28D9] font-semibold">{event.speaker_role || 'Speaker & Industry Expert'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Venue & Location Card */}
          <div className="bg-white p-6 rounded-3xl border border-purple-100/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-heading">
              Venue Location &amp; Directions
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6D28D9] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{event.location}</div>
                <div className="text-xs text-gray-500 mt-0.5">Nowshera District, Khyber Pakhtunkhwa, Pakistan</div>
              </div>
            </div>
            <div className="p-3 bg-[#FAF9FF] rounded-xl border border-purple-100 text-xs text-gray-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6D28D9] shrink-0" />
              <span>Free designated parking and wheelchair-accessible auditorium available at venue.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Reservation Card with Business Rules Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border-2 border-purple-100 shadow-lg shadow-purple-500/5 space-y-6 sticky top-24">
            
            {/* Header / Capacity stats */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Seat Availability
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-gray-900 font-heading">
                  {event.available_seats}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  of {event.capacity} total seats left
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
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
              <div className="mt-2 flex justify-between text-[11px] text-gray-500 font-medium">
                <span>{event.registered_count} booked</span>
                <span>{occupancyPercentage}% filled</span>
              </div>
            </div>

            <div className="border-t border-purple-50 pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Ticket Price:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">FREE PASS</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Admission:</span>
                <span className="font-medium text-gray-800">Confirmed Attendees Only</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Verification:</span>
                <span className="font-medium text-gray-800">Instant Digital QR Pass</span>
              </div>
            </div>

            {/* STATUS NOTICES & BUSINESS RULES MESSAGES */}
            {isRegistered ? (
              /* Already Registered State */
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>You're registered for this event!</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your seat is reserved. Bring your digital pass or confirmation email on the event day.
                </p>

                {/* Simulated E-Ticket QR Snippet */}
                <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-gray-900">{user?.full_name}</div>
                    <div className="text-[10px] text-gray-500">ID: {event.user_registration_id?.substring(0, 12)}...</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Status: Active Pass</div>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg p-1 border border-gray-200 flex items-center justify-center text-gray-700">
                    <QrCode className="w-10 h-10 text-gray-800" />
                  </div>
                </div>

                {/* Cancel Registration Option */}
                {showCancelConfirm ? (
                  <div className="pt-2 border-t border-emerald-200 space-y-2">
                    <p className="text-xs text-rose-700 font-semibold">
                      Are you sure you want to cancel your seat? This will immediately free up the seat for another attendee.
                    </p>
                    <div className="flex gap-2">
                      <button
                        id="confirm-cancel-reg-btn"
                        onClick={() => {
                          if (event.user_registration_id) {
                            onCancelRegistration(event.user_registration_id);
                            setShowCancelConfirm(false);
                          }
                        }}
                        className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        Yes, Cancel Seat
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="w-full py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                      >
                        Keep Seat
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id="trigger-cancel-seat-btn"
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-100/50 rounded-xl transition-colors"
                  >
                    Cancel My Registration
                  </button>
                )}
              </div>
            ) : isCancelled ? (
              /* Cancelled Event State */
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Event Cancelled</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Registration is closed because this event has been cancelled by the event organizers.
                </p>
              </div>
            ) : isCompleted ? (
              /* Completed Event State */
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>Event Concluded</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This event took place on {formattedDate} and is now completed.
                </p>
              </div>
            ) : isFull ? (
              /* Full Capacity State */
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Event is at Full Capacity</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  All {event.capacity} seats for this event have been reserved. If registered attendees cancel, seats will immediately reopen.
                </p>
              </div>
            ) : (
              /* Open for Registration State */
              <div className="space-y-3">
                <button
                  id="btn-reserve-my-seat"
                  onClick={() => onRegister(event.id)}
                  disabled={isRegistering}
                  className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] active:scale-98 text-white font-extrabold text-sm shadow-xl shadow-purple-600/25 hover:shadow-purple-600/40 transition-all flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{isRegistering ? 'Reserving Your Seat...' : 'Reserve My Seat'}</span>
                </button>
                <p className="text-[11px] text-center text-gray-500">
                  Instant registration with instant seat count deduction.
                </p>
              </div>
            )}

            <div className="pt-2 text-center">
              <span className="text-[11px] text-gray-400">
                Rule 1: Limit of 1 active registration per attendee.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
