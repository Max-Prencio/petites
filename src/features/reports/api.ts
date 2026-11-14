import type { ReportInput } from '@/schemas/report';
import { supabase } from '@/services/supabase';
import type { Enums } from '@/types/models';

export interface ReportTarget {
  type: Enums<'report_target'>;
  id: string;
}

export async function createReport(
  reporterId: string,
  target: ReportTarget,
  input: ReportInput,
): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    target_type: target.type,
    listing_id: target.type === 'listing' ? target.id : null,
    reported_user_id: target.type === 'user' ? target.id : null,
    conversation_id: target.type === 'conversation' ? target.id : null,
    reason: input.reason,
    details: input.details?.trim() || null,
  });
  if (error) throw error;
}
