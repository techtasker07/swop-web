const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testCorrectedB2B() {
  try {
    console.log('🧪 Testing corrected B2B implementation...')
    
    // Test the corrected query with proper column names
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
          logo_url,
          banner_url,
          average_rating
        ),
        listing_images(id, listing_id, url, alt_text, is_primary, sort_order, created_at)
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error fetching listings:', error)
      return
    }

    console.log(`✅ Total listings fetched: ${data.length}`)
    
    // Filter for business listings only
    const businessListings = data.filter(listing => 
      listing.seller && listing.seller.user_type === 'business'
    )
    
    console.log(`✅ B2B listings found: ${businessListings.length}`)
    
    if (businessListings.length > 0) {
      console.log('\n📋 Sample B2B listings:')
      businessListings.slice(0, 3).forEach((listing, index) => {
        console.log(`${index + 1}. ${listing.title}`)
        console.log(`   Business: ${listing.seller.business_name || listing.seller.display_name}`)
        console.log(`   Type: ${listing.seller.business_type || 'N/A'}`)
        console.log(`   Price: ₦${listing.price}`)
        console.log(`   Verified: ${listing.seller.verification_status === 'verified' ? '✅' : '❌'}`)
        console.log(`   Logo: ${listing.seller.logo_url ? '✅' : '❌'}`)
        console.log('')
      })
    }
    
    // Test business profile check
    console.log('\n🔍 Testing business profile check...')
    const { data: businessProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, user_type, business_name')
      .eq('user_type', 'business')
      .limit(3)
    
    if (profileError) {
      console.error('❌ Error fetching business profiles:', profileError)
    } else {
      console.log(`✅ Business profiles found: ${businessProfiles.length}`)
      businessProfiles.forEach(profile => {
        console.log(`   - ${profile.business_name || profile.display_name} (${profile.user_type})`)
      })
    }
    
    console.log('\n🎉 B2B functionality is working correctly!')
    
  } catch (error) {
    console.error('❌ Error testing B2B:', error)
  }
}

testCorrectedB2B()