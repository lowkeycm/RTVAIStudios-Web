import 'server-only';
import {admin,result,HttpError} from './server';
import {bunnyRequest,bunnyPlayback} from './bunny';

export async function prepareClientDownload(video:{provider:string;object_key:string}){
 if(video.provider!=='bunny')throw new HttpError(409,'Upload this finished video to Bunny Stream before preparing customer delivery.');
 const metadata=await bunnyRequest('/'+encodeURIComponent(video.object_key));
 if(!metadata.hasMP4Fallback)throw new HttpError(409,'This video has no downloadable MP4 yet. Enable MP4 Fallback in the Bunny library’s Encoding settings, then upload the finished video again. Existing uploads do not gain MP4 files automatically.');
 const heights=String(metadata.availableResolutions||'').split(',').map(value=>parseInt(value,10)).filter(value=>Number.isFinite(value)&&value>0).sort((a,b)=>b-a);
 const candidates=heights.filter(height=>height<=1080);
 if(!candidates.length&&heights.length===1)candidates.push(heights[0]);
 for(const height of candidates){
  const file='play_'+height+'p.mp4';
  const response=await fetch(bunnyPlayback(video.object_key,file).url,{method:'HEAD',cache:'no-store',signal:AbortSignal.timeout(10000),headers:{Referer:'https://www.rtvaistudios.com/'}});
  if(response.ok)return {file,label:height+'p MP4'};
 }
 throw new HttpError(409,'The MP4 download is not available yet. Check processing and MP4 Fallback in Bunny before sending this video.');
}

export async function findClientDelivery(key:string){
 if(!/^[a-f0-9]{64}$/.test(key))return null;
 const delivery=await result<any>(admin().from('client_deliveries').select('*,videos(*)').eq('access_key',key).eq('enabled',true).maybeSingle());
 if(!delivery||!delivery.videos||delivery.videos.deleted_at||delivery.videos.status!=='Ready')return null;
 return delivery;
}
