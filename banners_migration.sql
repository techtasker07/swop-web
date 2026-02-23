-- Create banners table for promotional content
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
  ON banners
  FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can manage banners (for admin)
CREATE POLICY "Authenticated users can manage banners"
  ON banners
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX idx_banners_active_order ON banners(is_active, display_order);

-- Insert sample banners
INSERT INTO banners (title, description, image_url, link_url, link_text, display_order) VALUES
('Welcome to Swopify', 'Trade, barter, and exchange items with your community', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop', '/browse', 'Start Trading', 1),
('Join Our Community', 'Connect with thousands of traders in your area', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop', '/auth/sign-up', 'Sign Up Now', 2),
('B2B Marketplace', 'Professional services for your business needs', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop', '/b2b', 'Explore B2B', 3);
