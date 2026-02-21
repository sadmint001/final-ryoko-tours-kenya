-- Migration: AI Bot Company Knowledge
-- Description: Adds a dedicated key for comprehensive company knowledge to site_settings.

INSERT INTO public.site_settings (key, value)
VALUES 
    ('ai_company_knowledge', 'Ryoko Tours Africa is a premier travel and safari company based in Kenya. The name "Ryoko" means "journey" in Japanese, reflecting our commitment to creating meaningful travel experiences.

Our Mission: To craft transformative travel experiences that immerse guests in Africa''s soul, fostering cultural connection, growth, and adventure.
Our Vision: To position Kenya and Africa as global leaders in authentic, sustainable tourism.

Core Values:
- Passion for Africa: Showcasing the continent''s incredible diversity.
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
- Contact: Support and custom itinerary requests.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
