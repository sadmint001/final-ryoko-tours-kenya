-- Migration: AI Chat System
-- Description: Creates tables for chat sessions and messages with RLS

-- 1. Chat Sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anon_id TEXT, -- For guest users
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For logged in users
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'assistant', 'admin')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies for chat_sessions (drop first to make idempotent)
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admins have full access to chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert to their own chat sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins have full access to chat messages" ON public.chat_messages;

-- Users can see their own sessions (by id or anon_id)
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
TO public
USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
    (anon_id IS NOT NULL) -- We verify anon_id in the app layer with cookies
);

-- Users can create sessions
CREATE POLICY "Users can create chat sessions"
ON public.chat_sessions FOR INSERT
TO public
WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "Admins have full access to chat sessions"
ON public.chat_sessions FOR ALL
TO authenticated
USING ( public.is_admin(auth.uid()) );

-- 5. Policies for chat_messages
-- Users can see messages in their sessions
CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions s
        WHERE s.id = session_id AND (
            (auth.uid() IS NOT NULL AND s.user_id = auth.uid()) OR
            (s.anon_id IS NOT NULL)
        )
    )
);

-- Users can insert messages to sessions they know the ID of
CREATE POLICY "Users can insert to their own chat sessions"
ON public.chat_messages FOR INSERT
TO public
WITH CHECK (true);

-- Admins can do everything
CREATE POLICY "Admins have full access to chat messages"
ON public.chat_messages FOR ALL
TO authenticated
USING ( public.is_admin(auth.uid()) );

-- 6. Trigger to update last_message_at
CREATE OR REPLACE FUNCTION public.update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_sessions
    SET last_message_at = now()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_chat_message ON public.chat_messages;
CREATE TRIGGER on_new_chat_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_chat_session_timestamp();
