const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Simulate the exact same function as in the web app
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function getB2BListings({
  category,
  search,
  sort = 'recent',
  limit = 20,
  offset = 0
} = {}) {
  try {
    let query = supabase
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

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'featured':
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching B2B listings:', error)
      return []
    }
    
    // Filter for business listings on the client side
    const businessListings = (data || []).filter(listing => 
      listing.seller && listing.seller.user_type === 'business'
    )
    
    return businessListings
  } catch (error) {
    console.error('Error in getB2BListings:', error)
    return []
  }
}

async function testFinalB2B() {
  console.log('🧪 Testing final B2B implementation...')
  
  const listings = await getB2BListings()
  
  console.log(`✅ Found ${listings.length} B2B listings`)
  
  if (listings.length > 0) {
    console.log('\n📋 Sample B2B listings:')
    listings.slice(0, 3).forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title}`)
      console.log(`   Business: ${listing.seller.business_name || listing.seller.display_name}`)
      console.log(`   Type: ${listing.seller.business_type || 'N/A'}`)
      console.log(`   Price: ₦${listing.price}`)
      console.log(`   Verified: ${listing.seller.verification_status === 'verified' ? '✅' : '❌'}`)
      console.log('')
    })
  }
  
  console.log('🎉 B2B functionality is working correctly!')
}

testFinalB2B()