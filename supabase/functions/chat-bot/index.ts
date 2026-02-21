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

        if (!apiKey) {
            console.error('AI_SERVICE_API_KEY is not set');
            return new Response(JSON.stringify({ error: 'AI configuration error' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        if (!message || !sessionId) {
            return new Response(JSON.stringify({ error: 'Missing message or sessionId' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const supabase = createClient(supabaseUrl!, supabaseKey!)
        console.log('Fetching dynamic context...');

        // 1. Fetch Dynamic Context from DB
        const [destinationsRes, settingsRes] = await Promise.all([
            supabase.from('destinations').select('*').eq('is_active', true).limit(10), // Limit to avoid prompt overflow
            supabase.from('site_settings').select('*').in('key', ['ai_persona', 'ai_special_instructions', 'ai_company_knowledge'])
        ]);

        if (destinationsRes.error) console.error('Destinations fetch error:', destinationsRes.error);
        if (settingsRes.error) console.error('Settings fetch error:', settingsRes.error);

        const destinations = destinationsRes.data || [];
        const settings = settingsRes.data || [];

        console.log(`Found ${destinations.length} destinations and ${settings.length} settings`);

        const persona = settings.find(s => s.key === 'ai_persona')?.value ||
            "You are the Ryoko Tours Assistant, a professional and friendly customer service bot for Ryoko Tours Africa.";

        const instructions = settings.find(s => s.key === 'ai_special_instructions')?.value ||
            "Be professional, warm, and helpful. If you don't know something, ask them to leave a message.";

        const knowledge = settings.find(s => s.key === 'ai_company_knowledge')?.value || "";

        // Format destinations for the prompt - safely handling possible nulls
        const toursContext = destinations.map(d => {
            const descSnippet = (d.description || '').slice(0, 100);
            return `- ${d.name}: ${d.location || 'N/A'}. Price from KSh ${d.resident_price || 0} (Resident) / $${d.non_resident_price || 0} (Non-Resident). ${descSnippet}...`;
        }).join('\n');

        console.log('Prepared context, calling OpenRouter...');

        // 2. Prepare Grounding Context
        const context = `
${persona}

**Company Knowledge Base (Ryoko Tours Africa):**
${knowledge}

**Company Rules & behavior:**
${instructions}

**Our Available Tours & Pricing (Real-time):**
${toursContext}

**General Guidelines:**
- Always prefer the data provided above over any pre-trained internal knowledge.
- If a user asks about a tour not listed, tell them we are constantly adding new adventures and suggest they contact us.
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
            console.error('OpenRouter Error:', errorMsg);
            throw new Error(`AI Provider Error: ${errorMsg}`);
        }

        const aiData = await response.json();
        const aiMessage = aiData.choices[0].message.content;
        console.log('AI Response generated, storing in DB...');

        // 3. Store the AI response in chat_messages
        const { error: insertError } = await supabase
            .from('chat_messages')
            .insert({
                session_id: sessionId,
                sender_role: 'assistant',
                content: aiMessage
            })

        if (insertError) {
            console.error('AI message store error:', insertError);
            throw insertError;
        }

        console.log('AI message stored successfully');

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
