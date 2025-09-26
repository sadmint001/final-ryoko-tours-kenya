import { supabase } from '@/integrations/supabase/client';

export type AdminAction =
  | 'destination_create'
  | 'destination_update'
  | 'destination_delete'
  | 'destination_duplicate'
  | 'destination_toggle_active'
  | 'destination_bulk_delete'
  | 'destination_bulk_toggle_active';

export interface LogPayload {
  user_id: string;
  action: AdminAction;
  entity: 'destination';
  entity_id?: number | null;
  details?: Record<string, any> | null;
}

export async function logAdminAction(payload: LogPayload) {
  try {
    const { error } = await supabase.from('admin_activity').insert({
      user_id: payload.user_id,
      action: payload.action,
      entity: payload.entity,
      entity_id: payload.entity_id ?? null,
      details: payload.details ?? null,
    });
    if (error) throw error;
  } catch (e) {
    // Non-blocking: only log to console to avoid breaking UX
    console.warn('Failed to log admin action', e);
  }
}
