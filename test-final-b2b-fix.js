const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Simulate the corrected getB2BListings function
async function getB2BListings(userId) {
  try {
    // Define business-specific categories
    const businessCategories = [
      'Professional Services',
      'Technology Services', 
      'Marketing & Advertising',
      'Construction & Trades',
      'Business Equipment',
      'Office Equipment',
      'Logistics & Transportation',
      'Financial Services',
      'Manufacturing & Production',
      'Training & Education',
      'Health & Safety',
      'Consulting',
      'Legal Services',
      'Accounting',
      'IT Services',
      'Business Consulting'
    ]

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
      .eq('seller_id', userId) // Only get current user's listings
      .in('category', businessCategories) // Only business categories
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching B2B listings:', error)
      return []
    }
    
    // Ensure the user is a business user
    const userBusinessListings = (data || []).filter(listing => 
      listing.seller && listing.seller.user_type === 'business'
    )
    
    return userBusinessListings
  } catch (error) {
    console.error('Error in getB2BListings:', error)
    return []
  }
}

async function testFinalB2BFix() {
  try {
    console.log('🎯 Testing final B2B fix - user\'s own business listings...')
    
    // Test with Shams Dev user (from mobile screenshot)
    const { data: shamsProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('business_name', 'Shams Dev')
      .single()

    if (!shamsProfile) {
      console.log('❌ Shams Dev profile not found')
      return
    }

    console.log(`✅ Testing with user: ${shamsProfile.business_name} (${shamsProfile.display_name})`)
    console.log(`   User type: ${shamsProfile.user_type}`)

    // Get user's B2B listings using the corrected function
    const userB2BListings = await getB2BListings(shamsProfile.id)

    console.log(`\n📋 User's B2B listings (${userB2BListings.length}):`)
    userB2BListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title}`)
      console.log(`   Category: ${listing.category}`)
      console.log(`   Price: ₦${listing.price}`)
      console.log(`   Business: ${listing.seller.business_name}`)
      console.log('')
    })

    console.log(`🎯 Result Comparison:`)
    console.log(`- Web app (corrected): ${userB2BListings.length} business listings`)
    console.log(`- Mobile app: 1 business listings available`)
    
    if (userB2BListings.length === 1 && userB2BListings[0].title === 'Office Furnitures') {
      console.log(`✅ PERFECT MATCH! Web app now matches mobile app exactly.`)
      console.log(`✅ Both show: "Office Furnitures" by Shams Dev`)
    } else if (userB2BListings.length === 1) {
      console.log(`✅ Count matches! Both show 1 listing.`)
    } else {
      console.log(`❌ Still not matching. Need further investigation.`)
    }

    // Test with another business user
    console.log(`\n🧪 Testing with another business user...`)
    const { data: jonesProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('business_name', 'Jones and Jones')
      .single()

    if (jonesProfile) {
      const jonesB2BListings = await getB2BListings(jonesProfile.id)
      console.log(`✅ ${jonesProfile.business_name}: ${jonesB2BListings.length} B2B listings`)
      jonesB2BListings.forEach(listing => {
        console.log(`   - ${listing.title} (${listing.category})`)
      })
    }

  } catch (error) {
    console.error('❌ Error testing final B2B fix:', error)
  }
}

testFinalB2BFix()