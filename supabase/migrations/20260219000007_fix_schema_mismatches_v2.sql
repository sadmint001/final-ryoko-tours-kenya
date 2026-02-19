-- Fix 1: Add missing columns to page_views
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS anon_id TEXT;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS screen_resolution TEXT;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS language TEXT;

-- Fix 2: Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Fix 3: Recreate blog_comments with explicit FK to profiles for PostgREST joins
DROP TABLE IF EXISTS public.blog_comments CASCADE;

CREATE TABLE public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id INT NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    -- Reference public.profiles(id) instead of auth.users(id) for easier PostgREST joins
    -- profiles.id is typically linked to auth.users.id anyway
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view blog comments" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert their own comments" ON public.blog_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.blog_comments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.blog_comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any blog comment" ON public.blog_comments FOR DELETE USING (public.is_admin(auth.uid()));

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON public.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
