const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testSpecificListingImages() {
  try {
    console.log('🔍 Testing specific listing with images...')
    
    // Get a listing that we know has images
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!seller_id(display_name, business_name),
        listing_images(id, url, alt_text, is_primary, sort_order)
      `)
      .eq('title', 'Mountain Bike - Trek Marlin 7')
      .single()

    if (error) {
      console.error('❌ Error fetching specific listing:', error)
      return
    }

    console.log(`✅ Found listing: ${listing.title}`)
    console.log(`   Seller: ${listing.seller?.business_name || listing.seller?.display_name}`)
    console.log(`   Legacy images: ${listing.images?.length || 0}`)
    console.log(`   Listing images: ${listing.listing_images?.length || 0}`)

    if (listing.listing_images?.length > 0) {
      console.log('\n📸 Listing images details:')
      listing.listing_images.forEach((img, index) => {
        console.log(`${index + 1}. ${img.is_primary ? '⭐ PRIMARY' : '  '} ${img.url}`)
        console.log(`   Alt text: ${img.alt_text || 'None'}`)
        console.log(`   Sort order: ${img.sort_order}`)
      })

      // Test the image selection logic
      const primaryImage = listing.listing_images.find(img => img.is_primary)?.url || 
                          listing.listing_images[0]?.url || 
                          listing.images?.[0] || 
                          null

      console.log(`\n🎯 Selected image for display: ${primaryImage}`)
      
      // Test if the image URL is accessible
      console.log('\n🌐 Testing image URL accessibility...')
      try {
        const response = await fetch(primaryImage, { method: 'HEAD' })
        console.log(`✅ Image URL is accessible: ${response.status} ${response.statusText}`)
      } catch (fetchError) {
        console.log(`❌ Image URL not accessible: ${fetchError.message}`)
      }
    }

    if (listing.images?.length > 0) {
      console.log('\n📷 Legacy images:')
      listing.images.forEach((img, index) => {
        console.log(`${index + 1}. ${img}`)
      })
    }

    console.log('\n✅ Image handling test completed successfully!')

  } catch (error) {
    console.error('❌ Error testing specific listing images:', error)
  }
}

testSpecificListingImages()