import {z} from 'zod';
import {getStudioUser} from '@/lib/supabase/server';
import {admin,result,currentMember,requireMember,requireLead,safe,body,sameOrigin,now,uuid,hash,newToken,audit,HttpError,readyIntegrations,getPublicFilms,rateLimit} from '@/lib/server';
import {streamRequest,streamUpload,bookGoogleCall} from '@/lib/providers';
import {channels,stages} from '@/lib/catalog';
import {createBunnyVideo,bunnyUploadTicket,getBunnyStatus} from '@/lib/bunny';
import {videoSharePath} from '@/lib/video-policy';
import {validatePlacements} from '@/lib/video-placement';
import {seedLegacyCatalog,startCatalogImport,checkCatalogImport} from '@/lib/catalog-import';
const str=(max=200)=>z.string().trim().max(max);
const email=z.string().trim().email().max(200).transform(v=>v.toLowerCase());
const product=z.enum(['spot','impossible','avatar','universe','spot-monthly','avatar-monthly','universe-monthly','unsure']);
const bucket='rtv-production';
const videoSchema=z.object({title:str(180).min(2,'Please add a video title.'),product:z.enum(['spot','impossible','avatar','universe']),industry:str(100).default(''),tags:str(500).default(''),description:str(2000).default(''),placement:z.enum(['featured','gallery','none']).default('gallery'),size:z.number().int().positive().max(5000000000),contentType:z.enum(['video/mp4','video/webm','video/quicktime']).default('video/mp4')});
async function video(id:string){const v=await result<any>(admin().from('videos').select('*').eq('id',id).is('deleted_at',null).maybeSingle());if(!v)throw new HttpError(404,'Video not found.');return v;}
async function updateVideo(id:string,values:any){return result(admin().from('videos').update({...values,updated_at:now()}).eq('id',id).is('deleted_at',null));}
export async function GET(req:Request,{params}:{params:Promise<{path:string[]}>}){return safe(async()=>{
 const p=(await params).path;
 if(p[0]==='session'){const user=await getStudioUser();const m=user?await currentMember():null;return {user:user?{email:user.email,name:user.displayName}:null,member:m,canSetup:false};}
 const m=await requireMember(),client=admin();
 if(p[0]==='dashboard'){
  let query=client.from('leads').select('*');if(m.role==='production')query=query.eq('stage','Won');else if(m.role==='sales')query=query.or(`owner_email.eq.${m.email},origin_rep.eq.${m.rep_code}`);
  const [leads,team,videos,settings]=await Promise.all([result(query.order('updated_at',{ascending:false}).limit(500)),result(client.from('members').select('email,name,role,rep_code,active').order('name')),m.role==='sales'?Promise.resolve([]):result(client.from('videos').select('*').order('created_at',{ascending:false}).limit(500)),result<any[]>(client.from('settings').select('*'))]);
  const shareFilms=await getPublicFilms();
  const imports=m.role==='admin'?await result(client.from('video_imports').select('video_id,state,error')):[];
  return {member:m,imports,leads,members:team,videos:(videos as any[]).map(v=>({...v,share_path:videoSharePath(v)})),shareFilms,settings:Object.fromEntries(settings.map(r=>[r.key,r.value])),integrations:readyIntegrations()};
 }
 if(p[0]==='leads'&&p[1]){const lead=await requireLead(p[1],m);const [activities,intake]=await Promise.all([result(client.from('activities').select('*').eq('lead_id',lead.id).order('created_at',{ascending:false}).limit(100)),result<any>(client.from('intakes').select('answers,status,updated_at').eq('lead_id',lead.id).maybeSingle())]);return {lead,activities,intake:intake?{...intake,answers:JSON.parse(intake.answers)}:null};}
 if(p[0]==='videos'&&p[1]&&p[2]==='play'){await requireMember(['admin','production']);const v=await video(p[1]);if(v.status!=='Ready')throw new HttpError(409,'This video is not ready to play yet.');if(v.provider==='stream'&&!v.published){const token=await streamRequest('/'+v.object_key+'/token','POST',{exp:Math.floor(Date.now()/1000)+3600});return {source:'https://iframe.videodelivery.net/'+token.token,provider:'stream'};}return {source:v.source,provider:v.provider};}
 throw new HttpError(404,'This page was not found.');
});}
export async function POST(req:Request,{params}:{params:Promise<{path:string[]}>}){return safe(async()=>{
 sameOrigin(req);const p=(await params).path,data=await body(req),m=await requireMember(),client=admin();
 if(p[0]==='catalog-import'){
  await requireMember(['admin']);
  if(p[1]==='prepare'){await seedLegacyCatalog(m.email);return {ok:true};}
  const id=str(80).parse(data.id);
  if(p[1]==='start')return startCatalogImport(id);
  if(p[1]==='check')return checkCatalogImport(id);
  throw new HttpError(404,'Unknown import action.');
 }
 if(p[0]==='members'){await requireMember(['admin']);const d=z.object({email,name:str(100).min(2),role:z.enum(['admin','sales','production'])}).parse(data);const exists=await result(client.from('members').select('email').eq('email',d.email).maybeSingle());if(exists)throw new HttpError(409,'This team member already exists.');await result(client.from('members').insert({...d,rep_code:'rtv-'+uuid().slice(0,8),active:1,created_at:now()}));return {ok:true};}
 if(p[0]==='leads'&&!p[1]){await requireMember(['admin','sales']);const d=z.object({company:str(160).min(2),name:str(120).min(2),email,phone:str(50).default(''),website:str(300).default(''),product:product.default('unsure'),notes:str(5000).default(''),source:str(100).default('Sales outreach')}).parse(data);const id=uuid();const {error}=await client.rpc('rtv_create_lead',{p_id:id,p_data:d,p_actor:m.email,p_rep:m.rep_code,p_stamp:now()});if(error?.code==='23505')throw new HttpError(409,'This contact already exists in the pipeline. Ask the studio owner to review it.');if(error)throw error;return {id};}
 if(p[0]==='leads'&&p[1]){
  await requireMember(['admin','sales']);const l=await requireLead(p[1],m);
  if(p[2]==='note'){const note=str(5000).min(1).parse(data.note);await result(client.rpc('rtv_update_lead',{p_id:l.id,p_changes:{updated_at:now()},p_actor:m.email,p_action:'Note',p_detail:note}));return {ok:true};}
  if(p[2]==='intake-link'){const token=newToken();await result(client.rpc('rtv_rotate_intake',{p_id:l.id,p_hash:await hash(token),p_expires:new Date(Date.now()+90*86400000).toISOString(),p_actor:m.email,p_stamp:now()}));return {url:'/intake/'+token};}
  if(p[2]==='calendar'){const d=z.object({start:z.string().datetime(),host:email,mode:z.enum(['google','manual']),eventUrl:z.string().max(1000).default('')}).parse(data);if(new Date(d.start).getTime()<Date.now())throw new HttpError(400,'Choose a future call time.');const host=await result(client.from('members').select('email').eq('email',d.host).eq('active',1).in('role',['admin','sales']).maybeSingle());if(!host)throw new HttpError(400,'Choose an active sales host.');let url=d.eventUrl;if(d.mode==='google'){const event=await bookGoogleCall(l,d.start,d.host);url=event.htmlLink;}else if(!/^https:\/\/(calendar\.google\.com|calendar\.app\.google|meet\.google\.com)\//.test(url))throw new HttpError(400,'Add the confirmed Google Calendar or Meet link.');await result(client.rpc('rtv_update_lead',{p_id:l.id,p_changes:{stage:'Call booked',preferred_time:d.start,calendar_event:url,updated_at:now()},p_actor:m.email,p_action:d.mode==='google'?'Google call scheduled':'Confirmed call recorded',p_detail:d.start+' · Host '+d.host}));return {ok:true,url};}
 }
 if(p[0]==='videos'){
  await requireMember(['admin','production']);
  if(p[1]&&p[2]==='trash'){
   await video(p[1]);
   await updateVideo(p[1],{deleted_at:now(),published:0,share_enabled:false,share_key:newToken()});
   return {ok:true};
  }
  if(p[1]&&p[2]==='restore'){
   const restored=await result<{id:string}[]>(client.from('videos').update({deleted_at:null,published:0,share_enabled:false,updated_at:now()}).eq('id',p[1]).not('deleted_at','is',null).select('id'));
   if(!restored.length)throw new HttpError(404,'This video is not in Trash.');
   return {ok:true};
  }
  if(p[1]&&p[2]==='upload-ticket'){const v=await video(p[1]);if(v.provider!=='bunny'||v.status==='Ready')throw new HttpError(409,'This video does not need an upload.');return {id:v.id,provider:'bunny',...bunnyUploadTicket(v.object_key)};}
  if(p[1]&&p[2]==='refresh'){const v=await video(p[1]);if(v.provider==='bunny'){const r=await getBunnyStatus(v.object_key);await updateVideo(v.id,{status:r.status,...(r.status!=='Ready'?{published:0,share_enabled:false}:{}),poster:r.status==='Ready'?'/api/video-poster/'+v.id:v.poster});return r;}if(v.provider==='stream'){const r=await streamRequest('/'+v.object_key);const status=r.readyToStream?'Ready':r.status?.state==='error'?'Processing failed':'Processing';await updateVideo(v.id,{status});return {status};}
   if(v.provider==='supabase'){
    const {data:info,error}=await client.storage.from(bucket).info(v.object_key);if(error||!info)throw new HttpError(409,'The upload has not finished.');
    if(Number(info.size)!==v.size||info.contentType!==v.content_type)throw new HttpError(400,'The uploaded file does not match the prepared video.');
    const {data:signed,error:signError}=await client.storage.from(bucket).createSignedUrl(v.object_key,60);if(signError||!signed)throw new Error('Unable to verify video');
    const response=await fetch(signed.signedUrl,{headers:{Range:'bytes=0-11'},cache:'no-store'});if(!response.ok)throw new Error('Unable to inspect video');
    const reader=response.body!.getReader();const first=await reader.read();await reader.cancel();const bytes=first.value||new Uint8Array();
    const mp4=new TextDecoder().decode(bytes.slice(4,8))==='ftyp';const webm=Array.from(bytes.slice(0,4)).join(',')==='26,69,223,163';
    if((v.content_type==='video/mp4'&&!mp4)||(v.content_type==='video/webm'&&!webm))throw new HttpError(400,'This file is not a supported video.');
    await updateVideo(v.id,{status:'Ready'});return {status:'Ready'};
   }return {status:v.status};
  }
  if(!p[1]){
   const d=videoSchema.parse(data),id=uuid(),connections=readyIntegrations(),stream=connections.stream;
   await rateLimit(req,'video-upload:'+m.email,20);
   if(connections.bunny){const ticket=await createBunnyVideo(d.title);await result(client.from('videos').insert({id,title:d.title,product:d.product,industry:d.industry,tags:d.tags,description:d.description,provider:'bunny',source:'/api/playback/'+id,object_key:ticket.videoId,poster:channels.find(c=>c.id===d.product)!.image,placement:d.placement,status:'Awaiting upload',size:d.size,content_type:d.contentType,uploaded_by:m.email,created_at:now(),updated_at:now()}));return {id,provider:'bunny',...ticket};}
   if(!stream&&(d.size>50000000||d.contentType==='video/quicktime'))throw new HttpError(400,'Use an MP4 or WebM under 50 MB until Bunny Stream is connected.');
   const ticket=stream?await streamUpload(d.size):null;const object_key=stream?ticket!.uid:id;
   let uploadUrl=ticket?.url||'';
   if(!stream){const {data:signed,error}=await client.storage.from(bucket).createSignedUploadUrl(object_key,{upsert:false});if(error||!signed)throw error||new Error('Upload preparation failed');uploadUrl=signed.signedUrl;}
   await result(client.from('videos').insert({id,title:d.title,product:d.product,industry:d.industry,tags:d.tags,description:d.description,provider:stream?'stream':'supabase',source:stream?'https://iframe.videodelivery.net/'+ticket!.uid:'/api/media/'+id,object_key,poster:channels.find(c=>c.id===d.product)!.image,placement:d.placement,status:stream?'Processing':'Awaiting upload',size:d.size,content_type:d.contentType,uploaded_by:m.email,created_at:now(),updated_at:now()}));return {id,provider:stream?'stream':'supabase',uploadUrl};
  }
 }
 throw new HttpError(404,'This action was not found.');
});}
export async function PATCH(req:Request,{params}:{params:Promise<{path:string[]}>}){return safe(async()=>{
 sameOrigin(req);const m=await requireMember(),p=(await params).path,data=await body(req),client=admin();
 if(p[0]==='placements'){
  await requireMember(['admin','production']);
  const id=str(80),channelMap=z.object({spot:id,impossible:id,avatar:id,universe:id});
  const d=z.object({previous:z.string().max(20000),value:z.object({hero:z.array(id).length(6),examples:channelMap,openers:channelMap,order:z.array(id).max(500)})}).parse(data);
  const error=validatePlacements(d.value,await getPublicFilms());if(error)throw new HttpError(400,error);
  const changed=await result<{key:string}[]>(client.from('settings').update({value:JSON.stringify(d.value)}).eq('key','video_placements').eq('value',d.previous).select('key'));
  if(!changed.length)throw new HttpError(409,'Placements changed in another window. Reload the workspace before saving.');
  return {ok:true};
 }
 if(p[0]==='leads'&&p[1]){await requireMember(['admin','sales']);const l=await requireLead(p[1],m);const d=z.object({stage:z.enum(stages),product,nextAction:str(1000),nextAt:str(50),ownerEmail:str(200)}).parse(data);if(d.stage==='Call booked'&&!l.calendar_event)throw new HttpError(400,'Record or schedule a confirmed call before choosing Call booked.');if(d.ownerEmail!==l.owner_email&&m.role!=='admin')throw new HttpError(403,'Only an administrator can reassign a lead.');if(d.ownerEmail){const owner=await result(client.from('members').select('email').eq('email',d.ownerEmail).eq('active',1).in('role',['admin','sales']).maybeSingle());if(!owner)throw new HttpError(400,'Choose an active sales owner.');}await result(client.rpc('rtv_update_lead',{p_id:l.id,p_changes:{stage:d.stage,product:d.product,next_action:d.nextAction,next_at:d.nextAt,owner_email:d.ownerEmail,updated_at:now()},p_actor:m.email,p_action:'Lead updated',p_detail:`${l.stage} → ${d.stage}; owner ${d.ownerEmail||'unassigned'}. Original attribution retained.`}));return {ok:true};}
 if(p[0]==='videos'&&p[1]){await requireMember(['admin','production']);const v=await video(p[1]);const d=z.object({title:str(180).min(2),product:z.enum(['spot','impossible','avatar','universe']),industry:str(100),tags:str(500),description:str(2000),placement:z.enum(['featured','gallery','none']),published:z.boolean(),consent:z.boolean(),share_enabled:z.boolean().default(false),show_cta:z.boolean().default(true)}).parse(data);if(d.share_enabled&&v.status!=='Ready')throw new HttpError(400,'Sharing requires a ready video.');if(d.published&&(!d.consent||v.status!=='Ready'))throw new HttpError(400,'Publishing requires a ready video and confirmed portfolio permission.');if(v.provider==='stream'&&Boolean(v.published)!==d.published)await streamRequest('/'+v.object_key,'POST',{requireSignedURLs:!d.published});await updateVideo(v.id,{...d,published:d.published?1:0,consent:d.consent?1:0,...(!d.share_enabled&&v.share_enabled?{share_key:newToken()}: {})});return {ok:true};}
 if(p[0]==='members'&&p[1]){await requireMember(['admin']);const d=z.object({role:z.enum(['admin','sales','production']),active:z.boolean()}).parse(data);const target=decodeURIComponent(p[1]);if(target===m.email&&(!d.active||d.role!=='admin'))throw new HttpError(400,'Another administrator must change your own access.');await result(client.from('members').update({role:d.role,active:d.active?1:0}).eq('email',target));return {ok:true};}
 if(p[0]==='settings'){await requireMember(['admin']);const d=z.object({hideLegacy:z.boolean()}).parse(data);await result(client.from('settings').upsert({key:'hide_legacy',value:String(d.hideLegacy)}));return {ok:true};}
 throw new HttpError(404,'This action was not found.');
});}
