const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkMigration() {
  try {
    console.log('Checking if B2B migration is needed...')
    
    // Try to query a profile with user_type column
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_type, business_name')
      .limit(1)
    
    if (error) {
      if (error.message.includes('column "user_type" does not exist')) {
        console.log('❌ B2B migration needed: user_type column does not exist')
        console.log('Please apply the migration by running the SQL in apply-migration-simple.sql in your Supabase dashboard')
        return false
      } else {
        console.error('Error checking migration:', error)
        return false
      }
    }
    
    console.log('✅ B2B migration already applied - user_type column exists')
    console.log('Sample data:', data)
    return true
    
  } catch (error) {
    console.error('Error checking migration:', error)
    return false
  }
}

checkMigration()