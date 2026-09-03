-- Blog CMS tables for public-facing blog with likes, comments, shares.
-- Run in Supabase SQL Editor before enabling the webapp routes.

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    author_name TEXT DEFAULT 'Swopify Team',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id TEXT,
    user_name TEXT DEFAULT 'Anonymous',
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS blog_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    platform TEXT DEFAULT 'copy',
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_active ON blog_posts(is_published, is_active);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post ON blog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_shares_post ON blog_shares(post_id);

ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_title_length CHECK (char_length(trim(title)) BETWEEN 1 AND 180);
ALTER TABLE blog_comments ADD CONSTRAINT blog_comments_content_length CHECK (char_length(trim(content)) BETWEEN 1 AND 2000);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;
CREATE POLICY "Public can read published blog posts" ON blog_posts FOR SELECT USING (is_published = true AND is_active = true);
DROP POLICY IF EXISTS "Public can read active blog comments" ON blog_comments;
CREATE POLICY "Public can read active blog comments" ON blog_comments FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public can add blog comments" ON blog_comments;
CREATE POLICY "Public can add blog comments" ON blog_comments FOR INSERT WITH CHECK (char_length(trim(content)) BETWEEN 1 AND 2000);
DROP POLICY IF EXISTS "Public can add blog likes" ON blog_likes;
CREATE POLICY "Public can add blog likes" ON blog_likes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can read blog likes" ON blog_likes;
CREATE POLICY "Public can read blog likes" ON blog_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can add blog shares" ON blog_shares;
CREATE POLICY "Public can add blog shares" ON blog_shares FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can read blog shares" ON blog_shares;
CREATE POLICY "Public can read blog shares" ON blog_shares FOR SELECT USING (true);
