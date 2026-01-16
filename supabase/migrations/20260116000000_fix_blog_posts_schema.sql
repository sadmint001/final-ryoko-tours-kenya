-- Add slug and likes to blogs table
ALTER TABLE public.blogs
ADD COLUMN slug TEXT UNIQUE,
ADD COLUMN likes INT DEFAULT 0;

-- Rename blogs to blog_posts
ALTER TABLE public.blogs
RENAME TO blog_posts;