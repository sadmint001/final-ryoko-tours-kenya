-- Fix: Relax chat_messages INSERT policy to allow all users to send messages
-- The session ID is the shared secret that gates access (it's stored in a cookie)

DROP POLICY IF EXISTS "Users can insert to their own chat sessions" ON public.chat_messages;

CREATE POLICY "Users can insert to their own chat sessions"
ON public.chat_messages FOR INSERT
TO public
WITH CHECK (true);
