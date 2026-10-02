'use client';
import {useState} from 'react';
import {Mail} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {api} from './forms';
export function CustomerEmail({recipient,subject,text,endpoint,payload,connected,onSent}:{recipient:string;subject:string;text:string;endpoint:string;payload:Record<string,unknown>;connected:boolean;onSent?:()=>void}){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false),[requestId,setRequestId]=useState('');
 const draft='mailto:'+encodeURIComponent(recipient)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);
 return <><button className="button small" type="button" onClick={()=>{setOpen(true);setError('');setSent(false);setRequestId(crypto.randomUUID());}}><Mail size={16}/>Email customer</button><Dialog open={open} onOpenChange={value=>!busy&&setOpen(value)}><DialogContent className="desk-dialog"><DialogTitle>Email customer</DialogTitle><DialogDescription>Review the recipient and message before sending.</DialogDescription><p><b>To:</b> {recipient}</p><p><b>Subject:</b> {subject}</p><div className="brief-email-preview">{text}</div>{error&&<p className="form-error" role="alert">{error}</p>}{sent?<p className="desk-notice" role="status">Email accepted for delivery to {recipient}.</p>:<>{!connected&&<p className="form-note">Direct email is not connected yet. Open a ready-to-send draft in your email app.</p>}<div className="form-actions">{connected&&<button className="button light" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await api(endpoint,'POST',{...payload,requestId});setSent(true);onSent?.();}catch(failure){setError(failure instanceof Error?failure.message:'Please try again.');}finally{setBusy(false);}}}>{busy?'Sending…':'Send email'}</button>}<a className="button" href={draft}>Open email draft</a></div></>}</DialogContent></Dialog></>;
}
