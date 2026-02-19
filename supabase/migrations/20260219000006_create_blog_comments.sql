-- Create blog_comments table
DROP TABLE IF EXISTS public.blog_comments CASCADE;
CREATE TABLE public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id INT NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Anyone can view comments
CREATE POLICY "Anyone can view blog comments"
ON public.blog_comments
FOR SELECT
USING (true);

-- 2. Authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert their own comments"
ON public.blog_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.blog_comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.blog_comments
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Admins can delete any comment
CREATE POLICY "Admins can delete any blog comment"
ON public.blog_comments
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON public.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
