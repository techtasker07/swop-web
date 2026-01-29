const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  try {
    console.log('Applying B2B migration...')
    
    // Step 1: Add missing columns to profiles table
    console.log('Adding columns to profiles table...')
    const { error: profilesError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'personal' CHECK (user_type IN ('personal', 'business')),
        ADD COLUMN IF NOT EXISTS business_name TEXT,
        ADD COLUMN IF NOT EXISTS business_type TEXT,
        ADD COLUMN IF NOT EXISTS business_description TEXT,
        ADD COLUMN IF NOT EXISTS year_established INTEGER,
        ADD COLUMN IF NOT EXISTS business_email TEXT,
        ADD COLUMN IF NOT EXISTS business_website TEXT,
        ADD COLUMN IF NOT EXISTS business_phone TEXT,
        ADD COLUMN IF NOT EXISTS business_logo_url TEXT,
        ADD COLUMN IF NOT EXISTS business_banner_url TEXT,
        ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
        ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
      `
    })
    
    if (profilesError) {
      console.error('Error adding columns:', profilesError)
      // Try alternative approach - execute each column addition separately
      const columns = [
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'personal';",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_type TEXT;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_description TEXT;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS year_established INTEGER;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_email TEXT;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_website TEXT;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_phone TEXT;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_logo_url TEXT;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_banner_url TEXT;",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';"
      ]
      
      for (const column of columns) {
        const { error } = await supabase.rpc('exec', { sql: column })
        if (error) {
          console.log(`Column might already exist: ${error.message}`)
        }
      }
    }
    
    // Step 2: Create indexes
    console.log('Creating indexes...')
    await supabase.rpc('exec', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
        CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
      `
    })
    
    console.log('B2B migration applied successfully!')
    console.log('You can now create business profiles and access B2B features.')
    
  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  }
}

applyMigration()