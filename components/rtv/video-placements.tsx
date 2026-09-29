'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowDown,ArrowUp,GripVertical,Save,RotateCcw,ArrowUpRight} from 'lucide-react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {channels} from '@/lib/catalog';
import {defaultPlacements,heroFilms,orderFilms,parsePlacements,typeExample,type VideoPlacements} from '@/lib/video-placement';
import type {Film} from './chrome';
import {api} from './forms';

function FilmSlot({label,value,films,preview,disabledIds=[],onChange}:{label:string;value:string;films:Film[];preview?:Film;disabledIds?:string[];onChange:(id:string)=>void}){
 return <div className="placement-slot">
  <div className="placement-poster">{preview?<img src={preview.poster} alt="" loading="lazy"/>:<span>No published film</span>}<span className="placement-slot-label">{label}</span></div>
  <Select value={value||'automatic'} onValueChange={id=>onChange(id==='automatic'?'':id)}>
   <SelectTrigger aria-label={label}><SelectValue placeholder="Automatic selection"/></SelectTrigger>
   <SelectContent><SelectItem value="automatic">Automatic selection</SelectItem>{value&&!films.some(f=>f.id===value)&&<SelectItem value={value} disabled>Film no longer available</SelectItem>}{films.map(f=><SelectItem value={f.id} key={f.id} disabled={disabledIds.includes(f.id)}><span className="placement-option"><img src={f.poster} alt="" loading="lazy"/>{f.title}</span></SelectItem>)}</SelectContent>
  </Select>
  <small>{preview?.title||'Publish a film in Production to use it here.'}</small>
 </div>;
}
export function VideoPlacementsEditor({films,saved,onSaved}:{films:Film[];saved:string;onSaved:()=>Promise<void>}){
 const [draft,setDraft]=useState<{value:VideoPlacements;baseline:string}|null>(null);
 const value=draft?.value||parsePlacements(saved),baseline=draft?.baseline||saved;
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const dragging=useRef<string|null>(null);
 const dirty=JSON.stringify(value)!==JSON.stringify(parsePlacements(baseline));
 const ordered=useMemo(()=>orderFilms(films,value.order),[films,value.order]);
 const wall=heroFilms(ordered,value);
 useEffect(()=>{if(!dirty)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};addEventListener('beforeunload',warn);return()=>removeEventListener('beforeunload',warn);},[dirty]);
 const change=(next:VideoPlacements)=>{setDraft({value:next,baseline});setMessage('');setError('');};
 const move=(id:string,to:number)=>{const ids=ordered.map(f=>f.id),from=ids.indexOf(id);if(from<0||to<0||to>=ids.length)return;ids.splice(from,1);ids.splice(to,0,id);change({...value,order:ids});};
 async function save(){setBusy(true);setError('');try{await api('/api/desk/placements','PATCH',{previous:baseline,value});await onSaved();setDraft(null);setMessage('Placements saved. The website is updated.');}catch(e){setError(e instanceof Error?e.message:'Could not save placements.');}finally{setBusy(false);}}
 return <div className="placements-editor">
  <div className="placement-intro"><div><span className="eyebrow">YOU’RE IN THE DIRECTOR’S CHAIR</span><h2>Choose what plays where.</h2><p>Only published films appear here. Pick your screens, choose your examples, then save your lineup.</p></div><a className="text-link" href="/" target="_blank" rel="noopener noreferrer">View website <ArrowUpRight size={16}/></a></div>
  <section className="placement-section"><div className="placement-heading"><span>01</span><div><h3>Homepage · six-screen hero</h3><p>Each numbered screen gets its own film. Automatic fills an open slot from your available films.</p></div></div>
   <div className="placement-hero-grid">{value.hero.map((id,index)=><FilmSlot key={index} label={`Hero screen ${index+1}`} films={ordered} value={id} preview={wall[index]} disabledIds={value.hero.filter((_,i)=>i!==index)} onChange={id=>change({...value,hero:value.hero.map((old,i)=>i===index?id:old)})}/>)}</div>
  </section>
  <section className="placement-section"><div className="placement-heading"><span>02</span><div><h3>Video-type examples & opening films</h3><p>The homepage example and the first film on its dedicated page can be different.</p></div></div>
   <div className="placement-type-grid">{channels.map(channel=>{const choices=ordered.filter(f=>f.product===channel.id);return <div className="placement-type" key={channel.id} style={{borderTopColor:channel.color}}><h4>{channel.name}</h4><div><FilmSlot label={`${channel.name} · homepage example`} films={choices} value={value.examples[channel.id]} preview={typeExample(choices,channel.id,value.examples[channel.id])} onChange={id=>change({...value,examples:{...value.examples,[channel.id]:id}})}/><FilmSlot label={`${channel.name} · page opening film`} films={choices} value={value.openers[channel.id]} preview={typeExample(choices,channel.id,value.openers[channel.id])} onChange={id=>change({...value,openers:{...value.openers,[channel.id]:id}})}/></div></div>;})}</div>
  </section>
  <section className="placement-section"><div className="placement-heading"><span>03</span><div><h3>The Work · reel order</h3><p>Drag a film into place, or use its arrows. Filters keep this order. Newly published films join the end.</p></div></div>
   <ol className="placement-order">{ordered.map((film,index)=><li key={film.id} data-film-id={film.id} draggable={!busy} onDragStart={event=>{dragging.current=film.id;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',film.id);}} onDragEnd={()=>{dragging.current=null;}} onDragOver={event=>{if(dragging.current)event.preventDefault();}} onDrop={event=>{event.preventDefault();if(dragging.current)move(dragging.current,index);dragging.current=null;}}><button type="button" className="placement-drag" aria-label={`Drag ${film.title} to reorder`} disabled={busy} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);dragging.current=film.id;}} onPointerUp={event=>{const target=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('li[data-film-id]');const to=ordered.findIndex(f=>f.id===target?.dataset.filmId);if(dragging.current&&to>=0)move(dragging.current,to);dragging.current=null;event.currentTarget.releasePointerCapture(event.pointerId);}} onPointerCancel={()=>{dragging.current=null;}}><GripVertical size={18} aria-hidden/></button><span className="placement-order-number">{String(index+1).padStart(2,'0')}</span><img src={film.poster} alt="" draggable={false} loading="lazy"/><div><b>{film.title}</b><small>{channels.find(c=>c.id===film.product)?.name}</small></div><button type="button" aria-label={`Move ${film.title} up`} disabled={busy||index===0} onClick={()=>move(film.id,index-1)}><ArrowUp size={18}/></button><button type="button" aria-label={`Move ${film.title} down`} disabled={busy||index===ordered.length-1} onClick={()=>move(film.id,index+1)}><ArrowDown size={18}/></button></li>)}</ol>
  </section>
  <div className="placement-savebar"><div role="status">{message|| (dirty?'You have unsaved placement changes.':'Your saved lineup is live.')}{error&&<p className="form-error" role="alert">{error}</p>}</div><div><button className="button small" disabled={busy||!dirty} onClick={()=>{setDraft(null);setError('');setMessage('Changes discarded.');}}>Discard changes</button><button className="button small" disabled={busy} onClick={()=>change(defaultPlacements())}><RotateCcw size={15}/>Reset lineup</button><button className="button light" disabled={busy||!dirty} onClick={save}><Save size={17}/>{busy?'Saving…':'Save placements'}</button></div></div>
 </div>;
}
