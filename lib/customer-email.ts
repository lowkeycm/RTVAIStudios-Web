import 'server-only';
import {HttpError} from './server';
export function customerEmailConfigured(){return !!process.env.RESEND_API_KEY;}
export async function sendCustomerEmail({to,replyTo,subject,text,idempotencyKey}:{to:string;replyTo:string;subject:string;text:string;idempotencyKey:string}){
 if(!customerEmailConfigured())throw new HttpError(409,'Direct email is not connected. Use Open email draft, or ask the administrator to add RESEND_API_KEY in Vercel.');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL||'RTV AI Studios <studio@support.rtvaistudios.com>',to:[to],reply_to:replyTo,subject,text})});
 if(!response.ok)throw new HttpError(502,'The email provider did not accept this email. You can retry or use Open email draft.');
 return response.json() as Promise<{id:string}>;
}
