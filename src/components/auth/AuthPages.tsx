import React, { useState } from 'react';
import { 
  Calendar, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database';

interface AuthPagesProps {
  initialMode?: 'login' | 'register';
  onSuccess: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ initialMode = 'login', onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register, quickLoginAdmin, quickLoginAttendee, loading } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ATTENDEE');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }

      try {
        await register(fullName, email, password, selectedRole);
        onSuccess();
      } catch (err: any) {
        setError(err.message || 'Failed to create account.');
      }
    } else {
      // Login
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      try {
        await login(email, password, rememberMe);
        onSuccess();
      } catch (err: any) {
        setError(err.message || 'Invalid credentials.');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-purple-500/10 border border-purple-100 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Visual / Branding Column (Split Screen Design) */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#A78BFA] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Rings */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-xl font-extrabold tracking-tight font-heading">
                Nowshera <span className="text-purple-200">Events Co.</span>
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading leading-tight">
                {mode === 'login' ? 'Welcome Back!' : 'Join the Community'}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-purple-100 leading-relaxed">
                {mode === 'login' 
                  ? 'Access your event registrations, digital passes, and live seat reservations in seconds.' 
                  : 'Create an account to attend upcoming workshops, seminars, and hackathons in Nowshera.'
                }
              </p>
            </div>
          </div>

          {/* Quick Demo Login Helpers */}
          <div className="relative z-10 pt-8 border-t border-white/20 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo Logins
            </div>
            <div className="space-y-2">
              <button
                id="quick-demo-admin-login-btn"
                type="button"
                onClick={() => {
                  quickLoginAdmin();
                  onSuccess();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center justify-between transition-colors text-left"
              >
                <span>Login as <strong className="underline">Admin</strong> (Tariq Khattak)</span>
                <Shield className="w-3.5 h-3.5 text-amber-300" />
              </button>

              <button
                id="quick-demo-attendee-login-btn"
                type="button"
                onClick={() => {
                  quickLoginAttendee();
                  onSuccess();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center justify-between transition-colors text-left"
              >
                <span>Login as <strong className="underline">Attendee</strong> (Irum Naaz)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900 font-heading">
                {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
              </h3>
              <p className="text-xs text-gray-500">
                {mode === 'login' ? (
                  <>
                    Don't have an account yet?{' '}
                    <button
                      id="switch-to-register-btn"
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError(null);
                      }}
                      className="font-bold text-[#6D28D9] hover:underline"
                    >
                      Sign up here
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      id="switch-to-login-btn"
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="font-bold text-[#6D28D9] hover:underline"
                    >
                      Sign in here
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                id="auth-error-alert"
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="register-fullname-input"
                      type="text"
                      placeholder="e.g. Irum Naaz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="auth-email-input"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="register-confirm-password-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Account Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('ATTENDEE')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          selectedRole === 'ATTENDEE'
                            ? 'bg-[#F5F3FF] border-[#A78BFA] text-[#6D28D9]'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Attendee (Events &amp; Passes)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('ADMIN')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          selectedRole === 'ADMIN'
                            ? 'bg-[#6D28D9] border-[#6D28D9] text-white'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Admin (Organizer)
                      </button>
                    </div>
                  </div>
                </>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                    <input
                      id="remember-me-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-[#6D28D9] focus:ring-[#A78BFA]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('For hackathon demonstration, use the 1-click demo buttons on the left or enter any password!')}
                    className="text-[#6D28D9] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
