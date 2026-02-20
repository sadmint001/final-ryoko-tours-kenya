import { supabase } from './src/integrations/supabase/client';

async function check() {
    console.log('--- Checking RPC Existence ---');

    try {
        const { data, error } = await (supabase.rpc as any)('get_global_analytics');
        if (error) {
            console.log('get_global_analytics error:', error.message || error);
        } else {
            console.log('get_global_analytics success:', data);
        }
    } catch (e) {
        console.log('get_global_analytics exception:', e);
    }

    try {
        const { data, error } = await (supabase.rpc as any)('track_visit', {
            p_visitor_id: '00000000-0000-0000-0000-000000000000',
            p_region: 'Test',
            p_is_new_session: false
        });
        if (error) {
            console.log('track_visit error:', error.message || error);
        } else {
            console.log('track_visit success:', data);
        }
    } catch (e) {
        console.log('track_visit exception:', e);
    }
}

check();
