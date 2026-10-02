import {z} from 'zod';
import type {SupabaseClient} from '@supabase/supabase-js';

export const memberChanges = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  role: z.enum(['admin', 'sales', 'production']),
  active: z.boolean(),
});

export function memberEditError(actor: {email: string; role: string}, target: string, changes: z.infer<typeof memberChanges>) {
  if (actor.role !== 'admin') return 'Only administrators can change team access.';
  if (actor.email === target && (!changes.active || changes.role !== 'admin')) return 'Another administrator must change your own access.';
  return null;
}

// This client must use the implicit flow: the recipient is not the administrator's browser.
// Supabase delivers through the studio's configured SMTP provider. Never return tokens.
export async function sendMemberSetupEmail(client: SupabaseClient, member: {email: string; name: string; active: number}, redirectTo: string) {
  if (!member.active) return {sent: false, error: 'Activate this member before sending a setup email.'};
  try {
    const invitation = await client.auth.admin.inviteUserByEmail(member.email, {
      redirectTo, data: {full_name: member.name},
    });
    if (!invitation.error) return {sent: true};
    // Confirmed accounts need a recovery link, not a second account.
    if (['email_exists', 'user_already_exists'].includes(invitation.error.code || '')) {
      const recovery = await client.auth.resetPasswordForEmail(member.email, {redirectTo});
      if (!recovery.error) return {sent: true};
    }
  } catch { /* Preserve the member and allow a deliberate retry. */ }
  return {sent: false, error: 'The setup email could not be sent. Wait a minute, then use Send setup email to retry.'};
}
