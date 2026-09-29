import {admin,HttpError} from '@/lib/server';
import {accessibleVideo} from '@/lib/video-access';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){try{
 const v=await accessibleVideo((await params).id,true);
 if(v.provider!=='supabase')throw new HttpError(404,'Video not found.');
 const {data,error}=await admin().storage.from('rtv-production').createSignedUrl(v.object_key,300);if(error||!data)throw new Error('Playback unavailable');
 return new Response(null,{status:307,headers:{Location:data.signedUrl,'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
}catch(e:any){return Response.json({error:e instanceof HttpError?e.message:'Video unavailable.'},{status:e instanceof HttpError?e.status:503,headers:{'Cache-Control':'private, no-store'}});}}
