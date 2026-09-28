import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export async function authClient(){
  const jar=await cookies();
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) throw new Error('Studio sign-in is not configured.');
  return createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll:items=>{for(const item of items)jar.set(item.name,item.value,{...item.options,secure:process.env.NODE_ENV==='production',sameSite:'lax'});}}});
}
export async function getStudioUser(){
  const client=await authClient();
  const {data:{user}}=await client.auth.getUser();
  return user?.email?{email:user.email.toLowerCase(),displayName:user.user_metadata?.full_name||user.email,userId:user.id}:null;
}
