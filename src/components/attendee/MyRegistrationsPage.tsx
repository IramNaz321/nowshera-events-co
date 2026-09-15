import React, { useState } from 'react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  QrCode, 
  Eye, 
  Download,
  Check,
  X
} from 'lucide-react';
import { Registration } from '../../types/database';
import { useAuth } from '../../context/AuthContext';

interface MyRegistrationsPageProps {
  registrations: Registration[];
  onCancelRegistration: (registrationId: string) => void;
  onViewEventDetails: (eventId: string) => void;
  onNavigateToEvents: () => void;
}

export const MyRegistrationsPage: React.FC<MyRegistrationsPageProps> = ({
  registrations = [],
  onCancelRegistration,
  onViewEventDetails,
  onNavigateToEvents,
}) => {
  const { user } = useAuth();
  const safeRegistrations = Array.isArray(registrations) ? registrations : [];
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [cancellingRegId, setCancellingRegId] = useState<string | null>(null);

  const activeCount = safeRegistrations.filter(r => r.status === 'active').length;
  const cancelledCount = safeRegistrations.filter(r => r.status === 'cancelled').length;

  const handleConfirmCancel = () => {
    if (cancellingRegId) {
      onCancelRegistration(cancellingRegId);
      setCancellingRegId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F3FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" />
            Personal Bookings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            My Registrations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Access your event badges, track attendance status, and manage seat reservations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white border border-purple-100 text-xs font-semibold shadow-2xs">
            <span className="text-gray-500">Active: </span>
            <strong className="text-emerald-600 font-bold">{activeCount}</strong>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-500">Cancelled: </span>
            <strong className="text-rose-600 font-bold">{cancelledCount}</strong>
          </div>
          <button
            onClick={onNavigateToEvents}
            className="px-4 py-2 bg-[#6D28D9] text-white rounded-xl text-xs font-bold hover:bg-[#5B21B6] transition-all flex items-center gap-1.5"
          >
            <span>Book New Event</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Registrations List / Table */}
      {registrations.length > 0 ? (
        <div className="bg-white rounded-3xl border border-purple-100/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9FF] border-b border-purple-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Event</th>
                  <th className="py-4 px-4">Date &amp; Time</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Registered On</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-xs">
                {registrations.map((reg) => {
                  const ev = reg.event;
                  const isActive = reg.status === 'active';
                  const formattedRegDate = new Date(reg.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr 
                      key={reg.id} 
                      className="hover:bg-purple-50/30 transition-colors"
                    >
                      {/* Event Title & Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={ev?.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=80'}
                            alt={ev?.title || 'Event'}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-purple-100 shrink-0"
                          />
                          <div>
                            <div 
                              onClick={() => ev && onViewEventDetails(ev.id)}
                              className="font-bold text-gray-900 hover:text-[#6D28D9] cursor-pointer line-clamp-1 max-w-xs"
                            >
                              {ev?.title || 'Unknown Event'}
                            </div>
                            <div className="text-[10px] text-[#6D28D9] font-semibold mt-0.5">
                              {ev?.category || 'Event'} • Pass ID: {reg.id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800">
                          {ev?.event_date ? new Date(ev.event_date + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          }) : '—'}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {ev?.event_time || '—'}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-gray-600 max-w-[180px]">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#6D28D9] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{ev?.location || 'Nowshera'}</span>
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                        {formattedRegDate}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active Seat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Digital Ticket */}
                          {isActive && (
                            <button
                              id={`view-ticket-btn-${reg.id}`}
                              onClick={() => setSelectedTicket(reg)}
                              className="p-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                              title="View Digital QR Pass"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Details */}
                          {ev && (
                            <button
                              onClick={() => onViewEventDetails(ev.id)}
                              className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                              title="Event Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Cancel Button */}
                          {isActive && (
                            <button
                              id={`cancel-reg-btn-${reg.id}`}
                              onClick={() => setCancellingRegId(reg.id)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-purple-100/80 p-12 text-center space-y-4 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6D28D9] flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-heading">
            No Registrations Found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            You haven't reserved seats for any events yet. Explore upcoming workshops and seminars in Nowshera to get started.
          </p>
          <button
            onClick={onNavigateToEvents}
            className="px-5 py-2.5 rounded-xl bg-[#6D28D9] text-white text-xs font-bold shadow-md hover:bg-[#5B21B6] transition-all"
          >
            Explore Events Now
          </button>
        </div>
      )}

      {/* Confirmation Dialog for Cancellation */}
      {cancellingRegId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 p-6 max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900 font-heading">
                Cancel Your Seat Registration?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                By cancelling, your seat will immediately become available to other attendees on the waitlist.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setCancellingRegId(null)}
                className="py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Keep My Seat
              </button>
              <button
                id="confirm-modal-cancel-btn"
                onClick={handleConfirmCancel}
                className="py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Ticket Pass Modal */}
      {selectedTicket && selectedTicket.event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-purple-200 max-w-sm w-full overflow-hidden">
            
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] p-5 text-white text-center relative">
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-[10px] uppercase font-bold tracking-widest text-purple-200">
                Official Admission Pass
              </div>
              <h3 className="text-lg font-extrabold font-heading mt-1 line-clamp-2">
                {selectedTicket.event.title}
              </h3>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-center py-2">
                <div className="p-3 bg-gray-50 rounded-2xl border-2 border-dashed border-purple-200 flex flex-col items-center gap-2">
                  <QrCode className="w-32 h-32 text-gray-900" />
                  <span className="text-[10px] font-mono text-gray-400">
                    SCAN AT ENTRANCE
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-purple-50 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Attendee:</span>
                  <span className="font-bold text-gray-900">{user?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Email:</span>
                  <span className="font-medium text-gray-700">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Date &amp; Time:</span>
                  <span className="font-semibold text-gray-900">{selectedTicket.event.event_date} at {selectedTicket.event.event_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Location:</span>
                  <span className="font-semibold text-gray-900 text-right line-clamp-1 max-w-[200px]">{selectedTicket.event.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Registration ID:</span>
                  <span className="font-mono text-purple-700">{selectedTicket.id}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2.5 rounded-xl bg-[#6D28D9] text-white font-bold hover:bg-[#5B21B6] transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save Pass</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
