-- Update admin_activity action check constraint to include new actions
ALTER TABLE public.admin_activity DROP CONSTRAINT IF EXISTS admin_activity_action_check;

ALTER TABLE public.admin_activity ADD CONSTRAINT admin_activity_action_check CHECK (
  action IN (
    'destination_create',
    'destination_update',
    'destination_delete',
    'destination_duplicate',
    'destination_toggle_active',
    'destination_bulk_delete',
    'destination_bulk_toggle_active',
    'destination_update_image',
    'destination_activate',
    'destination_deactivate'
  )
);
