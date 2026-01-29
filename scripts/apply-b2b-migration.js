const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const b2bMigration = `
-- =============================================
-- Final B2B Implementation Migration
-- Works with existing table structure
-- =============================================

-- Add missing columns to profiles table (only if they don't exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'personal' CHECK (user_type IN ('personal', 'business')),
ADD COLUMN IF NOT EXISTS year_established INTEGER,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS kyc_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_completed_at TIMESTAMPTZ;

-- Create indexes for business profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- Create business_reviews table for B2B specific reviews
CREATE TABLE IF NOT EXISTS business_reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    would_recommend BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, business_id, listing_id)
);

-- Create indexes for business_reviews
CREATE INDEX IF NOT EXISTS idx_business_reviews_business_id ON business_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_reviewer_id ON business_reviews(reviewer_id);

-- Enable RLS for business_reviews
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_reviews
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view all business reviews' AND tablename = 'business_reviews') THEN
        CREATE POLICY "Users can view all business reviews" ON business_reviews
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create reviews for businesses' AND tablename = 'business_reviews') THEN
        CREATE POLICY "Users can create reviews for businesses" ON business_reviews
            FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own reviews' AND tablename = 'business_reviews') THEN
        CREATE POLICY "Users can update their own reviews" ON business_reviews
            FOR UPDATE USING (auth.uid() = reviewer_id);
    END IF;
END $$;

-- Create function to automatically verify businesses after 12 hours
CREATE OR REPLACE FUNCTION auto_verify_business()
RETURNS void AS $func$
BEGIN
    UPDATE profiles 
    SET verification_status = 'verified',
        verified_at = NOW()
    WHERE user_type = 'business' 
    AND verification_status = 'unverified'
    AND verification_expires_at IS NOT NULL
    AND verification_expires_at <= NOW();
END;
$func$ LANGUAGE plpgsql;

-- Create notification trigger for business verification
CREATE OR REPLACE FUNCTION notify_business_verification()
RETURNS trigger AS $func$
BEGIN
    IF OLD.verification_status IS DISTINCT FROM NEW.verification_status AND NEW.verification_status = 'verified' THEN
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES (
            NEW.id,
            'business_verified',
            'Business Verified!',
            'Congratulations! Your business profile has been verified. You now have access to all B2B features.',
            jsonb_build_object('business_name', NEW.business_name)
        );
    END IF;
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for business verification notifications
DROP TRIGGER IF EXISTS business_verification_notification ON profiles;
CREATE TRIGGER business_verification_notification
    AFTER UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status)
    EXECUTE FUNCTION notify_business_verification();

-- Create view for business statistics
CREATE OR REPLACE VIEW business_stats AS
SELECT 
    p.id,
    p.business_name,
    p.verification_status,
    COUNT(DISTINCT l.id) as total_listings,
    COUNT(DISTINCT CASE WHEN l.is_available = true THEN l.id END) as active_listings,
    COALESCE(AVG(br.rating), 0) as average_rating,
    COUNT(DISTINCT br.id) as total_reviews,
    COUNT(DISTINCT t.id) as total_trades,
    p.created_at as business_since
FROM profiles p
LEFT JOIN listings l ON p.id = l.seller_id
LEFT JOIN business_reviews br ON p.id = br.business_id
LEFT JOIN trades t ON (p.id = t.proposer_id OR p.id = t.receiver_id)
WHERE p.user_type = 'business'
GROUP BY p.id, p.business_name, p.verification_status, p.created_at;

-- Grant permissions
GRANT SELECT ON business_stats TO authenticated;
`

async function applyMigration() {
  try {
    console.log('Applying B2B migration...')
    
    const { error } = await supabase.rpc('exec_sql', { 
      sql: b2bMigration 
    })
    
    if (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }
    
    console.log('B2B migration applied successfully!')
  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  }
}

applyMigration()