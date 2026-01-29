const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testUserOwnB2B() {
  try {
    console.log('🧪 Testing if mobile app shows user\'s own B2B listings...')
    
    // Business categories
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

    // Get Shams Dev profile (the user in the mobile screenshot)
    const { data: shamsProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('business_name', 'Shams Dev')
      .single()

    if (!shamsProfile) {
      console.log('❌ Shams Dev profile not found')
      return
    }

    console.log(`✅ Found Shams Dev profile: ${shamsProfile.display_name}`)

    // Get Shams Dev's own listings in business categories
    const { data: userB2BListings, error } = await supabase
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
      .in('category', businessCategories)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching user B2B listings:', error)
      return
    }

    console.log(`\n📋 Shams Dev's own B2B listings (${userB2BListings.length}):`)
    userB2BListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.category} - ₦${listing.price}`)
      if (listing.title === 'Office Furnitures') {
        console.log(`   ⭐ This matches the mobile app!`)
      }
    })

    console.log(`\n💡 Analysis:`)
    console.log(`- User's own B2B listings: ${userB2BListings.length}`)
    console.log(`- Mobile app shows: 1 listing`)
    
    if (userB2BListings.length === 1) {
      console.log(`✅ PERFECT MATCH! Mobile app shows user's own B2B listings only.`)
      console.log(`\n🎯 Solution: The B2B page should show the logged-in user's own business listings in business categories.`)
    } else {
      console.log(`❓ Still not matching. Mobile app logic might be different.`)
    }

    // Also check all user's listings to see categories
    const { data: allUserListings } = await supabase
      .from('listings')
      .select('title, category')
      .eq('seller_id', shamsProfile.id)
      .eq('is_available', true)

    console.log(`\n📊 All categories in user's listings:`)
    const userCategories = [...new Set(allUserListings.map(l => l.category))].sort()
    userCategories.forEach(cat => {
      const count = allUserListings.filter(l => l.category === cat).length
      const isBusiness = businessCategories.includes(cat) ? '✅' : '❌'
      console.log(`${isBusiness} ${cat}: ${count} listings`)
    })

  } catch (error) {
    console.error('❌ Error testing user own B2B:', error)
  }
}

testUserOwnB2B()