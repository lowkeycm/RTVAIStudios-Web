import {authClient} from '@/lib/supabase/server';
import {admin, result} from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const flowId = url.searchParams.get('sb_flow_id');
  if (!code) return Response.redirect(new URL('/reset-password', url), 303);
  if (code) {
    const client = await authClient();
    const {data, error} = await client.auth.exchangeCodeForSession(code, flowId ? {flowId} : undefined);
    if (!error && data.user?.email) {
      const member = await result(admin().from('members').select('email').eq('email', data.user.email.toLowerCase()).eq('active', 1).maybeSingle());
      if (member) return Response.redirect(new URL('/reset-password', url), 303);
      await client.auth.signOut();
    }
  }
  return Response.redirect(new URL('/forgot-password?error=invalid-link', url), 303);
}
