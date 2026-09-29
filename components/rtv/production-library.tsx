'use client';
import {useState} from 'react';
import {ArrowUpRight,Clapperboard,Play,RefreshCw,Trash2,Undo2,Upload} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {channels} from '@/lib/catalog';
import type {Film} from './chrome';
import {ShareLink} from './share-link';
import {api} from './forms';

type StudioFilm=Film&{status:string;published:number;share_enabled:boolean;share_path:string|null;deleted_at?:string|null};
function Poster({film}:{film:StudioFilm}){
 const [failed,setFailed]=useState(false);
 const fallback=channels.find(c=>c.id===film.product)?.image;
 return <img src={failed?fallback:film.poster} alt="" onError={()=>setFailed(true)}/>;
}
export function ProductionLibrary({videos,onPlay,onEdit,onUpload,reload}:{videos:StudioFilm[];onPlay:(film:StudioFilm)=>void;onEdit:(film:StudioFilm)=>void;onUpload:()=>void;reload:()=>Promise<void>}){
 const [trash,setTrash]=useState(false),[remove,setRemove]=useState<StudioFilm|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[revision,setRevision]=useState(0);
 const archived=videos.filter(v=>v.deleted_at),visible=videos.filter(v=>trash?!!v.deleted_at:!v.deleted_at);
 async function refresh(){setBusy(true);setError('');try{await reload();setRevision(n=>n+1);}catch(e){setError(e instanceof Error?e.message:'Could not refresh the library.');}finally{setBusy(false);}}
 async function change(v:StudioFilm,action:'trash'|'restore'|'refresh'){
  setBusy(true);setError('');try{await api('/api/desk/videos/'+v.id+'/'+action,'POST',{});await reload();setRemove(null);setRevision(n=>n+1);setMessage(action==='trash'?'Moved to Trash. You can restore it from the Trash view.':action==='restore'?'Restored to the library as private.': 'Processing status updated.');}catch(e){setError(e instanceof Error?e.message:'Could not update this video.');}finally{setBusy(false);}
 }
 return <>
  <div className="production-toolbar"><div role="group" aria-label="Library view"><button className="button small" aria-pressed={!trash} onClick={()=>setTrash(false)}>Videos ({videos.length-archived.length})</button><button className="button small" aria-pressed={trash} onClick={()=>setTrash(true)}><Trash2 size={16}/>Trash ({archived.length})</button></div><button className="button small" disabled={busy} onClick={refresh}><RefreshCw size={16}/>Refresh library</button></div>
  {trash&&<p className="form-note">Removed videos stay here until restored. Restoring keeps them private. Source files are retained.</p>}
  {message&&<p className="desk-notice" role="status">{message}</p>}{error&&<p className="form-error" role="alert">{error}</p>}
  {visible.length?<div className="asset-grid">{visible.map(v=><article className="asset-card" key={v.id}>
   <button className="asset-poster" aria-label={'Preview '+v.title} onClick={()=>onPlay(v)} disabled={trash||v.status!=='Ready'}><Poster key={v.id+'-'+revision} film={v}/>{!trash&&<Play size={28}/>}</button>
   <div><span className={'stage-badge '+(!trash&&v.published?'won':'')}>{trash?'In Trash':v.published?'Published':v.share_enabled?'Shared by link':'Private'} · {v.status}</span><h3>{v.title}</h3><p>{channels.find(c=>c.id===v.product)?.name} · {v.industry||'No industry tag'}</p><p>{v.tags||'No tags'}</p>
   <div className="asset-actions">{trash?<button className="button small" disabled={busy} onClick={()=>change(v,'restore')}><Undo2 size={16}/>Restore video</button>:<>
    {v.status==='Ready'&&<button className="button small" onClick={()=>onPlay(v)}><Play size={16}/>Preview video</button>}
    <button className="button small" onClick={()=>onEdit(v)}>Tags & visibility</button>
    {v.share_path&&<><ShareLink path={v.share_path}/><a className="text-link" href={v.share_path} target="_blank" rel="noopener noreferrer">Open page <ArrowUpRight size={14}/></a></>}
    {['stream','bunny'].includes(v.provider)&&v.status!=='Ready'&&<button className="button small" disabled={busy} onClick={()=>change(v,'refresh')}><RefreshCw size={15}/>Check processing</button>}
    <button className="text-link video-trash-button" aria-label={'Move '+v.title+' to Trash'} disabled={busy} onClick={()=>setRemove(v)}><Trash2 size={15}/>Move to Trash</button>
   </>}</div></div>
  </article>)}</div>:<div className="empty-state"><Clapperboard size={32} style={{margin:'0 auto 15px'}}/><h2>{trash?'Trash is empty.':'Make room for the next great film.'}</h2><p>{trash?'Removed videos will appear here.':'Your uploads begin private, with publication off.'}</p>{!trash&&<button className="button light" style={{marginTop:20}} onClick={onUpload}>Upload a video <Upload size={17}/></button>}</div>}
  <Dialog open={!!remove} onOpenChange={open=>!open&&!busy&&setRemove(null)}><DialogContent className="desk-dialog"><DialogTitle>Move this video to Trash?</DialogTitle><DialogDescription>“{remove?.title}” will leave the library and stop appearing on the website or shared pages. You can restore it later. Its source file will be retained.</DialogDescription>{error&&<p role="alert" className="form-error">{error}</p>}<div className="production-dialog-actions"><button className="button small" disabled={busy} onClick={()=>setRemove(null)}>Keep video</button><button className="button light" disabled={busy} onClick={()=>remove&&change(remove,'trash')}><Trash2 size={16}/>{busy?'Moving…':'Move to Trash'}</button></div></DialogContent></Dialog>
 </>;
}
