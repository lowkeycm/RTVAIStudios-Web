'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2,Copy,Save,Send} from 'lucide-react';
import {Nav,Footer} from './chrome';
import {briefSteps,firstMissingBriefStep} from '@/lib/brief';

type Snapshot={answers:Record<string,string>;step:number};
const signature=(snapshot:Snapshot)=>JSON.stringify(snapshot);
export function BriefWizard({token}:{token:string}){
 const [record,setRecord]=useState<{company:string;status:string}|null>(null),[answers,setAnswers]=useState<Record<string,string>>({}),[step,setStep]=useState(0),[error,setError]=useState(''),[saveState,setSaveState]=useState('Saved'),[busy,setBusy]=useState(false),[paused,setPaused]=useState(false),[submitted,setSubmitted]=useState(false),[copied,setCopied]=useState(false);
 const latest=useRef<Snapshot>({answers:{},step:0}),saved=useRef(''),revision=useRef(0),queue=useRef<Promise<boolean>>(Promise.resolve(true)),locked=useRef(false),heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  let cancelled=false;
  fetch('/api/intake/'+token,{cache:'no-store'}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);return data;}).then(data=>{
   if(cancelled)return;
   const snapshot={answers:data.answers||{},step:Math.min(5,Math.max(0,data.step||0))};latest.current=snapshot;saved.current=signature(snapshot);revision.current=data.revision;locked.current=data.status==='Submitted';
   setAnswers(snapshot.answers);setStep(snapshot.step);setSubmitted(locked.current);setRecord(data);
  }).catch(failure=>{if(!cancelled)setError(failure.message);});
  return()=>{cancelled=true;};
 },[token]);
 const save=useCallback((submit=false,autosave=false)=>{
  const operation=queue.current.then(async()=>{
   if(locked.current&&!submit)return true;
   const snapshot=latest.current,stamp=signature(snapshot);
   if(!submit&&stamp===saved.current){setSaveState('All changes saved');return true;}
   setSaveState('Saving…');
   try{
    const response=await fetch('/api/intake/'+token,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...snapshot,revision:revision.current,submit,autosave})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Your changes could not be saved.');
    revision.current=data.revision;saved.current=stamp;setError('');
    setSaveState(stamp===signature(latest.current)?'All changes saved':'Unsaved changes');
    if(submit){locked.current=true;setSubmitted(true);}return true;
   }catch(failure){setSaveState('Not saved — please retry');setError(failure instanceof Error?failure.message:'Please try saving again.');return false;}
  });
  queue.current=operation;return operation;
 },[token]);
 useEffect(()=>{
  if(!record||submitted||signature(latest.current)===saved.current)return;
  const timer=setTimeout(()=>{void save(false,true);},1000);return()=>clearTimeout(timer);
 },[answers,step,record,submitted,save]);
 useEffect(()=>{
  function warn(event:BeforeUnloadEvent){if(signature(latest.current)!==saved.current){event.preventDefault();event.returnValue='';}}
  window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
 },[]);
 function answer(key:string,value:string){const next={...latest.current.answers,[key]:value};latest.current={...latest.current,answers:next};setAnswers(next);setSaveState('Unsaved changes');}
 async function move(next:number){if(busy)return;latest.current={...latest.current,step:next};setStep(next);setBusy(true);await save(false,true);setBusy(false);heading.current?.focus();heading.current?.scrollIntoView({block:'start',behavior:'smooth'});}
 async function finishLater(){setBusy(true);if(await save())setPaused(true);setBusy(false);}
 async function submit(){const missing=firstMissingBriefStep(latest.current.answers);if(missing!==-1){await move(missing);setError('Please complete the questions marked * before submitting. You can still save and return later.');return;}setBusy(true);await save(true);setBusy(false);}
 const current=briefSteps[step],review=step===5;
 return <><Nav/><main className="content-section intake-page brief-wizard"><div className="brief-intro"><span className="eyebrow">YOUR CREATIVE BRIEF</span><h1>Tell us <em>your story.</em></h1><p>{record?.company||'Opening your brief…'}</p><p>Take it one section at a time. Your answers save as you go. Return using this same private link whenever you’re ready.</p></div>
 {error&&<p role="alert" className="form-error">{error}</p>}
 {record&&(paused||submitted)?<section className="brief-card brief-saved"><CheckCircle2 size={38}/><h2>{submitted?'Your brief is with the studio.':'Saved. Pick up whenever you’re ready.'}</h2><p>{submitted?'Thanks for sharing your story. Your RTV team can now review your answers.':'Reopen this same link on any device to continue with your answers and your place saved.'}</p><div className="form-actions"><button className="button light" onClick={()=>{setPaused(false);setSubmitted(false);locked.current=false;}}>{submitted?'Review or edit answers':'Continue my brief'}<ArrowRight size={18}/></button><button className="button" onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true);}catch{setError('Copy the link from your address bar to return later.');}}}><Copy size={18}/>{copied?'Link copied':'Copy return link'}</button></div></section>:record&&<>
 <nav className="brief-steps" aria-label="Brief steps">{[...briefSteps.map(s=>s.title),'Review & send'].map((title,index)=><button type="button" key={title} aria-current={index===step?'step':undefined} disabled={busy} onClick={()=>move(index)}><span>{index+1}</span>{title}</button>)}</nav>
 <div className="brief-progress"><span>Step {step+1} of 6</span><span role="status" aria-live="polite">{saveState}</span></div><progress className="brief-progress-bar" max={6} value={step+1} aria-label="Brief progress"/>
 <section className="brief-card"><h2 ref={heading} tabIndex={-1}>{review?'One last look.':current.title}</h2><p>{review?'Check your answers below. Use Edit to make a change, then send your brief to the studio.':current.description}</p>
 {review?<div className="brief-review">{briefSteps.map((section,index)=><section key={section.title}><div className="brief-review-heading"><h3>{section.title}</h3><button className="text-link" onClick={()=>move(index)}>Edit {section.title}</button></div><dl>{section.fields.map(([key,label])=><div key={key}><dt>{label}</dt><dd>{answers[key]?.trim()||'Not answered yet'}</dd></div>)}</dl></section>)}</div>:<div className="brief-fields">{current.fields.map(([key,label])=><div className="field" key={key}><label htmlFor={'brief-'+key}>{label}</label><textarea id={'brief-'+key} rows={7} disabled={busy} value={answers[key]||''} maxLength={5000} aria-required={label.endsWith('*')} onChange={event=>answer(key,event.target.value)} placeholder={label.endsWith('*')?'Tell us in your own words…':'Optional — share what you know, or come back to this.'}/><small>{(answers[key]||'').length.toLocaleString()} / 5,000 characters</small></div>)}</div>}
 <div className="brief-navigation"><button type="button" className="button" disabled={busy||step===0} onClick={()=>move(step-1)}><ArrowLeft size={18}/>Back</button>{review?<button type="button" className="button light" disabled={busy} onClick={submit}><Send size={18}/>{busy?'Saving…':'Send creative brief'}</button>:<button type="button" className="button light" disabled={busy} onClick={()=>move(step+1)}>Save & continue<ArrowRight size={18}/></button>}</div>
 </section><div className="brief-later"><button type="button" className="button" disabled={busy} onClick={finishLater}><Save size={18}/>Save & finish later</button>{saveState.startsWith('Not saved')&&<button className="text-link" onClick={()=>save()}>Retry saving</button>}<p>Only questions marked * are required before submitting. Your private link gives access to this brief; share it only with your project team.</p></div>
 </>}
 </main><Footer/></>;
}
