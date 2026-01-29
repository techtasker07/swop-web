const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkProfileColumns() {
  try {
    console.log('Checking which profile columns exist...')
    
    // Try to get a profile with basic columns first
    const { data: basicProfile, error: basicError } = await supabase
      .from('profiles')
      .select('id, display_name, user_type, business_name, business_type')
      .limit(1)
    
    if (basicError) {
      console.error('Error with basic columns:', basicError)
      return
    }
    
    console.log('✅ Basic columns work:', Object.keys(basicProfile[0] || {}))
    
    // Try additional business columns one by one
    const columnsToTest = [
      'business_description',
      'verification_status', 
      'business_logo_url', 
      'business_banner_url',
      'average_rating'
    ]
    
    for (const column of columnsToTest) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`id, ${column}`)
          .limit(1)
        
        if (error) {
          console.log(`❌ Column '${column}' does not exist:`, error.message)
        } else {
          console.log(`✅ Column '${column}' exists`)
        }
      } catch (e) {
        console.log(`❌ Column '${column}' error:`, e.message)
      }
    }
    
  } catch (error) {
    console.error('Error checking columns:', error)
  }
}

checkProfileColumns()