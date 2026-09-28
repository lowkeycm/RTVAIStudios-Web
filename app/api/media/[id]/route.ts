import {admin,result,currentMember,HttpError} from '@/lib/server';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){try{
 const v=await result<any>(admin().from('videos').select('*').eq('id',(await params).id).eq('provider','supabase').eq('status','Ready').maybeSingle());
 if(!v)throw new HttpError(404,'Video not found.');
 if(!(v.published&&v.consent)){const m=await currentMember();if(!m||!['admin','production'].includes(m.role))throw new HttpError(404,'Video not found.');}
 const {data,error}=await admin().storage.from('rtv-production').createSignedUrl(v.object_key,300);if(error||!data)throw new Error('Playback unavailable');
 return new Response(null,{status:307,headers:{Location:data.signedUrl,'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
}catch(e:any){return Response.json({error:e instanceof HttpError?e.message:'Video unavailable.'},{status:e instanceof HttpError?e.status:503,headers:{'Cache-Control':'private, no-store'}});}}
