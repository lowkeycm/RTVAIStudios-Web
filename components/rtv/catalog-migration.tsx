'use client';
import {useEffect,useRef,useState} from 'react';
import {baselineFilms} from '@/lib/catalog';
import {api} from './forms';
type ImportRow={video_id:string;state:string;error:string};
export function CatalogMigration({imports,reload}:{imports:ImportRow[];reload:()=>Promise<void>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const checking=useRef(false);
 const complete=imports.filter(row=>row.state==='complete').length;
 useEffect(()=>{
  if(!imports.some(row=>['requested','processing'].includes(row.state)))return;
  const timer=setTimeout(async()=>{if(checking.current||document.hidden)return;checking.current=true;try{const pending=imports.filter(row=>['requested','processing'].includes(row.state));await Promise.all(pending.map(row=>api('/api/desk/catalog-import/check','POST',{id:row.video_id})));await reload();}catch(e){setError(e instanceof Error?e.message:'Could not check imports.');}finally{checking.current=false;}},15000);
  return()=>clearTimeout(timer);
 },[imports,reload]);
 async function start(){setBusy(true);setError('');try{await api('/api/desk/catalog-import/prepare','POST',{});for(const film of baselineFilms){if(imports.find(row=>row.video_id===film.id)?.state==='complete')continue;await api('/api/desk/catalog-import/start','POST',{id:film.id});}await reload();}catch(e){setError(e instanceof Error?e.message:'Could not start imports.');}finally{setBusy(false);}}
 async function check(){setBusy(true);setError('');try{await Promise.all(imports.filter(row=>!['complete','queued','error'].includes(row.state)).map(row=>api('/api/desk/catalog-import/check','POST',{id:row.video_id})));await reload();}catch(e){setError(e instanceof Error?e.message:'Could not check imports.');}finally{setBusy(false);}}
 if(complete===baselineFilms.length)return <p className="catalog-migration-complete">All {complete} original films now stream through Bunny. Their original files are retained.</p>;
 return <details className="catalog-migration" open={imports.length>0}><summary>Original gallery migration <span>{complete} / {baselineFilms.length} verified</span></summary><p>Copies the existing films to Bunny. Each original stays live until its replacement finishes encoding and passes delivery checks.</p><div className="asset-actions"><button className="button light" disabled={busy} onClick={start}>{busy?'Working…':imports.length?'Continue migration':'Migrate original films'}</button>{imports.length>0&&<button className="button" disabled={busy} onClick={check}>Check migration</button>}</div>{error&&<p className="form-error" role="alert">{error}</p>}{imports.length>0&&<ul>{baselineFilms.map(film=>{const row=imports.find(row=>row.video_id===film.id);return <li key={film.id}><b>{film.title}</b><span>{row?.state==='complete'?'Verified · Bunny live':row?.state||'Waiting'}</span>{row?.error&&<small>{row.error}</small>}</li>;})}</ul>}</details>;
}
