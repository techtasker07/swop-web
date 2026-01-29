const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testBusinessCategories() {
  try {
    console.log('🧪 Testing business category filtering...')
    
    // Define business-specific categories (same as in the updated function)
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

    // Get all listings from business users
    const { data: allListings, error } = await supabase
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching listings:', error)
      return
    }

    // Filter for business users only
    const businessUserListings = allListings.filter(listing => 
      listing.seller && listing.seller.user_type === 'business'
    )

    console.log(`✅ Total listings from business users: ${businessUserListings.length}`)

    // Filter by business categories
    const businessCategoryListings = businessUserListings.filter(listing =>
      businessCategories.includes(listing.category)
    )

    console.log(`✅ Business category listings: ${businessCategoryListings.length}`)

    console.log(`\n📋 Business category listings:`)
    businessCategoryListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.category} - ${listing.seller.business_name || listing.seller.display_name}`)
    })

    console.log(`\n📊 All categories from business users:`)
    const allCategories = [...new Set(businessUserListings.map(l => l.category))].sort()
    allCategories.forEach(cat => {
      const count = businessUserListings.filter(l => l.category === cat).length
      const isBusiness = businessCategories.includes(cat) ? '✅' : '❌'
      console.log(`${isBusiness} ${cat}: ${count} listings`)
    })

    console.log(`\n💡 Analysis:`)
    console.log(`- Total business user listings: ${businessUserListings.length}`)
    console.log(`- Business category listings: ${businessCategoryListings.length}`)
    console.log(`- Mobile app shows: 1 listing`)
    
    if (businessCategoryListings.length === 1) {
      console.log(`✅ Perfect match! Business category filtering gives exactly 1 listing like mobile app.`)
    } else if (businessCategoryListings.length > 1) {
      console.log(`⚠️ More listings than mobile app. Mobile might have additional filtering.`)
    } else {
      console.log(`❌ No business category listings found. Mobile might use different categories.`)
    }

  } catch (error) {
    console.error('❌ Error testing business categories:', error)
  }
}

testBusinessCategories()