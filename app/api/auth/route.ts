import {z} from 'zod';
import {authClient} from '@/lib/supabase/server';
import {admin,result,safe,body,sameOrigin,rateLimit,HttpError} from '@/lib/server';
export async function POST(req:Request){return safe(async()=>{
 sameOrigin(req);await rateLimit(req,'login',10);
 const p=z.object({email:z.string().email().max(200).transform(v=>v.toLowerCase()),code:z.string().regex(/^\d{6,8}$/).optional(),password:z.string().min(6).max(200).optional()}).parse(await body(req));
 const member=await result<any>(admin().from('members').select('email').eq('email',p.email).eq('active',1).maybeSingle());
 if(!member)throw new HttpError(403,'Use the email your studio owner has approved.');
 const client=await authClient();
 if(p.password){const {error}=await client.auth.signInWithPassword({email:p.email,password:p.password});if(error)throw new HttpError(401,'The email or password is not correct.');}
 else if(p.code){const {error}=await client.auth.verifyOtp({email:p.email,token:p.code,type:'email'});if(error)throw new HttpError(400,'That code has expired or is not correct. Request a new code.');}
 else{const {error}=await client.auth.signInWithOtp({email:p.email,options:{shouldCreateUser:true,emailRedirectTo:new URL('/auth/callback',req.url).toString()}});if(error)throw new HttpError(503,'We could not send a sign-in code. Please try again later.');}
 return {ok:true};
});}
export async function DELETE(req:Request){return safe(async()=>{sameOrigin(req);const {error}=await (await authClient()).auth.signOut();if(error)throw error;return {ok:true};});}
