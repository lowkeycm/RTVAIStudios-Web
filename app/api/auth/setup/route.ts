import {z} from 'zod';
import {authClient} from '@/lib/supabase/server';
import {admin,result,safe,body,sameOrigin,rateLimit,HttpError} from '@/lib/server';

export async function POST(req: Request) {
  return safe(async () => {
    sameOrigin(req);
    await rateLimit(req,'team-setup-session',15);
    const tokens=z.object({access_token:z.string().min(1).max(12000),refresh_token:z.string().min(1).max(2000)}).parse(await body(req));
    const client=await authClient();
    const {data:{user},error}=await client.auth.getUser(tokens.access_token);
    if(error||!user?.email)throw new HttpError(401,'This setup link has expired. Ask your administrator to send a new one.');
    const member=await result(admin().from('members').select('email').eq('email',user.email.toLowerCase()).eq('active',1).maybeSingle());
    if(!member)throw new HttpError(403,'This account does not have active studio access.');
    const session=await client.auth.setSession(tokens);
    if(session.error)throw new HttpError(401,'This setup link has expired. Ask your administrator to send a new one.');
    return {ok:true};
  });
}
