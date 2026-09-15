import React, { useState } from 'react';
import { 
  Users, 
  X, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Mail, 
  UserCheck, 
  Printer,
  ShieldAlert
} from 'lucide-react';
import { EventItem, Registration } from '../../types/database';
import { useAuth } from '../../context/AuthContext';

interface EventAttendeesModalProps {
  event: EventItem | null;
  attendees: Registration[];
  isOpen: boolean;
  onClose: () => void;
}

export const EventAttendeesModal: React.FC<EventAttendeesModalProps> = ({
  event,
  attendees,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  if (!isOpen || !event) return null;

  // Protect view - Admin only (Rule 14)
  if (user?.role !== 'ADMIN') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">Access Denied (Rule 14)</h3>
          <p className="text-xs text-gray-500">
            Attendees are strictly prohibited from viewing private registration lists of other attendees.
          </p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  // Filter list
  const filteredAttendees = attendees.filter((reg) => {
    if (statusFilter !== 'all' && reg.status !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const name = reg.profile?.full_name?.toLowerCase() || '';
      const email = reg.profile?.email?.toLowerCase() || '';
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  const activeAttendees = attendees.filter(a => a.status === 'active');
  const cancelledAttendees = attendees.filter(a => a.status === 'cancelled');

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Registration ID', 'Full Name', 'Email', 'Status', 'Registered At'];
    const rows = attendees.map(a => [
      a.id,
      `"${a.profile?.full_name || 'Attendee'}"`,
      `"${a.profile?.email || 'N/A'}"`,
      a.status,
      new Date(a.created_at).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Attendees_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="event-attendees-modal"
        className="bg-white rounded-3xl shadow-2xl border border-purple-100 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#F5F3FF] to-white border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Event Registration Roster (Admin Only)
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-heading line-clamp-1">
              {event.title}
            </h3>
            <div className="text-xs text-gray-500 flex items-center gap-3">
              <span>{event.event_date} at {event.event_time}</span>
              <span>•</span>
              <span>{event.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-attendees-csv-btn"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D28D9] text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl"
              title="Print Roster"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats & Search Bar */}
        <div className="p-4 bg-purple-50/40 border-b border-purple-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-700">Capacity: {event.capacity}</span>
            <span className="text-gray-300">|</span>
            <span className="text-emerald-700 font-bold">Active: {activeAttendees.length}</span>
            <span className="text-gray-300">|</span>
            <span className="text-rose-600 font-medium">Cancelled: {cancelledAttendees.length}</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#6D28D9] font-bold">Available: {Math.max(0, event.capacity - activeAttendees.length)}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search attendee by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#A78BFA]"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-gray-200 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1 p-4">
          {filteredAttendees.length > 0 ? (
            <div className="rounded-2xl border border-purple-100 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9FF] border-b border-purple-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Attendee Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Pass Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {filteredAttendees.map((reg) => {
                    const isActive = reg.status === 'active';
                    return (
                      <tr key={reg.id} className="hover:bg-purple-50/30">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {reg.profile?.full_name || 'Attendee'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {reg.profile?.email || 'user@example.com'}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(reg.created_at).toLocaleDateString()} at {new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Confirmed Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-400 text-[11px]">
                          {reg.id.substring(0, 10)}...
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              No registered attendees found matching search criteria.
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-6 py-3 bg-gray-50 border-t border-purple-100 text-[11px] text-gray-500 flex items-center justify-between">
          <span>Confidential Attendee Records • Rule 14 Protected</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#6D28D9] text-white rounded-xl text-xs font-bold hover:bg-[#5B21B6]"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
