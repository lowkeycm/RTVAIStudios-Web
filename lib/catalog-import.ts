import 'server-only';
import {baselineFilms} from './catalog';
import {admin,result,HttpError,now} from './server';
import {bunnyRequest,bunnyPlayback,getBunnyStatus} from './bunny';
type ImportRecord={video_id:string;bunny_id:string;state:string;error:string};
const titleFor=(id:string,title:string)=>`${title} [${id}]`;

export async function seedLegacyCatalog(actor:string){
 const client=admin();
 const hidden=await result<{value:string}|null>(client.from('settings').select('value').eq('key','hide_legacy').maybeSingle());
 const stamp=now();
 await result(client.from('videos').upsert(baselineFilms.map(f=>({...f,status:'Ready',published:hidden?.value==='true'?0:1,consent:1,uploaded_by:actor,created_at:stamp,updated_at:stamp})),{onConflict:'id',ignoreDuplicates:true}));
 await result(client.from('video_imports').upsert(baselineFilms.map(f=>({video_id:f.id})),{onConflict:'video_id',ignoreDuplicates:true}));
}
async function updateImport(id:string,values:Partial<ImportRecord>){await result(admin().from('video_imports').update({...values,updated_at:now()}).eq('video_id',id));}
async function importRecord(id:string){return result<ImportRecord>(admin().from('video_imports').select('*').eq('video_id',id).single());}

export async function startCatalogImport(id:string){
 const film=baselineFilms.find(f=>f.id===id);
 if(!film)throw new HttpError(400,'Choose a film from the original studio catalog.');
 const claimed=await result<{video_id:string}[]>(admin().from('video_imports').update({state:'requested',error:'',updated_at:now()}).eq('video_id',id).eq('state','queued').select('video_id'));
 if(!claimed.length)return importRecord(id);
 try{
  const response=await bunnyRequest('/fetch','POST',{url:film.source,title:titleFor(id,film.title)});
  if(!response.success)throw new HttpError(502,'Bunny could not queue this film.');
 }catch(error){
  // A timed-out provider request may already have succeeded. Reconcile by title;
  // never blindly issue a second fetch that would create a duplicate asset.
  await updateImport(id,{error:error instanceof HttpError?error.message:'Waiting to confirm the import with Bunny.'});
 }
 return importRecord(id);
}

async function verifyStream(id:string){
 const root=new URL(bunnyPlayback(id).url);
 const headers={Referer:'https://www.rtvaistudios.com/'};
 const get=async(url:URL)=>{
  if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname.slice(0,root.pathname.lastIndexOf('/')+1)))throw new Error('Unexpected stream location.');
  const response=await fetch(url,{headers,cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Stream not available yet.');
  const body=await response.text();if(!body.startsWith('#EXTM3U'))throw new Error('Invalid stream playlist.');return body;
 };
 const master=await get(root);
 const variants=master.split(/\r?\n/).filter(line=>line.trim()&&!line.startsWith('#'));
 if(!variants.length)throw new Error('No stream qualities available yet.');
 const variant=new URL(variants[0],root);
 const playlist=await get(variant);
 const segment=playlist.split(/\r?\n/).find(line=>line.trim()&&!line.startsWith('#'));
 if(!segment)throw new Error('No playable video segments yet.');
 const segmentUrl=new URL(segment,variant);
 if(segmentUrl.origin!==root.origin||!segmentUrl.pathname.startsWith(root.pathname.slice(0,root.pathname.lastIndexOf('/')+1)))throw new Error('Unexpected video segment location.');
 const response=await fetch(segmentUrl,{headers:{...headers,Range:'bytes=0-1023'},cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok||!response.body)throw new Error('Video segment unavailable.');
 const reader=response.body.getReader();const first=await reader.read();await reader.cancel();
 if(!first.value?.length)throw new Error('Empty video segment.');
}

export async function checkCatalogImport(id:string){
 const film=baselineFilms.find(f=>f.id===id);if(!film)throw new HttpError(400,'Unknown catalog film.');
 let record=await importRecord(id);
 if(['queued','complete','error'].includes(record.state))return record;
 if(!record.bunny_id){
  const list=await bunnyRequest('?itemsPerPage=100&search='+encodeURIComponent(`[${id}]`));
  const matches=(list.items||[]).filter((video:{title:string})=>video.title===titleFor(id,film.title));
  if(matches.length>1)throw new HttpError(409,'Multiple matching imports need administrator review.');
  if(!matches.length)return record;
  const bunnyId=matches[0].guid;
  if(!/^[a-f0-9-]{36}$/i.test(bunnyId))throw new HttpError(502,'Invalid import reference.');
  await updateImport(id,{bunny_id:bunnyId,state:'processing',error:''});record=await importRecord(id);
 }
 const status=await getBunnyStatus(record.bunny_id);
 if(status.status==='Processing failed'){await updateImport(id,{state:'error',error:'Bunny could not encode this film. The original remains live.'});return importRecord(id);}
 if(status.status!=='Ready')return {...record,progress:status.status};
 try{await verifyStream(record.bunny_id);}catch{await updateImport(id,{error:'Encoding finished; waiting for stream delivery verification.'});return importRecord(id);}
 await result(admin().rpc('rtv_activate_bunny_import',{p_id:id,p_bunny_id:record.bunny_id}));
 return importRecord(id);
}
