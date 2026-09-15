import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X,
  Sparkles
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { dataService } from './lib/dataService';
import { EventItem, EventWithStats, Registration, DashboardStats } from './types/database';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DatabaseConfigModal } from './components/common/DatabaseConfigModal';

// Page Components
import { HomePage } from './components/home/HomePage';
import { EventDiscoveryPage } from './components/events/EventDiscoveryPage';
import { EventDetailsPage } from './components/events/EventDetailsPage';
import { AuthPages } from './components/auth/AuthPages';
import { AttendeeDashboard } from './components/attendee/AttendeeDashboard';
import { MyRegistrationsPage } from './components/attendee/MyRegistrationsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminEventManagement } from './components/admin/AdminEventManagement';
import { EventAttendeesModal } from './components/admin/EventAttendeesModal';
import { ReportsPage } from './components/admin/ReportsPage';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function MainAppContent() {
  const { user, isConfigured } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Attendees Modal State (Admin)
  const [attendeesEventId, setAttendeesEventId] = useState<string | null>(null);
  const [attendeesList, setAttendeesList] = useState<Registration[]>([]);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);

  // Data States
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    publishedEvents: 0,
    totalRegistrations: 0,
    activeRegistrations: 0,
    cancelledRegistrations: 0,
    availableSeats: 0,
    occupancyRate: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show toast utility
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch all necessary application data based on user role and state
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsData, statsData] = await Promise.all([
        dataService.getEvents({
          includeAllStatuses: user?.role === 'ADMIN',
          currentUserId: user?.id,
        }),
        dataService.getDashboardStats(),
      ]);

      setEvents(eventsData);
      setStats(statsData);

      // Fetch user's registrations if logged in
      if (user) {
        const userRegs = await dataService.getMyRegistrations(user.id);
        setMyRegistrations(userRegs);
      } else {
        setMyRegistrations([]);
      }

      // Fetch all registrations if admin
      if (user?.role === 'ADMIN') {
        const allRegs = await dataService.getAllRegistrations(user);
        setAllRegistrations(allRegs);
      } else {
        setAllRegistrations([]);
      }
    } catch (err: any) {
      console.error('Error loading app data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load and reload when user role/session changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle navigation
  const navigateTo = (view: string, params?: { eventId?: string }) => {
    if (params?.eventId) {
      setSelectedEventId(params.eventId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle event registration (Attendee)
  const handleRegisterForEvent = async (eventId: string) => {
    if (!user) {
      showToast('Please sign in or use 1-Click Demo Login to reserve a seat.', 'info');
      setCurrentView('auth-login');
      return;
    }

    setRegisteringEventId(eventId);
    try {
      await dataService.registerForEvent(eventId, user);
      
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#A78BFA', '#6D28D9', '#34D399', '#F472B6'],
        });
      } catch (e) {
        // Safe in non-canvas environments
      }

      showToast('Congratulations! Your seat is confirmed. Your digital pass is ready.', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Please check capacity rules.', 'error');
    } finally {
      setRegisteringEventId(null);
    }
  };

  // Handle registration cancellation
  const handleCancelRegistration = async (registrationId: string) => {
    if (!user) return;
    try {
      await dataService.cancelRegistration(registrationId, user);
      showToast('Registration cancelled. Your seat has been freed up for other attendees.', 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel registration.', 'error');
    }
  };

  // Admin: Create Event
  const handleCreateEvent = async (eventData: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Rule 13 Violation: Only administrators can create events.', 'error');
      return;
    }
    await dataService.createEvent(eventData, user);
    showToast('Event created successfully!', 'success');
    await loadData();
  };

  // Admin: Update Event
  const handleUpdateEvent = async (id: string, updates: Partial<EventItem>) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Rule 13 Violation: Only administrators can modify events.', 'error');
      return;
    }
    await dataService.updateEvent(id, updates, user);
    showToast('Event updated successfully.', 'success');
    await loadData();
  };

  // Admin: Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!user || user.role !== 'ADMIN') {
      showToast('Rule 13 Violation: Only administrators can delete events.', 'error');
      return;
    }
    await dataService.deleteEvent(id, user);
    showToast('Event deleted permanently.', 'info');
    await loadData();
  };

  // Admin: Open Attendees Modal
  const handleViewAttendees = async (eventId: string) => {
    if (!user || user.role !== 'ADMIN') return;
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    try {
      const attendeesRecords = await dataService.getEventAttendees(eventId, user);
      const attendeeRegs: Registration[] = attendeesRecords.map((item) => ({
        ...item.registration,
        profile: item.profile,
        event: ev,
      }));
      setAttendeesEventId(eventId);
      setAttendeesList(attendeeRegs);
      setIsAttendeesModalOpen(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to load attendee roster.', 'error');
    }
  };

  // Find currently selected event
  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;
  const attendeesEvent = events.find((e) => e.id === attendeesEventId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3FF]/40 text-[#1F2937] font-sans antialiased selection:bg-[#A78BFA]/30 selection:text-[#6D28D9]">
      
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-white border-emerald-200 text-emerald-900 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-white border-rose-200 text-rose-900 shadow-rose-500/10'
                : 'bg-white border-purple-200 text-[#6D28D9] shadow-purple-500/10'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />}
            
            <div className="text-xs font-semibold flex-1 leading-snug">
              {toast.message}
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            events={events}
            featuredEvents={events.filter((e) => e.status === 'Published')}
            onNavigate={navigateTo}
            onViewDetails={(id) => navigateTo('event-details', { eventId: id })}
            onRegister={handleRegisterForEvent}
          />
        )}

        {currentView === 'events' && (
          <EventDiscoveryPage
            events={events}
            loading={loading}
            onViewDetails={(id) => navigateTo('event-details', { eventId: id })}
            onRegister={handleRegisterForEvent}
            registeringEventId={registeringEventId}
          />
        )}

        {currentView === 'event-details' && (
          <EventDetailsPage
            event={selectedEvent}
            onBack={() => navigateTo('events')}
            onRegister={handleRegisterForEvent}
            onCancelRegistration={handleCancelRegistration}
            isRegistering={registeringEventId === selectedEventId}
          />
        )}

        {(currentView === 'auth-login' || currentView === 'auth-register') && (
          <AuthPages
            initialMode={currentView === 'auth-register' ? 'register' : 'login'}
            onSuccess={() => {
              showToast(`Signed in successfully!`, 'success');
              if (user?.role === 'ADMIN') {
                navigateTo('admin-dashboard');
              } else {
                navigateTo('attendee-dashboard');
              }
            }}
          />
        )}

        {currentView === 'attendee-dashboard' && (
          <AttendeeDashboard
            myRegistrations={myRegistrations}
            availableEvents={events.filter((e) => e.status === 'Published')}
            onNavigate={navigateTo}
            onViewDetails={(id) => navigateTo('event-details', { eventId: id })}
            onCancelRegistration={handleCancelRegistration}
          />
        )}

        {currentView === 'my-registrations' && (
          <MyRegistrationsPage
            registrations={myRegistrations}
            onCancelRegistration={handleCancelRegistration}
            onViewEventDetails={(id) => navigateTo('event-details', { eventId: id })}
            onNavigateToEvents={() => navigateTo('events')}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            stats={stats}
            events={events}
            allRegistrations={allRegistrations}
            onNavigate={navigateTo}
            onCreateEventClick={() => navigateTo('admin-events')}
            onViewAttendees={handleViewAttendees}
          />
        )}

        {currentView === 'admin-events' && (
          <AdminEventManagement
            events={events}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onViewEventDetails={(id) => navigateTo('event-details', { eventId: id })}
            onViewAttendees={handleViewAttendees}
          />
        )}

        {currentView === 'admin-reports' && (
          <ReportsPage
            stats={stats}
            events={events}
            registrations={allRegistrations}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Database Setup & Dual-Engine Inspector Modal */}
      <DatabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onResetDemoData={async () => {
          await dataService.resetToSeedData();
          showToast('Database reset to fresh demo dataset.', 'info');
          await loadData();
          setIsDbModalOpen(false);
        }}
      />

      {/* Admin Attendee Roster Modal */}
      <EventAttendeesModal
        event={attendeesEvent}
        attendees={attendeesList}
        isOpen={isAttendeesModalOpen}
        onClose={() => setIsAttendeesModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
