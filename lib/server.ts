import 'server-only';
import {getStudioUser} from './supabase/server';
import {admin,result} from './supabase/admin';
import {baselineFilms} from './catalog';
import {orderFilms,parsePlacements,publicCatalog} from './video-placement';
import type {Film} from '@/components/rtv/chrome';
export {admin,result};
export const runtime=process.env;
export type Member={email:string;name:string;role:'admin'|'sales'|'production';rep_code:string;active:number};
export const now=()=>new Date().toISOString();
export const uuid=()=>crypto.randomUUID();
export async function hash(v:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export function newToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
export async function currentMember(){const user=await getStudioUser();if(!user)return null;return result<Member|null>(admin().from('members').select('*').eq('email',user.email).eq('active',1).maybeSingle());}
export async function requireMember(roles:string[]=['admin','sales','production']){const m=await currentMember();if(!m)throw new HttpError(401,'Sign in with an approved team account to continue.');if(!roles.includes(m.role))throw new HttpError(403,'Your role does not have access to this action.');return m;}
export async function requireLead(id:string,m:Member){const l=await result<any>(admin().from('leads').select('*').eq('id',id).maybeSingle());if(!l)throw new HttpError(404,'This lead was not found.');if(m.role!=='admin'&&!(m.role==='sales'&&(l.owner_email===m.email||l.origin_rep===m.rep_code))&&!(m.role==='production'&&l.stage==='Won'))throw new HttpError(403,'This lead is assigned to another team member.');return l;}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new HttpError(403,'Please submit this form from the studio website.');}
export async function body(req:Request,max=32000){if(Number(req.headers.get('content-length')||0)>max)throw new HttpError(413,'This submission is too large.');const text=await req.text();if(text.length>max)throw new HttpError(413,'This submission is too large.');try{return JSON.parse(text)}catch{throw new HttpError(400,'The submitted form could not be read.');}}
export async function safe(fn:()=>Promise<any>){try{return Response.json(await fn(),{headers:{'Cache-Control':'private, no-store'}})}catch(e:any){if(e?.issues)return Response.json({error:e.issues[0]?.message||'Please check the highlighted fields.'},{status:400});console.error('Studio request failed:',e?.code||e?.message||'unknown');return Response.json({error:e instanceof HttpError?e.message:'We could not save that change. Please try again.'},{status:e instanceof HttpError?e.status:503,headers:{'Cache-Control':'private, no-store'}});}}
export async function audit(leadId:string,actor:string,action:string,detail=''){await result(admin().from('activities').insert({id:uuid(),lead_id:leadId,actor,action,detail,created_at:now()}));}
export async function getPublicFilms():Promise<Film[]>{
 if(!runtime.SUPABASE_SECRET_KEY)return baselineFilms;
 try{
  const client=admin();
  const [rows,settings]=await Promise.all([
   result<(Film&{status:string;published:number;consent:number;deleted_at:string|null})[]>(client.from('videos').select('id,title,product,industry,tags,description,provider,source,poster,placement,status,published,consent,deleted_at').order('created_at',{ascending:false})),
   result<{key:string;value:string}[]>(client.from('settings').select('key,value').in('key',['hide_legacy','video_placements']))
  ]);
  const values=Object.fromEntries(settings.map(r=>[r.key,r.value]));
  return orderFilms(publicCatalog(rows,baselineFilms,values.hide_legacy==='true') as Film[],parsePlacements(values.video_placements).order);
 }catch{console.error('Public library unavailable');return [];}
}
export async function rateLimit(req:Request,scope='enquiry',limit=20){const hour=Math.floor(Date.now()/3600000);const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]||req.headers.get('x-real-ip')||'anonymous';const key=await hash(scope+':'+ip+':'+hour);const count=await result<number>(admin().rpc('rtv_rate_limit',{p_key:key,p_time:Date.now()}));if(count>limit)throw new HttpError(429,'Too many requests. Please try again later.');}
export function readyIntegrations(){return {bunny:!!(runtime.BUNNY_STREAM_API_KEY&&runtime.BUNNY_STREAM_LIBRARY_ID&&runtime.BUNNY_STREAM_CDN_HOST&&runtime.BUNNY_STREAM_TOKEN_KEY),stream:!!(runtime.CLOUDFLARE_ACCOUNT_ID&&runtime.CLOUDFLARE_STREAM_TOKEN),calendar:!!(runtime.GOOGLE_CLIENT_ID&&runtime.GOOGLE_CLIENT_SECRET&&runtime.GOOGLE_REFRESH_TOKEN),calendarId:runtime.GOOGLE_CALENDAR_ID||'rtvaidstudios@gmail.com'};}
