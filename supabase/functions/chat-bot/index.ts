import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { message, sessionId, history } = await req.json()
        const apiKey = Deno.env.get('AI_SERVICE_API_KEY')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!message || !sessionId) {
            return new Response(JSON.stringify({ error: 'Missing message or sessionId' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const supabase = createClient(supabaseUrl!, supabaseKey!)

        // 1. Prepare Grounding Context (Business Knowledge)
        const context = `
You are the Ryoko Tours Assistant, a professional and friendly customer service bot for Ryoko Tours Africa.
Your goal is to help users plan their dream safari or tour in Kenya.

**Company Profile:**
- Values: Passion for Africa, Safety First, Sustainable Tourism, Expert Guides.
- Specialized in: Mount Kenya, Serengeti, Kilimanjaro, and cultural experiences.

**Grounding Data:**
- Featured Tours: Serengeti Wildlife Expedition ($2199), Kilimanjaro Summit Challenge ($2799), Mount Kenya Safari ($1299).
- Locations: Serengeti National Park, Mount Kenya, Kilimanjaro.
- Services: Adventure Hiking, Wildlife Safaris, Cultural Experiences, Luxury Camping.

**Guidelines:**
- Be professional, warm, and helpful.
- If you don't know something, ask them to leave a message in the details and an agent will get back to them.
- Encourage booking if they seem interested in a specific destination.
- Keep responses concise and engaging.
`;

        // 2. Call OpenRouter AI (which hosts the requested Gemini model)
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://ryoko-tours.ke', // Optional, replaces localhost for OpenRouter metrics
                'X-Title': 'Ryoko Tours Assistant'
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001", // Using the latest Gemini model via OpenRouter
                messages: [
                    { role: 'system', content: context },
                    ...history.map((h: any) => ({
                        role: h.role === 'user' ? 'user' : 'assistant',
                        content: h.content
                    })),
                    { role: 'user', content: message }
                ]
            })
        })

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`AI Provider Error: ${errorMsg}`);
        }

        const aiData = await response.json()
        const aiMessage = aiData.choices[0].message.content

        // 3. Store the AI response in chat_messages
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                session_id: sessionId,
                sender_role: 'assistant',
                content: aiMessage
            })

        if (insertError) throw insertError

        return new Response(JSON.stringify({ content: aiMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
