
-- Complete Schema Migration with All Required Permissions
-- This replaces all previous migration files and provides complete setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create professionals table for mental health experts
CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create client_statistics table for storing anonymous user and client mode exercise statistics
CREATE TABLE IF NOT EXISTS client_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    client_identifier TEXT NOT NULL,
    exercise_data JSONB NOT NULL,
    session_date TIMESTAMPTZ DEFAULT now(),
    is_client_mode_session BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_statistics_professional_id ON client_statistics(professional_id);
CREATE INDEX IF NOT EXISTS idx_client_statistics_session_date ON client_statistics(session_date);
CREATE INDEX IF NOT EXISTS idx_client_statistics_client_identifier ON client_statistics(client_identifier);

-- CRITICAL: Grant schema usage permissions to both authenticated and anonymous users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions to authenticated role for professionals table
GRANT SELECT ON TABLE public.professionals TO authenticated;
GRANT INSERT ON TABLE public.professionals TO authenticated;
GRANT UPDATE ON TABLE public.professionals TO authenticated;

-- Grant permissions to authenticated role for client_statistics table
GRANT SELECT ON TABLE public.client_statistics TO authenticated;
GRANT INSERT ON TABLE public.client_statistics TO authenticated;
GRANT UPDATE ON TABLE public.client_statistics TO authenticated;
GRANT DELETE ON TABLE public.client_statistics TO authenticated;

-- CRITICAL: Grant permissions to anonymous role for client_statistics operations
-- Anonymous users need to be able to insert data when connected to a professional
GRANT INSERT ON TABLE public.client_statistics TO anon;

-- CRITICAL: Anonymous users need SELECT access to professionals.id for RLS policy validation
GRANT SELECT (id) ON TABLE public.professionals TO anon;

-- Enable Row Level Security (RLS)
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professionals table
-- Professionals can only read/update their own data
CREATE POLICY "Professionals can view own data" ON professionals
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Professionals can update own data" ON professionals
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Professionals can insert own data" ON professionals
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for client_statistics table
-- Professionals can only access statistics linked to their account
CREATE POLICY "Professionals can view own client statistics" ON client_statistics
    FOR SELECT USING (professional_id = auth.uid());

CREATE POLICY "Professionals can insert client statistics" ON client_statistics
    FOR INSERT WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Professionals can update own client statistics" ON client_statistics
    FOR UPDATE USING (professional_id = auth.uid());

CREATE POLICY "Professionals can delete own client statistics" ON client_statistics
    FOR DELETE USING (professional_id = auth.uid());

-- CRITICAL: RLS Policy for anonymous users to insert valid non-client-mode statistics
-- This allows anonymous users to insert data only when:
-- 1. is_client_mode_session = false (not a client mode session)
-- 2. professional_id is not null and exists in professionals table
CREATE POLICY "Anonymous can insert valid non-client-mode statistics"
ON public.client_statistics
FOR INSERT TO anon
WITH CHECK (
    is_client_mode_session = false AND
    professional_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.professionals WHERE id = professional_id)
);

-- Create a function to handle professional profile creation
CREATE OR REPLACE FUNCTION handle_new_professional() 
RETURNS TRIGGER AS $$
BEGIN
    -- This function will be called when a new user signs up via Supabase Auth
    -- It ensures a professional profile is created in our professionals table
    INSERT INTO public.professionals (id, email, display_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create professional profile on auth signup
-- Note: This trigger works with Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_professional();

-- Comments for documentation
COMMENT ON TABLE professionals IS 'Mental health professionals who can receive and analyze client data';
COMMENT ON TABLE client_statistics IS 'Exercise statistics from anonymous users and client mode sessions';
COMMENT ON COLUMN client_statistics.exercise_data IS 'Flexible JSONB structure containing exercise name, score, date, duration, and other details';
COMMENT ON COLUMN client_statistics.is_client_mode_session IS 'Distinguishes between anonymous user data and professional client mode sessions';
