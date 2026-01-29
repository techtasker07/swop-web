const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testSpecificUserB2B() {
  try {
    console.log('🧪 Testing B2B listings for specific user account...')
    
    // First, let's see what business profiles exist
    const { data: businessProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, user_type, business_name, business_type')
      .eq('user_type', 'business')
    
    if (profileError) {
      console.error('❌ Error fetching business profiles:', profileError)
      return
    }
    
    console.log(`✅ Found ${businessProfiles.length} business profiles:`)
    businessProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.business_name || profile.display_name} (${profile.id.substring(0, 8)}...)`)
    })
    
    // Let's check listings for the "Shams Dev" business (from the mobile screenshot)
    const shamsProfile = businessProfiles.find(p => 
      p.business_name === 'Shams Dev' || p.display_name === 'Eniola'
    )
    
    if (shamsProfile) {
      console.log(`\n🔍 Checking listings for ${shamsProfile.business_name || shamsProfile.display_name}:`)
      
      // Get listings created by this specific business user
      const { data: userListings, error: listingsError } = await supabase
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
        .eq('seller_id', shamsProfile.id)
        .eq('is_available', true)
      
      if (listingsError) {
        console.error('❌ Error fetching user listings:', listingsError)
        return
      }
      
      console.log(`✅ Found ${userListings.length} listings by this business user:`)
      userListings.forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title} - ₦${listing.price}`)
      })
      
      // Now get all B2B listings (from all business users)
      const { data: allB2BListings, error: allError } = await supabase
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
      
      if (allError) {
        console.error('❌ Error fetching all listings:', allError)
        return
      }
      
      const businessListings = allB2BListings.filter(listing => 
        listing.seller && listing.seller.user_type === 'business'
      )
      
      console.log(`\n📊 Comparison:`)
      console.log(`- This user's listings: ${userListings.length}`)
      console.log(`- All B2B listings: ${businessListings.length}`)
      console.log(`- Mobile app shows: 1 business listing available`)
      
      console.log(`\n💡 Analysis:`)
      if (userListings.length === 1) {
        console.log(`✅ Mobile app might be showing user's own B2B listings (${userListings.length})`)
      } else {
        console.log(`❓ Mobile app logic unclear - user has ${userListings.length} listings but shows 1`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing specific user B2B:', error)
  }
}

testSpecificUserB2B()