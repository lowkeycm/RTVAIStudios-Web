import 'server-only';
import { createClient } from '@supabase/supabase-js';
export function admin() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SECRET_KEY;
  if(!url||!key) throw new Error('The studio database connection is not configured.');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function result<T=any>(query:PromiseLike<{data:T|null,error:any}>):Promise<T> {
  const {data,error}=await query; if(error) throw error; return data as T;
}
