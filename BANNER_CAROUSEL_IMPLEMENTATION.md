# Banner Carousel Implementation

## Overview
Dynamic banner carousel system for displaying promotional content on the home page with auto-scroll functionality and database-driven content.

## Features
- Auto-scrolling carousel (5-second intervals)
- Manual navigation with arrow buttons
- Dot indicators for slide position
- Responsive design (mobile and desktop)
- Database-driven content
- Click-through links with custom CTAs
- Smooth transitions and animations

## Database Schema

### Banners Table
```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## Setup Instructions

### 1. Run Database Migration
Execute the SQL migration file to create the banners table:
```bash
# Apply the migration in Supabase SQL Editor
cat banners_migration.sql
```

### 2. Configure Storage (Optional)
If you want to upload banner images to Supabase Storage:

1. Go to Supabase Dashboard > Storage
2. Create a new bucket called `banners`
3. Set it to public
4. Configure RLS policies:

```sql
-- Allow public read access
CREATE POLICY "Public can view banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload banners"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');
```

### 3. Add Banner Images
You can use:
- External URLs (Unsplash, Cloudinary, etc.)
- Supabase Storage URLs
- Your own CDN

Recommended image dimensions: 1200x400px (3:1 ratio)

## Managing Banners

### Add a New Banner
```sql
INSERT INTO banners (title, description, image_url, link_url, link_text, display_order)
VALUES (
  'Summer Sale',
  'Get amazing deals on all items this summer',
  'https://your-image-url.com/banner.jpg',
  '/browse?category=deals',
  'Shop Now',
  4
);
```

### Update a Banner
```sql
UPDATE banners
SET 
  title = 'Updated Title',
  description = 'Updated description',
  image_url = 'https://new-image-url.com/banner.jpg'
WHERE id = 'banner-uuid';
```

### Deactivate a Banner
```sql
UPDATE banners
SET is_active = false
WHERE id = 'banner-uuid';
```

### Reorder Banners
```sql
UPDATE banners SET display_order = 1 WHERE id = 'banner-1-uuid';
UPDATE banners SET display_order = 2 WHERE id = 'banner-2-uuid';
UPDATE banners SET display_order = 3 WHERE id = 'banner-3-uuid';
```

### Delete a Banner
```sql
DELETE FROM banners WHERE id = 'banner-uuid';
```

## Component Usage

The banner carousel is automatically included on the home page:

```tsx
import { BannerCarousel } from "@/components/home/banner-carousel"

<BannerCarousel />
```

## Customization

### Change Auto-Scroll Interval
Edit `components/home/banner-carousel.tsx`:
```tsx
// Change from 5000ms (5 seconds) to your preferred interval
const interval = setInterval(() => {
  nextSlide()
}, 5000) // Change this value
```

### Adjust Banner Height
Edit `components/home/banner-carousel.tsx`:
```tsx
// Change the height classes
<div className="relative w-full h-[400px] md:h-[500px]">
```

### Customize Colors
The component uses the theme colors:
- Primary button: `bg-[#32cd32]` (lime green)
- Hover: `bg-[#28a428]`

## Best Practices

### Image Guidelines
1. Use high-quality images (1200x400px minimum)
2. Optimize images for web (compress to reduce load time)
3. Use consistent aspect ratios
4. Ensure text is readable on images (use dark images or overlays)

### Content Guidelines
1. Keep titles short and impactful (max 60 characters)
2. Descriptions should be concise (max 120 characters)
3. Use clear, action-oriented CTAs
4. Test links before publishing
5. Limit to 3-5 active banners for best UX

### Performance
1. Use CDN for images when possible
2. Implement lazy loading for images
3. Compress images before upload
4. Consider using WebP format

## Admin Panel (Future Enhancement)
Consider building an admin panel for easier banner management:
- Upload images directly
- Preview banners before publishing
- Schedule banners for specific dates
- Track click-through rates
- A/B testing capabilities

## Troubleshooting

### Banners Not Showing
1. Check if banners exist in database: `SELECT * FROM banners WHERE is_active = true;`
2. Verify RLS policies allow public read access
3. Check browser console for errors
4. Ensure image URLs are accessible

### Images Not Loading
1. Verify image URLs are correct and accessible
2. Check CORS settings if using external images
3. Ensure Supabase Storage bucket is public (if using Storage)
4. Check image file formats (JPG, PNG, WebP supported)

### Auto-Scroll Not Working
1. Check if there are multiple banners (needs 2+ to scroll)
2. Verify useEffect dependencies
3. Check browser console for JavaScript errors

## Example Banners

### Welcome Banner
```sql
INSERT INTO banners (title, description, image_url, link_url, link_text, display_order)
VALUES (
  'Welcome to Swopify',
  'Trade, barter, and exchange items with your community',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
  '/browse',
  'Start Trading',
  1
);
```

### Promotional Banner
```sql
INSERT INTO banners (title, description, image_url, link_url, link_text, display_order)
VALUES (
  'Limited Time Offer',
  'Get 100 free Trade Coins when you sign up today',
  'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop',
  '/auth/sign-up',
  'Claim Offer',
  2
);
```

### Feature Highlight
```sql
INSERT INTO banners (title, description, image_url, link_url, link_text, display_order)
VALUES (
  'Introducing Time Banking',
  'Exchange services and skills with your community',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
  '/how-it-works',
  'Learn More',
  3
);
```
