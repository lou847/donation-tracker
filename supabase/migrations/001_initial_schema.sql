-- ============================================
-- Donation Tracker - Database Schema
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requesters table (organizations/people requesting donations)
CREATE TABLE IF NOT EXISTS requesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    category TEXT NOT NULL DEFAULT 'other',
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donation requests table (core tracking entity)
CREATE TABLE IF NOT EXISTS donation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES requesters(id) ON DELETE CASCADE,

    -- Request details
    description TEXT NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    event_date DATE,
    event_name TEXT,

    -- Financial
    amount_requested NUMERIC(10,2),
    amount_approved NUMERIC(10,2),
    donation_type TEXT NOT NULL DEFAULT 'monetary',

    -- Tracking
    status TEXT NOT NULL DEFAULT 'new',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,

    -- Metadata
    notes TEXT,
    internal_notes TEXT,
    tax_receipt_sent BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,

    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donation request notes (activity log)
CREATE TABLE IF NOT EXISTS donation_request_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_request_id UUID NOT NULL REFERENCES donation_requests(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_donation_requests_requester ON donation_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status ON donation_requests(status);
CREATE INDEX IF NOT EXISTS idx_donation_requests_request_date ON donation_requests(request_date);
CREATE INDEX IF NOT EXISTS idx_donation_requests_event_date ON donation_requests(event_date);
CREATE INDEX IF NOT EXISTS idx_donation_request_notes_request ON donation_request_notes(donation_request_id);
CREATE INDEX IF NOT EXISTS idx_requesters_category ON requesters(category);
CREATE INDEX IF NOT EXISTS idx_requesters_org_name ON requesters(org_name);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_request_notes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Requesters: all authenticated users can manage
CREATE POLICY "Authenticated users can view requesters" ON requesters FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert requesters" ON requesters FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update requesters" ON requesters FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete requesters" ON requesters FOR DELETE USING (auth.uid() IS NOT NULL);

-- Donation requests: all authenticated users can manage
CREATE POLICY "Authenticated users can view donation_requests" ON donation_requests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert donation_requests" ON donation_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update donation_requests" ON donation_requests FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete donation_requests" ON donation_requests FOR DELETE USING (auth.uid() IS NOT NULL);

-- Notes: all authenticated users can manage
CREATE POLICY "Authenticated users can view notes" ON donation_request_notes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert notes" ON donation_request_notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete notes" ON donation_request_notes FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- Triggers
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_requesters
    BEFORE UPDATE ON requesters FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_donation_requests
    BEFORE UPDATE ON donation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
