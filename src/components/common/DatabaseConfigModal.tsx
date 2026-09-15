import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, RefreshCw, X, ShieldCheck, Key } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../../lib/supabaseSchema';
import { getStoredSupabaseConfig } from '../../lib/supabaseClient';
import { resetDatabaseToDefault } from '../../lib/dataService';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatabaseReset?: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onDatabaseReset,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(localStorage.getItem('nowshera_supabase_url') || '');
  const [anonKey, setAnonKey] = useState(localStorage.getItem('nowshera_supabase_anon_key') || '');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'credentials' | 'rules'>('sql');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      localStorage.setItem('nowshera_supabase_url', url.trim());
    } else {
      localStorage.removeItem('nowshera_supabase_url');
    }

    if (anonKey.trim()) {
      localStorage.setItem('nowshera_supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('nowshera_supabase_anon_key');
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload();
    }, 1200);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all events and registrations back to initial sample seed data?')) {
      resetDatabaseToDefault();
      if (onDatabaseReset) onDatabaseReset();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="supabase-config-modal"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#F5F3FF] to-white border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-heading">
                Supabase PostgreSQL Configuration & Schema
              </h3>
              <p className="text-xs text-gray-500">
                AI Skool Hackathon Architecture • Row Level Security • Live & Fallback Engine
              </p>
            </div>
          </div>
          <button
            id="close-db-modal-btn"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
          <button
            id="tab-sql-schema-btn"
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-[#6D28D9] text-[#6D28D9]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            SQL DDL & Migration Script
          </button>
          <button
            id="tab-credentials-btn"
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'credentials'
                ? 'border-[#6D28D9] text-[#6D28D9]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Connect Live Supabase
          </button>
          <button
            id="tab-rules-btn"
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'border-[#6D28D9] text-[#6D28D9]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            RLS & Business Rules Matrix
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
          {activeTab === 'sql' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-600">
                  Execute this in your <span className="font-semibold text-gray-900">Supabase SQL Editor</span> to provision <code className="bg-purple-50 text-[#6D28D9] px-1.5 py-0.5 rounded">profiles</code>, <code className="bg-purple-50 text-[#6D28D9] px-1.5 py-0.5 rounded">events</code>, and <code className="bg-purple-50 text-[#6D28D9] px-1.5 py-0.5 rounded">registrations</code> tables with strict RLS:
                </div>
                <button
                  id="copy-sql-button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#6D28D9] font-medium text-xs rounded-lg transition-colors border border-purple-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
                </button>
              </div>
              <div className="relative">
                <pre className="p-4 bg-gray-900 text-gray-200 rounded-xl text-xs font-mono overflow-x-auto max-h-[340px] leading-relaxed border border-gray-800">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div className="p-4 bg-[#F5F3FF] rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
                <p className="font-semibold mb-1">Dual-Engine Architecture:</p>
                The app comes with an in-memory &amp; localStorage database pre-seeded with Nowshera events. When you supply your Supabase project URL and anon public key below, the application connects directly to your live cloud PostgreSQL instance!
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  id="input-supabase-url"
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  id="input-supabase-anon-key"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-gray-500">
                  Status: {currentConfig.isConfigured ? (
                    <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Connected to Live Supabase
                    </span>
                  ) : (
                    <span className="text-purple-700 font-semibold inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Local Fallback Store Active (Pre-seeded)
                    </span>
                  )}
                </div>

                <button
                  id="save-credentials-btn"
                  type="submit"
                  className="px-5 py-2 bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  {savedSuccess ? 'Credentials Applied!' : 'Save & Connect'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-700 leading-relaxed">
                All 15 required business rules are strictly enforced at the data layer and Row Level Security (RLS) layer:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="font-bold text-[#6D28D9]">Rule 1 & 2:</span> One active registration per attendee per event; duplicates rejected by partial unique index.
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="font-bold text-[#6D28D9]">Rule 3:</span> Full events automatically reject registrations (enforced in service + UI validation).
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="font-bold text-[#6D28D9]">Rule 4, 5 & 6:</span> Cancelled, completed, and past events cannot accept reservations.
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="font-bold text-[#6D28D9]">Rule 7:</span> Only published upcoming events appear publicly to attendees.
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="font-bold text-[#6D28D9]">Rule 8, 9 & 10:</span> Cancelled registrations don't consume seats. Seat availability updates in real-time.
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="font-bold text-[#6D28D9]">Rule 11 & 12:</span> Positive integer capacity required; cannot lower capacity below active attendee count.
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="font-bold text-[#6D28D9]">Rule 13 & 14:</span> Admins manage events. Attendees can only access and view their own private registrations.
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                  <span className="font-bold text-[#6D28D9]">Rule 15:</span> Supabase RLS policies block unauthorized table access at PostgreSQL query engine.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          <button
            id="reset-demo-db-btn"
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Local Seed Data to Default
          </button>
          <div className="flex items-center gap-3">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-[#6D28D9] hover:underline flex items-center gap-1 font-medium"
            >
              Open Supabase Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
