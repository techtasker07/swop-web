const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function analyzeMobileBehavior() {
  try {
    console.log('🔍 Analyzing mobile app behavior...')
    
    // Get the Shams Dev profile
    const { data: shamsProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('business_name', 'Shams Dev')
      .single()
    
    if (!shamsProfile) {
      console.log('❌ Shams Dev profile not found')
      return
    }
    
    console.log(`✅ Found Shams Dev profile: ${shamsProfile.id}`)
    
    // Get all listings by Shams Dev
    const { data: allListings } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', shamsProfile.id)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
    
    console.log(`\n📋 All listings by Shams Dev (${allListings.length}):`)
    allListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.category} - ₦${listing.price}`)
      if (listing.title === 'Office Furnitures') {
        console.log(`   ⭐ This is the one shown in mobile app!`)
        console.log(`   📅 Created: ${listing.created_at}`)
        console.log(`   🏷️ Category: ${listing.category}`)
        console.log(`   📝 Description: ${listing.description}`)
      }
    })
    
    // Check if there's any special filtering that might explain why only 1 is shown
    console.log(`\n🤔 Possible explanations for mobile showing only 1:`)
    
    // 1. Maybe it's filtering by a specific category
    const categories = [...new Set(allListings.map(l => l.category))]
    console.log(`1. Categories: ${categories.join(', ')}`)
    
    // 2. Maybe it's filtering by recent listings
    const recentListings = allListings.filter(l => {
      const created = new Date(l.created_at)
      const now = new Date()
      const daysDiff = (now - created) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7 // Last 7 days
    })
    console.log(`2. Recent listings (last 7 days): ${recentListings.length}`)
    
    // 3. Maybe it's filtering by featured listings
    const featuredListings = allListings.filter(l => l.is_featured)
    console.log(`3. Featured listings: ${featuredListings.length}`)
    
    // 4. Maybe it's filtering by a specific business category
    const businessCategories = ['Professional Services', 'Business Equipment', 'Technology Services']
    const businessListings = allListings.filter(l => businessCategories.includes(l.category))
    console.log(`4. Business category listings: ${businessListings.length}`)
    businessListings.forEach(l => console.log(`   - ${l.title} (${l.category})`))
    
    // 5. Maybe there's an issue with the mobile app or it's showing a different view
    console.log(`\n💭 Conclusion:`)
    console.log(`The mobile app shows 1 listing but the user has ${allListings.length} total listings.`)
    console.log(`This might be due to:`)
    console.log(`- Filtering by business-specific categories`)
    console.log(`- A bug in the mobile app`)
    console.log(`- Different view context (maybe showing requests/offers instead of listings)`)
    console.log(`- Time-based filtering`)
    
  } catch (error) {
    console.error('❌ Error analyzing mobile behavior:', error)
  }
}

analyzeMobileBehavior()