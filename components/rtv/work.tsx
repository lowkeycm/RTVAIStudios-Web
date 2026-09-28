'use client';
import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Search,X} from 'lucide-react';
import {Nav,Footer,type Film} from './chrome';
import {channels} from '@/lib/catalog';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {CastFigure} from './cast';
import {CinemaReel} from './cinema-reel';
import {MotionPage} from './motion-page';
import {formatDescriptions} from './format-picker';
export function Work({films,initialFilters={}}:{films:Film[];initialFilters?:{product?:string;industry?:string;q?:string;film?:string}}){
 const [type,setType]=useState(initialFilters.product||'all'),[industry,setIndustry]=useState(initialFilters.industry||'all'),[query,setQuery]=useState(initialFilters.q||''),[active,setActive]=useState(initialFilters.film||''),[ready,setReady]=useState(false);
 const industries=useMemo(()=>Array.from(new Set(films.map(f=>f.industry.trim()).filter(Boolean))).sort(),[films]);
 useEffect(()=>{try{if(sessionStorage.getItem('rtv:restore-work')==='1'){sessionStorage.removeItem('rtv:restore-work');const saved=JSON.parse(sessionStorage.getItem('rtv:work-return')||'{}');requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:Math.max(0,Number(saved.scroll)||0),behavior:'instant'})));}}catch{}const save=(event:MouseEvent)=>{const anchor=(event.target as Element)?.closest?.('a');if(anchor?.getAttribute('href')?.startsWith('/services/'))try{sessionStorage.setItem('rtv:work-return',JSON.stringify({url:location.pathname+location.search,scroll:window.scrollY}));}catch{}};document.addEventListener('click',save);return()=>document.removeEventListener('click',save);},[]);
 useEffect(()=>{const read=()=>{const p=new URLSearchParams(location.search),t=p.get('product')||'all';setType(channels.some(c=>c.id===t)?t:'all');setIndustry(p.get('industry')||'all');setQuery(p.get('q')||'');setActive(p.get('film')||'');setReady(true);};read();addEventListener('popstate',read);return()=>removeEventListener('popstate',read);},[]);
 useEffect(()=>{if(!ready)return;const p=new URLSearchParams();if(type!=='all')p.set('product',type);if(industry!=='all')p.set('industry',industry);if(query)p.set('q',query);if(active)p.set('film',active);history.replaceState(null,'','/work'+(p.size?'?'+p.toString():''));},[type,industry,query,active,ready]);
 const visible=films.filter(f=>(type==='all'||f.product===type)&&(industry==='all'||f.industry.trim()===industry)&&`${f.title} ${f.tags} ${f.description}`.toLowerCase().includes(query.toLowerCase()));
 const reset=()=>{setType('all');setIndustry('all');setQuery('');setActive('');};
 return <MotionPage><Nav active="/work"/><main className="reel-library">
  <header className="reel-heading"><a className="back-link" href="/"><ArrowLeft size={16}/>Home</a><div><div><span className="eyebrow">THE WORK / FILM LIBRARY</span><h1>Good stories.<br/><em>Ready to roll.</em></h1></div><p>Find the right kind of inspiration.<br/>Choose a video type or an industry, then press play.</p></div></header>
  <section className="reel-browser" aria-label="Video gallery"><div className="reel-filters"><div className="type-filters" aria-label="Filter by video type"><button aria-pressed={type==='all'} onClick={()=>{setType('all');setActive('');}}>All videos</button>{channels.map(c=><button key={c.id} aria-pressed={type===c.id} onClick={()=>{setType(c.id);setActive('');}}>{formatDescriptions[c.id].label}</button>)}</div><div className="reel-filter-secondary"><Select value={industry} onValueChange={value=>{setIndustry(value);setActive('');}}><SelectTrigger className="industry-filter" aria-label="Filter by industry"><SelectValue placeholder="All industries"/></SelectTrigger><SelectContent><SelectItem value="all">All industries</SelectItem>{industries.map(i=><SelectItem value={i} key={i}>{i}</SelectItem>)}</SelectContent></Select><label className="reel-search"><Search size={18}/><input value={query} onChange={e=>{setQuery(e.target.value);setActive('');}} placeholder="Find a film" aria-label="Search films"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label><span className="reel-count" aria-live="polite">{visible.length} {visible.length===1?'film':'films'}</span>{(type!=='all'||industry!=='all'||query)&&<button className="clear-filters" onClick={reset}>Clear filters <X size={14}/></button>}</div></div>
  {visible.length?<CinemaReel key={visible.map(f=>f.id).join('|')} films={visible} selectedId={visible.some(f=>f.id===active)?active:visible[0].id} onSelect={setActive}/>:<div className="reel-empty"><h2>No films match these filters.</h2><p>Try another combination or browse the full collection.</p><button className="button light" onClick={reset}>Show all videos <ArrowUpRight size={17}/></button></div>}
  </section>
  <div className="reel-help studio-surface cast-work-scene" data-scroll-scene><div><span>Found a direction you like?</span><a href="/#formats" className="text-link">Choose your video type <ArrowUpRight size={18}/></a></div><CastFigure id="tasha-green" label/></div>
 </main><Footer/></MotionPage>;
}
