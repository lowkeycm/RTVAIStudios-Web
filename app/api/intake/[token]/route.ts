import {z} from 'zod';
import {admin,result,safe,body,sameOrigin,hash,now,HttpError} from '@/lib/server';
import {briefKeys,firstMissingBriefStep} from '@/lib/brief';
async function load(token:string){if(!/^[a-f0-9]{64}$/.test(token))throw new HttpError(404,'This intake link is not valid.');const row=await result<any>(admin().from('intakes').select('*,leads(company,name,product)').eq('token_hash',await hash(token)).gt('expires_at',now()).maybeSingle());if(!row)throw new HttpError(404,'This intake link has expired or been replaced. Ask your RTV contact for a new link.');return row;}
export async function GET(req:Request,{params}:{params:Promise<{token:string}>}){return safe(async()=>{const row=await load((await params).token);return {...row.leads,answers:JSON.parse(row.answers),status:row.status,step:row.current_step,revision:row.revision,updatedAt:row.updated_at};});}
export async function PUT(req:Request,{params}:{params:Promise<{token:string}>}){return safe(async()=>{
 sameOrigin(req);const row=await load((await params).token);
 const p=z.object({answers:z.record(z.string().max(60),z.string().max(5000)),submit:z.boolean().default(false),step:z.number().int().min(0).max(5).default(0),revision:z.number().int().min(0).optional(),autosave:z.boolean().default(false)}).parse(await body(req,100000));
 if(Object.keys(p.answers).some(key=>!briefKeys.has(key)))throw new HttpError(400,'This brief contains an unrecognized field.');
 if(p.submit&&firstMissingBriefStep(p.answers)!==-1)throw new HttpError(400,'Please tell us your goal, your audience, and what success looks like.');
 const status=p.submit?'Submitted':'Draft';
 const {data:revision,error}=await admin().rpc('rtv_save_brief',{p_id:row.lead_id,p_hash:row.token_hash,p_answers:JSON.stringify(p.answers),p_status:status,p_stamp:now(),p_step:p.step,p_revision:p.revision??row.revision,p_autosave:p.autosave});
 if(error?.message?.includes('brief_conflict'))throw new HttpError(409,'This brief was changed in another tab, or its link was replaced. Your edits are still on this screen. Copy any unsaved text before reloading the latest version.');
 if(error)throw error;
 return {ok:true,status,revision};
});}
