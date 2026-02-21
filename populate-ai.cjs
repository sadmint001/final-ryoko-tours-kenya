const { createClient } = require('@supabase/supabase-js');

const url = "https://zpqccmbnvzwbcoeirffz.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcWNjbWJudnp3YmNvZWlyZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjE3NjEsImV4cCI6MjA2OTQzNzc2MX0._m2n89THO0ZYhHvrz9Sx0h9Sx4elUlw7ZK1cyCrcpEA";

const supabase = createClient(url, key);

const knowledge = `Ryoko Tours Africa is a premier travel and safari company based in Kenya. The name "Ryoko" means "journey" in Japanese, reflecting our commitment to creating meaningful travel experiences.

Our Mission: To craft transformative travel experiences that immerse guests in Africa's soul, fostering cultural connection, growth, and adventure.
Our Vision: To position Kenya and Africa as global leaders in authentic, sustainable tourism.

Core Values:
- Passion for Africa: Showcasing the continent's incredible diversity.
- Safety First: Adhering to international safety standards.
- Sustainable Tourism: Promoting eco-tourism that uplifts communities.
- Expert Guides: Providing deep storytelling and cultural heritage.

Why Us:
1. Exceptional Service: 24/7 dedicated support before and during your trip.
2. Unforgettable Experiences: Handpicked hidden gems from the Maasai Mara to Diani.
3. Safety Always: Fully insured vehicles and certified, warm professionals.
4. Stories Worth Telling: We focus on genuine encounters and authentic moments.

Our Services:
We specialize in curated safaris, coastal escapes, cultural tours, and personalized itineraries across Kenya.

Site Structure & Pages:
- Home: Featured tours and travel stories.
- Destinations: Our full catalog of safaris and experiences.
- About Us: Detailed history and mission statement.
- Why Us: Our core pillars and competitive advantages.
- Blog: Travel tips, guides, and stories from the field.
- Contact: Support and custom itinerary requests.`;

async function run() {
    console.log('Inserting ai_company_knowledge...');
    // We attempt to upsert. If RLS blocks it, we will know.
    const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'ai_company_knowledge', value: knowledge }, { onConflict: 'key' });

    if (error) {
        console.error('Error:', error);
        console.log('\nNOTE: If you see an RLS error, please go to the Admin Dashboard (AI Settings tab) and click "Save" to manually save this information.');
    } else {
        console.log('Successfully updated ai_company_knowledge');
    }
}

run();
