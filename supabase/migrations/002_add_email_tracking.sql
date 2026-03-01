-- Add email tracking columns to donation_requests
ALTER TABLE donation_requests
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS email_subject TEXT DEFAULT NULL;
