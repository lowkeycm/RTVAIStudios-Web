import {z} from 'zod';
import {admin,result,safe,body,sameOrigin,rateLimit,hash,newToken,now,uuid,HttpError} from '@/lib/server';
import {offers} from '@/lib/catalog';
const schema=z.object({requestId:z.string().uuid(),name:z.string().trim().min(2,'Please enter your name.').max(120),company:z.string().trim().min(2,'Please enter your business name.').max(160),email:z.string().trim().email('Please enter a valid email address.').max(200).transform(v=>v.toLowerCase()),phone:z.string().max(50).default(''),website:z.string().max(300).default(''),product:z.string().max(50).default('unsure'),notes:z.string().max(5000).default(''),preferredTime:z.string().max(100).default(''),timezone:z.string().max(100).default(''),ref:z.string().max(40).default(''),campaign:z.string().max(1000).default(''),fax:z.string().max(100).default('')});
export async function POST(req:Request){return safe(async()=>{
 sameOrigin(req);const p=schema.parse(await body(req));if(p.fax)throw new HttpError(400,'Please try again.');
 if(p.product!=='unsure'&&!offers.some(o=>o.id===p.product))throw new HttpError(400,'Please choose a listed package.');
 await rateLimit(req);
 const raw=req.headers.get('cookie')?.match(/(?:^|;\s*)rtv_ref=([^;]+)/)?.[1]||'';
 let ref=p.ref;try{ref ||= decodeURIComponent(raw);}catch{ref='';}
 const token=newToken();
 return result(admin().rpc('rtv_submit_enquiry',{p_request:p.requestId,p_data:{...p,ref},p_id:uuid(),p_token:token,p_hash:await hash(token),p_stamp:now(),p_expires:new Date(Date.now()+90*86400000).toISOString()}));
});}
