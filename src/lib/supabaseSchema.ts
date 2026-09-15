/**
 * Supabase PostgreSQL Database Schema & Security Policies (RLS)
 * Designed for Nowshera Events Co.
 * Copy and run this script in the Supabase SQL Editor.
 */

export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- NOWSHERA EVENTS CO. - SUPABASE DATABASE SCHEMA & RLS
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ATTENDEE' CHECK (role IN ('ADMIN', 'ATTENDEE')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Completed', 'Cancelled')),
  category TEXT DEFAULT 'Workshop',
  image_url TEXT,
  speaker_name TEXT,
  speaker_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce Rule 1: One active registration per attendee per event
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_registration_idx 
ON public.registrations (user_id, event_id) 
WHERE status = 'active';

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================================

-- PROFILES POLICIES
-- Anyone can view their own profile; Admins can view all profiles
DROP POLICY IF EXISTS "Profiles are readable by self and admins" ON public.profiles;
CREATE POLICY "Profiles are readable by self and admins"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- EVENTS POLICIES
-- Public & Attendees can only view published upcoming events
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;
CREATE POLICY "Published events are viewable by everyone"
ON public.events FOR SELECT
USING (status = 'Published' OR public.is_admin());

-- Only Admins can insert/update/delete events
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
USING (public.is_admin());

-- REGISTRATIONS POLICIES
-- Attendees can view only their own registrations; Admins can view all registrations
DROP POLICY IF EXISTS "Registrations viewable by owner or admin" ON public.registrations;
CREATE POLICY "Registrations viewable by owner or admin"
ON public.registrations FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

-- Attendees can create a registration for themselves
DROP POLICY IF EXISTS "Attendees can register themselves" ON public.registrations;
CREATE POLICY "Attendees can register themselves"
ON public.registrations FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.events
    WHERE id = event_id AND status = 'Published' AND event_date >= CURRENT_DATE
  )
);

-- Attendees can cancel their own registration; Admins can update any
DROP POLICY IF EXISTS "Users can update own registration status" ON public.registrations;
CREATE POLICY "Users can update own registration status"
ON public.registrations FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin());

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'ATTENDEE')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;
