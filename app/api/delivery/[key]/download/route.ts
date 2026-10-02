import {findClientDelivery} from '@/lib/client-delivery';
import {bunnyPlayback} from '@/lib/bunny';
export const maxDuration=300;
export async function GET(req:Request,{params}:{params:Promise<{key:string}>}){
 const delivery=await findClientDelivery((await params).key);
 if(!delivery)return Response.json({error:'This delivery is unavailable or has been withdrawn.'},{status:404});
 const video=delivery.videos;
 if(video.provider!=='bunny'||!/^play_\d+p\.mp4$/.test(delivery.download_file))return Response.json({error:'Download unavailable.'},{status:404});
 const headers:Record<string,string>={Referer:'https://www.rtvaistudios.com/'};
 const range=req.headers.get('range');if(range&&/^bytes=\d*-\d*$/.test(range))headers.Range=range;
 let response:Response;
 try{response=await fetch(bunnyPlayback(video.object_key,delivery.download_file).url,{headers,cache:'no-store',signal:req.signal});}
 catch{return Response.json({error:'The download could not start. Please try again.'},{status:502});}
 if(!response.ok||!response.body)return Response.json({error:'The download is temporarily unavailable. Please contact the studio.'},{status:502});
 const filename=(video.title||'RTV-video').replace(/[^a-zA-Z0-9 _-]/g,'').slice(0,100)||'RTV-video';
 const output=new Headers({'Content-Type':'video/mp4','Content-Disposition':'attachment; filename="'+filename+'.mp4"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});
 for(const name of ['content-length','content-range','accept-ranges']){const value=response.headers.get(name);if(value)output.set(name,value);}
 // Stream the file; never buffer a customer's entire video into function memory.
 return new Response(response.body,{status:response.status,headers:output});
}
