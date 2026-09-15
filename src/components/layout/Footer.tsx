import React from 'react';
import { Calendar, Heart, Shield, Sparkles, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenDbModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDbModal }) => {
  const { user, role, quickLoginAdmin, quickLoginAttendee } = useAuth();

  return (
    <footer className="bg-white border-t border-purple-100/90 pt-14 pb-10 text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-100">
          
          {/* Col 1: Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('home')} 
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-[#A78BFA] flex items-center justify-center text-white shadow-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight font-heading">
                Nowshera <span className="text-[#6D28D9]">Events Co.</span>
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed max-w-md font-medium">
              Conferences, workshops and community events — organized beautifully.
            </p>

            <p className="text-xs text-gray-500 max-w-md leading-relaxed">
              Empowering regional educators, technology innovators, civic groups, and local youth across Nowshera District, Khyber Pakhtunkhwa with seamless event discovery and real-time seat reservations.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6D28D9]" />
                Nowshera, Khyber Pakhtunkhwa
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#6D28D9]" />
                hello@nowsheraevents.co
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-heading">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  id="footer-home-link"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#6D28D9] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  id="footer-events-link"
                  onClick={() => onNavigate('events')}
                  className="hover:text-[#6D28D9] transition-colors"
                >
                  Upcoming Events
                </button>
              </li>
              <li>
                <button
                  id="footer-registrations-link"
                  onClick={() => onNavigate('my-registrations')}
                  className="hover:text-[#6D28D9] transition-colors"
                >
                  My Registrations
                </button>
              </li>
              <li>
                <button
                  id="footer-login-link"
                  onClick={() => onNavigate('login')}
                  className="hover:text-[#6D28D9] transition-colors"
                >
                  Login
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hackathon Demo & Supabase */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-heading">
              Hackathon Evaluation
            </h4>
            <div className="p-3.5 rounded-xl bg-[#F5F3FF] border border-purple-100 text-xs space-y-2">
              <div className="font-semibold text-[#6D28D9] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Skool Demo Mode
              </div>
              <p className="text-[11px] text-gray-600 leading-snug">
                Switch between Admin &amp; Attendee roles to test permissions, ticket generation, and event capacity.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={quickLoginAttendee}
                  className="px-2 py-1 bg-white border border-purple-200 text-[#6D28D9] rounded-lg text-[10px] font-bold hover:bg-purple-50"
                >
                  As Attendee
                </button>
                <button
                  onClick={quickLoginAdmin}
                  className="px-2 py-1 bg-[#6D28D9] text-white rounded-lg text-[10px] font-bold hover:bg-[#5B21B6]"
                >
                  As Admin
                </button>
              </div>
            </div>

            <button
              onClick={onOpenDbModal}
              className="text-xs text-[#6D28D9] hover:underline flex items-center gap-1 font-semibold"
            >
              <Shield className="w-3.5 h-3.5" />
              View Supabase SQL &amp; RLS Policies
            </button>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div>
            © {new Date().getFullYear()} <span className="font-semibold text-gray-700">Nowshera Events Co.</span> All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built for <span className="font-semibold text-[#6D28D9]">AI Skool Hackathon</span> with Supabase &amp; React.
          </div>
        </div>
      </div>
    </footer>
  );
};
