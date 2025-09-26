import { supabase } from '@/integrations/supabase/client';

const ANON_ID_KEY = 'analytics_anon_id';

function generateId(): string {
  return (crypto && 'randomUUID' in crypto)
    ? (crypto as any).randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getAnonId(): string {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export async function logPageView(pathname: string) {
  try {
    const anonId = getAnonId();
    const ref = document.referrer || null;
    const ua = navigator.userAgent;
    await supabase.from('page_views').insert({
      anon_id: anonId,
      path: pathname,
      referrer: ref,
      user_agent: ua,
    });
  } catch (e) {
    // fail silently in production; avoid breaking UX
    console.warn('Analytics log error', e);
  }
}

// Presence using Realtime (broadcast/presence API)
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
    try { channel.unsubscribe(); } catch {}
  };
}


