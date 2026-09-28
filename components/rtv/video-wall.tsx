'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Pause,Play,X} from 'lucide-react';
import type {Film} from './chrome';
import {AmbientFilm,InlineFilm} from './inline-film';
import {useSiteMotion} from './motion-page';
const previews:Record<string,string>={'rtv-bang':'/studio/previews/bang.mp4','rtv-impossible':'/studio/previews/impossible.mp4'};
export function VideoWall({films}:{films:Film[]}){
 const [selected,setSelected]=useState<string|null>(null),{paused,toggle}=useSiteMotion();
 const buttons=useRef<Record<string,HTMLButtonElement|null>>({}),closeButton=useRef<HTMLButtonElement>(null);
 const close=()=>{const id=selected;window.dispatchEvent(new CustomEvent('rtv:watch-film',{detail:'wall-close'}));setSelected(null);if(id)requestAnimationFrame(()=>buttons.current[id]?.focus({preventScroll:true}));};
 useEffect(()=>{if(!selected)return;closeButton.current?.focus({preventScroll:true});const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')close();};const dismiss=(e:MouseEvent)=>{const target=e.target;if(target instanceof Element&&!target.closest('.screen-selected, .selected-screen-heading'))close();};document.addEventListener('keydown',escape);document.addEventListener('click',dismiss);return()=>{document.removeEventListener('keydown',escape);document.removeEventListener('click',dismiss);};},[selected]);
 const active=films.find(f=>f.id===selected);
 return <div className={'cinema-wall'+(selected?' wall-selected':'')} data-scroll-scene>
  <div className="cinema-wall-meta"><span>RTV / IN MOTION</span><button className="motion-toggle" onClick={toggle} aria-pressed={paused} aria-label={paused?'Resume motion':'Pause motion'}>{paused?<Play size={14}/>:<Pause size={14}/>}<span>{paused?'Resume motion':'Pause motion'}</span></button></div>
  <div className="screen-installation" aria-label="Choose a film to watch">
   {films.slice(0,6).map((film,index)=><div className={'installation-screen screen-position-'+index+(selected===film.id?' screen-selected':'')+(selected&&selected!==film.id?' screen-recedes':'')} key={film.id} style={{'--screen-index':index} as CSSProperties} inert={selected&&selected!==film.id?true:undefined}>
    {selected===film.id?<InlineFilm film={film} autoStart/>:<>
     {previews[film.id]?<AmbientFilm film={{...film,source:previews[film.id]}} suspended={!!selected}/>:<img src={film.poster} alt="" loading={index<3?'eager':'lazy'}/>}
     <button ref={el=>{buttons.current[film.id]=el;}} className="installation-play" aria-label={'Expand and play '+film.title} onClick={e=>{e.stopPropagation();setSelected(film.id);}}><span className="installation-number">{String(index+1).padStart(2,'0')}</span><span className="installation-label">{film.title}<span><Play size={16} fill="currentColor"/></span></span></button>
    </>}
   </div>)}
   {active&&<div className="selected-screen-heading"><span>{active.title}</span><button ref={closeButton} className="metal-control" onClick={close} aria-label="Return to all screens"><X size={20}/></button></div>}
  </div>
  <div className="cinema-wall-footer"><span>{selected?'NOW SHOWING':'SELECT A SCREEN. STEP INTO THE STORY.'}</span><a href="/work">{String(Math.min(6,films.length)).padStart(2,'0')} SCREENS / EXPLORE THE WORK</a></div>
 </div>;
}
