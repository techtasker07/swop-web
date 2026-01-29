const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testB2BQuery() {
  try {
    console.log('Testing B2B query...')
    
    // First, let's see what profiles exist with user_type = 'business'
    const { data: businessProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, user_type, business_name, business_type')
      .eq('user_type', 'business')
    
    if (profileError) {
      console.error('Error fetching business profiles:', profileError)
      return
    }
    
    console.log('Business profiles found:', businessProfiles.length)
    console.log('Sample business profiles:', businessProfiles.slice(0, 3))
    
    // Now let's try to get listings from business users
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!seller_id(
          id, 
          display_name, 
          user_type, 
          business_name, 
          business_type
        )
      `)
      .eq('is_available', true)
      .eq('seller.user_type', 'business')
      .limit(5)
    
    if (listingsError) {
      console.error('Error fetching B2B listings:', listingsError)
      
      // Try alternative approach - get all listings and filter client-side
      console.log('Trying alternative approach...')
      const { data: allListings, error: allError } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!seller_id(
            id, 
            display_name, 
            user_type, 
            business_name, 
            business_type
          )
        `)
        .eq('is_available', true)
        .limit(10)
      
      if (allError) {
        console.error('Error fetching all listings:', allError)
        return
      }
      
      const businessListings = allListings.filter(listing => 
        listing.seller && listing.seller.user_type === 'business'
      )
      
      console.log('Total listings:', allListings.length)
      console.log('Business listings (filtered):', businessListings.length)
      console.log('Sample business listings:', businessListings.slice(0, 2))
      
    } else {
      console.log('B2B listings found:', listings.length)
      console.log('Sample B2B listings:', listings.slice(0, 2))
    }
    
  } catch (error) {
    console.error('Error testing B2B query:', error)
  }
}

testB2BQuery()