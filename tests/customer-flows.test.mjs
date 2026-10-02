import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {z} from 'zod';
import * as brief from '../lib/brief.ts';
import * as messages from '../lib/customer-messages.ts';
async function moduleAt(file,imports,globals={}){
 const code=ts.transpileModule(await readFile(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};runInNewContext(code,{exports:module.exports,require:name=>name==='server-only'?{}:imports[name]||{},Response,Request,Headers,URL,AbortSignal,console,process:{env:{}},...globals});return module.exports;
}
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
const safe=async fn=>{try{return Response.json(await fn());}catch(error){return Response.json({error:error.message},{status:error.issues?400:error.status||503});}};
const request=(path,data={})=>new Request('https://www.rtvaistudios.com/api/desk/'+path,{method:'POST',headers:{origin:'https://www.rtvaistudios.com','content-type':'application/json'},body:JSON.stringify(data)});
async function deliveryApi(role,allowed=true){
 let emails=0,prepared=0;
 const member=role?{email:'rep@example.invalid',role}:null;
 const lead={id:'my-lead',name:'Client',email:'client@example.invalid'};
 const video={id:'video',status:'Ready',provider:'bunny',object_key:'bunny-video',title:'Final video'};
 const delivery={id:'delivery',lead_id:lead.id,access_key:'a'.repeat(64),enabled:true,videos:video};
 const client={from:table=>{const matches={};const q={select:()=>q,eq:(key,value)=>{matches[key]=value;return q;},is:()=>q,maybeSingle:async()=>({data:table==='videos'?video:table==='client_deliveries'&&matches.id===delivery.id&&matches.lead_id===lead.id?delivery:null,error:null})};return q;},rpc:async()=>{prepared++;return {data:null,error:null};}};
 const route=await moduleAt('app/api/desk/[...path]/route.ts',{'zod':{z},'@/lib/server':{admin:()=>client,result:async q=>(await q).data,safe,body:req=>req.json(),sameOrigin:()=>{},requireMember:async(roles=['admin','sales','production'])=>{if(!member)throw new HttpError(401,'Sign in');if(!roles.includes(member.role))throw new HttpError(403,'Denied');return member;},requireLead:async()=>{if(!allowed)throw new HttpError(403,'Not your client');return lead;},rateLimit:async()=>{},audit:async()=>{},now:()=>new Date().toISOString(),newToken:()=> 'b'.repeat(64),HttpError},'@/lib/client-delivery':{prepareClientDownload:async()=>({file:'play_1080p.mp4',label:'1080p MP4'})},'@/lib/customer-messages':messages,'@/lib/customer-email':{sendCustomerEmail:async payload=>{assert.equal(payload.to,lead.email);assert.equal(payload.replyTo,member.email);emails++;return {id:'email'};}}});
 return {delivery,emails:()=>emails,prepared:()=>prepared,call:async(action,data)=>{const response=await route.POST(request(action,data),{params:Promise.resolve({path:['leads',lead.id,action]})});return response.status;}};
}
test('only production/admin prepare finals; sales can send approved deliveries for their customers',async()=>{
 for(const role of ['admin','production','sales',null]){
  const api=await deliveryApi(role);
  assert.equal(await api.call('delivery-prepare',{videoId:'video',approved:true}),role===null?401:role==='sales'?403:200);
  assert.equal(await api.call('delivery-email',{deliveryId:'delivery',requestId:'12345678-1234-4234-8234-123456789012'}),role?200:401);
  assert.equal(api.emails(),role?1:0);
 }
});
test('no email for another client, guessed delivery IDs, unapproved or withdrawn videos',async()=>{
 const denied=await deliveryApi('sales',false);
 assert.equal(await denied.call('delivery-email',{deliveryId:'delivery'}),403);assert.equal(denied.emails(),0);
 const api=await deliveryApi('production');
 assert.equal(await api.call('delivery-prepare',{videoId:'video',approved:false}),400);
 assert.equal(await api.call('delivery-email',{deliveryId:'someone-elses',requestId:'12345678-1234-4234-8234-123456789012'}),404);
 api.delivery.enabled=false;
 assert.equal(await api.call('delivery-email',{deliveryId:'delivery',requestId:'12345678-1234-4234-8234-123456789012'}),409);
 assert.equal(api.emails(),0);assert.equal(api.prepared(),0);
});
test('download does not fetch files without a valid delivery; valid files stream as attachments',async()=>{
 let valid=false,fetches=0;
 const route=await moduleAt('app/api/delivery/[key]/download/route.ts',{'@/lib/client-delivery':{findClientDelivery:async()=>valid?{videos:{provider:'bunny',title:'Final film',object_key:'video'},download_file:'play_1080p.mp4'}:null},'@/lib/bunny':{bunnyPlayback:()=>({url:'https://example.b-cdn.net/video.mp4'})}},{fetch:async()=>{fetches++;return new Response('data',{headers:{'content-length':'4'}});}});
 const call=()=>route.GET(new Request('https://studio.test/download'),{params:Promise.resolve({key:'private-key'})});
 assert.equal((await call()).status,404);assert.equal(fetches,0);
 valid=true;const response=await call();assert.match(response.headers.get('content-disposition'),/attachment/);assert.equal(await response.text(),'data');assert.equal(fetches,1);
});
test('MP4 delivery rejects missing fallback files and labels the verified resolution accurately',async()=>{
 let fallback=false;const mod=await moduleAt('lib/client-delivery.ts',{'./server':{HttpError},'./bunny':{bunnyRequest:async()=>({hasMP4Fallback:fallback,availableResolutions:'360p,720p,1080p,2160p'}),bunnyPlayback:(_,file)=>({url:'https://example.b-cdn.net/'+file})}},{fetch:async url=>new Response(null,{status:url.endsWith('play_1080p.mp4')?200:404})});
 await assert.rejects(()=>mod.prepareClientDownload({provider:'bunny',object_key:'video'}),/no downloadable MP4/);
 fallback=true;const output=await mod.prepareClientDownload({provider:'bunny',object_key:'video'});assert.equal(output.file,'play_1080p.mp4');assert.equal(output.label,'1080p MP4');
});
test('brief validation permits partial drafts but identifies the step with missing required answers',()=>{
 assert.equal(brief.firstMissingBriefStep({}),0);
 assert.equal(brief.firstMissingBriefStep({goal:'Goal',audience:'People'}),4);
 assert.equal(brief.firstMissingBriefStep({goal:'Goal',audience:'People',success:'Result'}),-1);
 assert.equal(brief.briefKeys.size,17);
});
