import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  X, 
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { EventItem, EventStatus, EventWithStats } from '../../types/database';
import { useAuth } from '../../context/AuthContext';

interface AdminEventManagementProps {
  events: EventWithStats[];
  onCreateEvent: (eventData: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateEvent: (id: string, updates: Partial<EventItem>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onViewEventDetails: (id: string) => void;
  onViewAttendees: (id: string) => void;
}

export const AdminEventManagement: React.FC<AdminEventManagementProps> = ({
  events = [],
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onViewEventDetails,
  onViewAttendees,
}) => {
  const { user } = useAuth();
  const safeEvents = Array.isArray(events) ? events : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithStats | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('10:00');
  const [formLocation, setFormLocation] = useState('');
  const [formCapacity, setFormCapacity] = useState<number>(50);
  const [formStatus, setFormStatus] = useState<EventStatus>('Draft');
  const [formCategory, setFormCategory] = useState<'Workshop' | 'Seminar' | 'Conference' | 'Community' | 'Hackathon'>('Workshop');
  const [formSpeakerName, setFormSpeakerName] = useState('');
  const [formSpeakerRole, setFormSpeakerRole] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Reset & open create modal
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]); // 2 weeks from now
    setFormTime('10:00');
    setFormLocation('Nowshera Cantonment Auditorium, Mall Road');
    setFormCapacity(50);
    setFormStatus('Draft');
    setFormCategory('Workshop');
    setFormSpeakerName('');
    setFormSpeakerRole('');
    setFormImageUrl('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (event: EventWithStats) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description);
    setFormDate(event.event_date);
    setFormTime(event.event_time);
    setFormLocation(event.location);
    setFormCapacity(event.capacity);
    setFormStatus(event.status);
    setFormCategory(event.category || 'Workshop');
    setFormSpeakerName(event.speaker_name || '');
    setFormSpeakerRole(event.speaker_role || '');
    setFormImageUrl(event.image_url || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate inputs
    if (!formTitle.trim()) {
      setFormError('Event title is required.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Event description is required.');
      return;
    }
    if (!formDate) {
      setFormError('Event date is required.');
      return;
    }
    if (!formLocation.trim()) {
      setFormError('Event location is required.');
      return;
    }

    // Rule 11: Capacity must be a positive whole number
    const cap = Number(formCapacity);
    if (!Number.isInteger(cap) || cap <= 0) {
      setFormError('Rule 11: Capacity must be a positive whole number greater than 0.');
      return;
    }

    // Rule 12: Capacity cannot be reduced below active registrations
    if (editingEvent && cap < editingEvent.registered_count) {
      setFormError(
        `Rule 12 Violation: Capacity (${cap}) cannot be less than active registrations (${editingEvent.registered_count}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await onUpdateEvent(editingEvent.id, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          event_date: formDate,
          event_time: formTime,
          location: formLocation.trim(),
          capacity: cap,
          status: formStatus,
          category: formCategory,
          speaker_name: formSpeakerName.trim() || undefined,
          speaker_role: formSpeakerRole.trim() || undefined,
          image_url: formImageUrl.trim() || undefined,
        });
      } else {
        await onCreateEvent({
          title: formTitle.trim(),
          description: formDescription.trim(),
          event_date: formDate,
          event_time: formTime,
          location: formLocation.trim(),
          capacity: cap,
          status: formStatus,
          category: formCategory,
          speaker_name: formSpeakerName.trim() || undefined,
          speaker_role: formSpeakerRole.trim() || undefined,
          image_url: formImageUrl.trim() || undefined,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick status toggle actions
  const handleQuickStatusChange = async (event: EventWithStats, newStatus: EventStatus) => {
    try {
      await onUpdateEvent(event.id, { status: newStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to update event status');
    }
  };

  // Filter events
  const filteredEvents = safeEvents.filter((ev) => {
    if (statusFilter !== 'All' && ev.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        (ev.speaker_name && ev.speaker_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F3FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            Full Administration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Event Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create new sessions, modify capacity, publish drafts, inspect attendee lists, or complete concluded events.
          </p>
        </div>

        <button
          id="btn-create-event-action"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['All', 'Draft', 'Published', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              id={`filter-status-${st.toLowerCase()}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#6D28D9] text-white'
                  : 'bg-purple-50 text-gray-600 hover:bg-purple-100 hover:text-[#6D28D9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Professional Event Management Table */}
      <div className="bg-white rounded-3xl border border-purple-100/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9FF] border-b border-purple-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Event</th>
                <th className="py-4 px-4">Date &amp; Time</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-3 text-center">Capacity</th>
                <th className="py-4 px-3 text-center">Registrations</th>
                <th className="py-4 px-3 text-center">Available</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-xs">
              {filteredEvents.map((ev) => {
                return (
                  <tr 
                    key={ev.id} 
                    id={`admin-event-row-${ev.id}`}
                    className="hover:bg-purple-50/25 transition-colors"
                  >
                    {/* Event Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&auto=format&fit=crop&q=80'}
                          alt={ev.title}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover border border-purple-100 shrink-0"
                        />
                        <div>
                          <div 
                            onClick={() => onViewEventDetails(ev.id)}
                            className="font-bold text-gray-900 hover:text-[#6D28D9] cursor-pointer line-clamp-1 max-w-[220px]"
                          >
                            {ev.title}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {ev.category} • {ev.speaker_name ? `Speaker: ${ev.speaker_name}` : 'Nowshera Community'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date Column */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{ev.event_date}</div>
                      <div className="text-[10px] text-gray-400">{ev.event_time} PKT</div>
                    </td>

                    {/* Location Column */}
                    <td className="py-4 px-4 text-gray-600 max-w-[160px]">
                      <div className="line-clamp-2">{ev.location}</div>
                    </td>

                    {/* Capacity Column */}
                    <td className="py-4 px-3 text-center font-bold text-gray-700">
                      {ev.capacity}
                    </td>

                    {/* Registrations Column */}
                    <td className="py-4 px-3 text-center">
                      <span className="font-extrabold text-[#6D28D9]">{ev.registered_count}</span>
                    </td>

                    {/* Available Seats Column */}
                    <td className="py-4 px-3 text-center">
                      <span className={`font-bold ${ev.available_seats <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {ev.available_seats}
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ev.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.status === 'Draft'
                          ? 'bg-amber-100 text-amber-800'
                          : ev.status === 'Completed'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ev.status}
                      </span>
                    </td>

                    {/* Actions Column (View, Edit, Publish, Complete, Cancel, Delete, Attendees) */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Attendees button */}
                        <button
                          id={`btn-attendees-${ev.id}`}
                          onClick={() => onViewAttendees(ev.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#6D28D9] font-semibold text-[11px] transition-colors flex items-center gap-1"
                          title="View Registered Attendees"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Attendees ({ev.registered_count})</span>
                        </button>

                        {/* Quick Publish / Unpublish */}
                        {ev.status === 'Draft' && (
                          <button
                            id={`btn-publish-${ev.id}`}
                            onClick={() => handleQuickStatusChange(ev, 'Published')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Publish Event"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {ev.status === 'Published' && (
                          <button
                            id={`btn-complete-${ev.id}`}
                            onClick={() => handleQuickStatusChange(ev, 'Completed')}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Mark as Completed"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {ev.status === 'Published' && (
                          <button
                            id={`btn-cancel-event-${ev.id}`}
                            onClick={() => handleQuickStatusChange(ev, 'Cancelled')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Cancel Event"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          id={`btn-edit-${ev.id}`}
                          onClick={() => handleOpenEdit(ev)}
                          className="p-1.5 text-gray-600 hover:text-[#6D28D9] hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          id={`btn-delete-${ev.id}`}
                          onClick={() => setDeletingEventId(ev.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Form for Creating & Editing Events */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            id="event-form-modal"
            className="bg-white rounded-3xl shadow-2xl border border-purple-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#F5F3FF] to-white border-b border-purple-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-heading">
                  {editingEvent ? 'Edit Event Details' : 'Create New Event'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingEvent ? 'Update schedule, location, capacity, or lifecycle status' : 'Add a workshop, seminar, conference or community gathering'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  id="form-event-title"
                  type="text"
                  placeholder="e.g. Nowshera Cybersecurity & AI Hands-On Workshop"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>

              {/* Category & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    id="form-event-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] bg-white cursor-pointer"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Conference">Conference</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Community">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    id="form-event-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] bg-white cursor-pointer"
                  >
                    <option value="Draft">Draft (Hidden from attendees)</option>
                    <option value="Published">Published (Open for registration)</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    id="form-event-date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Time (HH:mm) *
                  </label>
                  <input
                    id="form-event-time"
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Location (Venue in Nowshera) *
                </label>
                <input
                  id="form-event-location"
                  type="text"
                  placeholder="e.g. Nowshera Club &amp; Technology Hall, GT Road"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>

              {/* Capacity (Rule 11 & 12 Enforced) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Total Capacity (Seats) *
                </label>
                <input
                  id="form-event-capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(parseInt(e.target.value, 10) || 0)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
                <div className="mt-1 text-[11px] text-gray-500">
                  Rule 11: Positive whole integer. {editingEvent && (
                    <span className="font-semibold text-purple-700">
                      Rule 12: Cannot be lower than active registrations ({editingEvent.registered_count}).
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Detailed Description *
                </label>
                <textarea
                  id="form-event-description"
                  rows={4}
                  placeholder="Explain event outcomes, agenda, prerequisites and target audience in Nowshera..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                ></textarea>
              </div>

              {/* Speaker Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Keynote Speaker / Lead
                  </label>
                  <input
                    id="form-event-speaker-name"
                    type="text"
                    placeholder="e.g. Dr. Asadullah Khan"
                    value={formSpeakerName}
                    onChange={(e) => setFormSpeakerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Speaker Designation / Org
                  </label>
                  <input
                    id="form-event-speaker-role"
                    type="text"
                    placeholder="e.g. Lead AI Engineer, KPK Tech Board"
                    value={formSpeakerRole}
                    onChange={(e) => setFormSpeakerRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Banner Image URL (Unsplash or direct asset)
                </label>
                <input
                  id="form-event-image-url"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-purple-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="submit-event-form-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-md transition-all"
                >
                  {isSubmitting ? 'Saving Event...' : editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 p-6 max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900 font-heading">
                Delete Event Permanently?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This action cannot be undone. All active and cancelled registration records for this event will also be removed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeletingEventId(null)}
                className="py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-event-btn"
                onClick={async () => {
                  await onDeleteEvent(deletingEventId);
                  setDeletingEventId(null);
                }}
                className="py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
