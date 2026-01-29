-- Add missing columns to profiles table for B2B functionality
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS business_website TEXT,
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS business_logo_url TEXT,
ADD COLUMN IF NOT EXISTS business_banner_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

-- Add constraints
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_user_type CHECK (user_type IN ('personal', 'business')),
ADD CONSTRAINT IF NOT EXISTS check_verification_status CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- Update existing profiles to have user_type = 'personal' if null
UPDATE profiles SET user_type = 'personal' WHERE user_type IS NULL;