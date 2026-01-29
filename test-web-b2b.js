const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Use the anon key like the web app does
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testWebB2B() {
  try {
    console.log('Testing web app B2B functionality with anon key...')
    
    // Test the same query the web app uses (with corrected columns)
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!seller_id(
          id, 
          display_name, 
          avatar_url, 
          user_type, 
          business_name, 
          business_type, 
          business_description,
          verification_status,
          average_rating
        ),
        listing_images(id, listing_id, url, alt_text, is_primary, sort_order, created_at)
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching listings:', error)
      return
    }

    console.log('Total listings fetched:', data.length)
    
    // Filter for business listings
    const businessListings = data.filter(listing => 
      listing.seller && listing.seller.user_type === 'business'
    )
    
    console.log('Business listings found:', businessListings.length)
    
    if (businessListings.length > 0) {
      console.log('Sample business listing:')
      console.log({
        id: businessListings[0].id,
        title: businessListings[0].title,
        seller: {
          display_name: businessListings[0].seller.display_name,
          user_type: businessListings[0].seller.user_type,
          business_name: businessListings[0].seller.business_name
        }
      })
    }
    
  } catch (error) {
    console.error('Error testing web B2B:', error)
  }
}

testWebB2B()