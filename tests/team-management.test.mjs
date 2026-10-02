import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {z} from 'zod';
import * as team from '../lib/team-management.ts';

const owner={email:'owner@example.test',name:'Owner',role:'admin',active:1};
const teammate={email:'member@example.test',name:'Member',role:'sales',active:1,rep_code:'keep-attribution'};
const existingError={code:'email_exists'};
const mailClient=(inviteError=null,recoveryError=null)=>{
 const calls=[];
 return {calls,auth:{admin:{inviteUserByEmail:async(...args)=>{calls.push(['invite',...args]);return {error:inviteError};}},resetPasswordForEmail:async(...args)=>{calls.push(['recovery',...args]);return {error:recoveryError};}}};
};

test('new members receive invitations, existing logins receive password recovery links',async()=>{
 for(const error of [null,existingError,{code:'user_already_exists'}]){
  const client=mailClient(error);
  assert.deepEqual(await team.sendMemberSetupEmail(client,teammate,'https://studio.test/auth/recovery'),{sent:true});
  assert.equal(client.calls.length,error?2:1);
  assert.equal(client.calls[0][2].redirectTo,'https://studio.test/auth/recovery');
  if(error)assert.equal(client.calls[1][0],'recovery');
 }
});
test('paused members never get emails; SMTP failures do not fall back to unrelated auth calls',async()=>{
 const client=mailClient({code:'unexpected_failure'});
 assert.equal((await team.sendMemberSetupEmail(client,{...teammate,active:0},'https://studio.test')).sent,false);
 assert.equal(client.calls.length,0);
 assert.equal((await team.sendMemberSetupEmail(client,teammate,'https://studio.test')).sent,false);
 assert.equal(client.calls.length,1);
 assert.equal((await team.sendMemberSetupEmail(mailClient(existingError,{code:'over_email_send_rate_limit'}),teammate,'https://studio.test')).sent,false);
});

async function routeHarness(file,actor=owner,{mailError=null,validToken=true}={}){
 const rows=new Map([[owner.email,{...owner}],[teammate.email,{...teammate}]]);
 const client=mailClient(mailError);
 let sessionWrites=0;
 client.from=()=>{
  let target,changes,operation='read';
  const query={
   select(){return query;},eq(key,value){if(key==='email')target=value;if(key==='active')query.active=value;return query;},
   update(value){changes=value;operation='update';return query;},
   insert(value){rows.set(value.email,{...value});return Promise.resolve({data:null,error:null});},
   maybeSingle(){const row=rows.get(target);return Promise.resolve({data:row&&(!query.active||row.active===query.active)?row:null,error:null});},
   then(resolve){const row=rows.get(target);if(row&&operation==='update')Object.assign(row,changes);return Promise.resolve({data:row?[row]:[],error:null}).then(resolve);},
  };return query;
 };
 class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
 const server={admin:()=>client,result:async query=>(await query).data,
  requireMember:async(roles=['admin','sales','production'])=>{if(!actor)throw new HttpError(401,'Sign in');if(!roles.includes(actor.role))throw new HttpError(403,'Denied');return actor;},
  sameOrigin:req=>{if(req.headers.get('origin')!==new URL(req.url).origin)throw new HttpError(403,'Origin');},
  body:req=>req.json(),rateLimit:async()=>{},now:()=>new Date().toISOString(),uuid:()=>crypto.randomUUID(),HttpError,
  safe:async fn=>{try{return Response.json(await fn());}catch(error){return Response.json({error:error.message},{status:error.issues?400:error.status||503});}}
 };
 const auth={authClient:async()=>({auth:{getUser:async()=>({data:{user:validToken?{email:teammate.email}:null},error:validToken?null:{code:'bad_jwt'}}),setSession:async()=>{sessionWrites++;return {error:null};}}})};
 const source=await readFile(new URL('../'+file,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 runInNewContext(js,{exports:module.exports,require:specifier=>specifier==='zod'?{z}:specifier==='@/lib/server'?server:specifier==='@/lib/team-management'?team:specifier==='@/lib/supabase/server'?auth:{},Response,URL,console,crypto});
 return {rows,client,sessionWrites:()=>sessionWrites,invoke:async(method,path,data={},origin='https://studio.test')=>{
  const request=new Request('https://studio.test/api/desk/'+path.join('/'),{method,headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)});
  const response=await module.exports[method](request,{params:Promise.resolve({path})});
  return {status:response.status,body:await response.json()};
 }};
}
const desk='app/api/desk/[...path]/route.ts';
test('real member API denies unauthenticated users, sales and production before any write or email',async()=>{
 for(const actor of [null,{...owner,role:'sales'},{...owner,role:'production'}]){
  const h=await routeHarness(desk,actor);
  for(const [method,path,data] of [
   ['PATCH',['members',teammate.email],{role:'admin',active:true}],
   ['POST',['members',teammate.email,'invite'],{}],
   ['POST',['members'],{email:'new@example.test',name:'New User',role:'admin'}],
  ])assert.equal((await h.invoke(method,path,data)).status,actor?403:401);
  assert.equal(h.rows.get(teammate.email).role,'sales');assert.equal(h.rows.size,2);assert.equal(h.client.calls.length,0);
 }
});
test('real member API edits role, name and status while preserving attribution; blocks self lockout',async()=>{
 const h=await routeHarness(desk);
 assert.equal((await h.invoke('PATCH',['members',teammate.email],{name:'Updated Name',role:'production',active:false})).status,200);
 assert.deepEqual(h.rows.get(teammate.email),{...teammate,name:'Updated Name',role:'production',active:0});
 for(const change of [{role:'sales',active:true},{role:'admin',active:false},{role:'owner',active:true}])assert.equal((await h.invoke('PATCH',['members',owner.email],change)).status,400);
 assert.equal((await h.invoke('PATCH',['members','missing@example.test'],{role:'sales',active:true})).status,404);
 assert.equal((await h.invoke('POST',['members',teammate.email,'invite'])).status,400);
 assert.equal(h.client.calls.length,0);
 assert.equal((await h.invoke('PATCH',['members',teammate.email],{role:'admin',active:true},'https://other.test')).status,403);
});
test('creation persists member on delivery failure and permits a deliberate resend without duplication',async()=>{
 const h=await routeHarness(desk,owner,{mailError:{code:'smtp_failure'}});
 const added=await h.invoke('POST',['members'],{email:'new@example.test',name:'New Member',role:'production'});
 assert.equal(added.status,200);assert.equal(added.body.invitationSent,false);assert.ok(added.body.warning);
 assert.ok(h.rows.has('new@example.test'));
 assert.equal((await h.invoke('POST',['members'],{email:'new@example.test',name:'New Member',role:'production'})).status,409);
 assert.equal((await h.invoke('POST',['members','new@example.test','invite'])).status,503);
 assert.equal(h.rows.size,3);
});
test('setup session rejects invalid tokens and paused membership before writing a session',async()=>{
 const file='app/api/auth/setup/route.ts';
 const bad=await routeHarness(file,owner,{validToken:false});
 assert.equal((await bad.invoke('POST',[],{access_token:'invalid',refresh_token:'invalid'})).status,401);
 assert.equal(bad.sessionWrites(),0);
 const paused=await routeHarness(file);paused.rows.get(teammate.email).active=0;
 assert.equal((await paused.invoke('POST',[],{access_token:'token',refresh_token:'refresh'})).status,403);
 assert.equal(paused.sessionWrites(),0);
 const good=await routeHarness(file);
 assert.equal((await good.invoke('POST',[],{access_token:'token',refresh_token:'refresh'})).status,200);
 assert.equal(good.sessionWrites(),1);
});
