import {authClient} from '@/lib/supabase/server';
export async function GET(req:Request){const url=new URL(req.url);const code=url.searchParams.get('code');if(code){const {error}=await (await authClient()).auth.exchangeCodeForSession(code);if(!error)return Response.redirect(new URL('/desk',url),303);}return Response.redirect(new URL('/team-login',url),303);}
