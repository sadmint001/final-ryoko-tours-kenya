import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';

const ANON_ID_KEY = 'ryoko_anon_id';
const SESSION_ID_KEY = 'ryoko_session_id';
const CONSENT_KEY = 'ryoko_cookie_consent';

function generateId(): string {
  return (crypto && 'randomUUID' in crypto)
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getCookieConsent(): boolean {
  return Cookies.get(CONSENT_KEY) === 'true';
}

export function setCookieConsent(consent: boolean) {
  Cookies.set(CONSENT_KEY, consent.toString(), { expires: 365, sameSite: 'lax' });
}

export function getAnonId(): string {
  let id = Cookies.get(ANON_ID_KEY);
  if (!id) {
    id = generateId();
    Cookies.set(ANON_ID_KEY, id, { expires: 365, sameSite: 'lax' });
  }
  return id;
}

export function getSessionId(): string {
  let id = Cookies.get(SESSION_ID_KEY);
  if (!id) {
    id = generateId();
    // Session cookie (no expires attribute)
    Cookies.set(SESSION_ID_KEY, id, { sameSite: 'lax' });
  }
  return id;
}

const GEO_CACHE_KEY = 'ryoko_geo_data';

export async function getGeoLocation(): Promise<any> {
  const cached = Cookies.get(GEO_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn('Geo cache parse error', e);
    }
  }

  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    const geoData = {
      country_name: data.country_name,
      country_code: data.country_code,
      continent_name: data.continent_code === 'AF' ? 'Africa' :
        data.continent_code === 'EU' ? 'Europe' :
          data.continent_code === 'NA' ? 'North America' :
            data.continent_code === 'SA' ? 'South America' :
              data.continent_code === 'AS' ? 'Asia' :
                data.continent_code === 'OC' ? 'Oceania' :
                  data.continent_code === 'AN' ? 'Antarctica' : 'Unknown',
      continent_code: data.continent_code
    };

    // Cache for the session
    Cookies.set(GEO_CACHE_KEY, JSON.stringify(geoData), { sameSite: 'lax' });
    return geoData;
  } catch (e) {
    console.warn('Geolocation fetch error', e);
    return null;
  }
}

import { visitorTracking } from '@/utils/visitor-tracking';

export async function logPageView(pathname: string) {
  if (!getCookieConsent()) return;

  try {
    const { id: visitorId } = visitorTracking.getVisitorId();
    const { isNewSession } = visitorTracking.getSessionId();

    // Fetch geo data
    const geo = await getGeoLocation();

    // Invoke robust tracking RPC
    await (supabase.rpc as any)('track_visit', {
      p_visitor_id: visitorId,
      p_region: geo?.continent_name,
      p_is_new_session: isNewSession
    });

    // Optionally still log to the raw page_views table for backwards compatibility
    // if requested by user or if existing components rely on it
    /*
    await (supabase.from('page_views') as any).insert({
      anon_id: visitorId,
      session_id: (visitorTracking.getSessionId()).id,
      page_path: pathname,
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    });
    */
  } catch (e) {
    console.warn('Analytics log error', e);
  }
}

export async function logEvent(category: string, action: string, label?: string, value?: number) {
  if (!getCookieConsent()) return;

  try {
    const anonId = getAnonId();
    const sessionId = getSessionId();

    await (supabase.from('analytics_events') as any).insert({
      anon_id: anonId,
      session_id: sessionId,
      category,
      action,
      label,
      value,
      page_path: window.location.pathname,
    });
  } catch (e) {
    console.warn('Event log error', e);
  }
}

// Presence using Realtime
export function subscribePresence(onChange: (count: number) => void) {
  const channel = (supabase as any).channel('online-users', {
    config: { presence: { key: getAnonId() } },
  });

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const ids = new Set<string>();
    Object.values(state).forEach((arr: any) => {
      (arr as any[]).forEach((m) => ids.add(m.presence_ref || m.user_id || JSON.stringify(m)));
    });
    onChange(ids.size);
  });

  channel.subscribe(async (status: string) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ online_at: new Date().toISOString() });
    }
  });

  return () => {
    try { channel.unsubscribe(); } catch { }
  };
}

/**
 * Professional Blog View tracking:
 * - Only counts once per session per blog post
 * - Respects cookie consent
 * - Uses session-based cookies (ryoko_viewed_blog_{id})
 */
export async function logBlogView(postId: string | number, currentViews: number) {
  if (!getCookieConsent()) return;

  const cookieName = `ryoko_viewed_blog_${postId}`;

  // Check if already viewed in this session
  if (Cookies.get(cookieName)) {
    return;
  }

  try {
    // Increment in Supabase
    const { error } = await (supabase
      .from('blog_posts') as any)
      .update({ views: (currentViews || 0) + 1 })
      .eq('id', postId);

    if (error) throw error;

    // Set session cookie to prevent duplicate counts
    Cookies.set(cookieName, 'true', { sameSite: 'lax' });

    // Also log as a general event for aggregate analytics
    await logEvent('blog', 'view', postId.toString());
  } catch (e) {
    console.warn('Blog view log error', e);
  }
}


