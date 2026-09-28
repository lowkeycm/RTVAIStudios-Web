import {z} from 'zod';
import {authClient} from '@/lib/supabase/server';
import {admin, result, safe, body, sameOrigin, rateLimit, requireMember, HttpError} from '@/lib/server';

export async function POST(req: Request) {
  return safe(async () => {
    sameOrigin(req);
    const {email} = z.object({email: z.string().trim().email().max(200).transform(value => value.toLowerCase())}).parse(await body(req));
    await rateLimit(req, 'password-recovery', 5);
    const member = await result(admin().from('members').select('email').eq('email', email).eq('active', 1).maybeSingle());
    // Keep the recovery response identical for addresses outside the team.
    if (!member) return {ok: true};
    const client = await authClient();
    const {error} = await client.auth.resetPasswordForEmail(email, {
      redirectTo: new URL('/auth/recovery', req.url).toString(),
    });
    if (error) {
      console.error('Password recovery delivery failed:', error.code || 'unknown');
      throw new HttpError(503, 'Password recovery email is unavailable. Please contact your studio administrator.');
    }
    return {ok: true};
  });
}

export async function PATCH(req: Request) {
  return safe(async () => {
    sameOrigin(req);
    await requireMember();
    const {password} = z.object({password: z.string().min(12, 'Use at least 12 characters.').max(128, 'Use no more than 128 characters.')}).parse(await body(req));
    await rateLimit(req, 'password-change', 5);
    const client = await authClient();
    const {error} = await client.auth.updateUser({password});
    if (error) {
      console.error('Password update failed:', error.code || 'unknown');
      if (error.code === 'weak_password' || error.code === 'same_password') {
        throw new HttpError(400, 'Choose a different, stronger password with at least 12 characters.');
      }
      throw new HttpError(400, 'This reset session is no longer valid. Request a new reset link.');
    }
    // End the recovered session and revoke other refresh sessions after the change.
    const {error: signOutError} = await client.auth.signOut({scope: 'global'});
    if (signOutError) console.error('Password-change sign-out failed:', signOutError.code || 'unknown');
    return {ok: true};
  });
}
