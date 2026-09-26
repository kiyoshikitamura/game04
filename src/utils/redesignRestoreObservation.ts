import { FunctionRegion } from '@supabase/supabase-js';
import { supabase } from './supabase';
/** Best-effort telemetry. No gameplay response parser, state write, or automatic retry. */
export async function observeRedesignRestore(observedVersion: number, requestId = crypto.randomUUID()): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('game04-redesign-api', {
    body: { action: 'observe_state_restore', payload: { observedVersion }, requestId },
    region: FunctionRegion.EuCentral1,
  });
  return !error && data?.observation?.recorded === true;
}
