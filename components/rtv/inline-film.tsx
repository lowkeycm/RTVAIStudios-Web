'use client';
import {useEffect,useId,useRef,useState,useImperativeHandle,type Ref} from 'react';
import {Play,RotateCcw} from 'lucide-react';
import type {Film} from './chrome';
import {useSiteMotion} from './motion-page';
import {useVideoMedia} from './use-video-media';
const watchEvent='rtv:watch-film';
export type FilmPlaybackHandle={toggle:()=>void;stop:()=>void};
export function InlineFilm({film,autoStart=false,onStart,playbackRef,onPlaybackChange}:{film:Film;autoStart?:boolean;onStart?:()=>void;playbackRef?:Ref<FilmPlaybackHandle>;onPlaybackChange?:(playing:boolean)=>void}){
 const id=useId(),video=useRef<HTMLVideoElement>(null),container=useRef<HTMLDivElement>(null);
 const media=useVideoMedia(video,film);
 const [started,setStarted]=useState(false),[error,setError]=useState(false);
 const start=()=>{window.dispatchEvent(new CustomEvent(watchEvent,{detail:id}));setStarted(true);setError(false);onStart?.();if(film.provider==='stream')onPlaybackChange?.(true);if(film.provider!=='stream')media.play().catch(()=>setError(true));};
 useEffect(()=>{const stop=(event:Event)=>{if((event as CustomEvent).detail===id)return;media.pause();if(film.provider==='stream'){setStarted(false);onPlaybackChange?.(false);}};window.addEventListener(watchEvent,stop);const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting){media.pause();if(film.provider==='stream'){setStarted(false);onPlaybackChange?.(false);}}},{threshold:0});if(container.current)observer.observe(container.current);return()=>{window.removeEventListener(watchEvent,stop);observer.disconnect();};},[id,film.provider,media]);
 useEffect(()=>{if(autoStart)start();},[autoStart]);
 useImperativeHandle(playbackRef,()=>({toggle:()=>{if(film.provider==='stream'){if(started){setStarted(false);onPlaybackChange?.(false);}else{start();onPlaybackChange?.(true);}}else if(video.current?.paused)start();else media.pause();},stop:()=>{media.pause();if(video.current)video.current.currentTime=0;setStarted(false);setError(false);onPlaybackChange?.(false);}}));
 const source=film.source+(film.source.includes('?')?'&':'?')+'autoplay=true&controls=true';
 return <div ref={container} className={'inline-film'+(started?' is-playing':'')} data-film={film.id}>
  {film.provider==='stream'?(started?<iframe title={film.title} src={source} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>:<img src={film.poster} alt="" loading="lazy"/>):<video ref={video} src={film.provider==='bunny'?undefined:film.source} poster={film.poster||undefined} controls={started} playsInline preload="none" onPause={()=>onPlaybackChange?.(false)} onEnded={()=>onPlaybackChange?.(false)} onPlay={()=>{onPlaybackChange?.(true);window.dispatchEvent(new CustomEvent(watchEvent,{detail:id}));setStarted(true);setError(false);}} onError={()=>setError(true)}/>}
  {!started&&<button className="inline-play" aria-label={'Play '+film.title} onClick={start}><span><Play size={25} fill="currentColor"/></span><b>Watch film</b></button>}
  {error&&<div className="inline-error" role="alert"><p>Playback couldn’t start.</p><button onClick={()=>{if(film.provider!=='bunny')video.current?.load();start();}}><RotateCcw size={16}/>Try again</button></div>}
 </div>;
}
export function AmbientFilm({film,suspended=false}:{film:Film;suspended?:boolean}){
 const video=useRef<HTMLVideoElement>(null),{paused}=useSiteMotion();
 useEffect(()=>{const el=video.current;if(!el)return;let visible=false,watching=false;const sync=()=>{if(visible&&!paused&&!suspended&&!watching&&!matchMedia('(prefers-reduced-motion: reduce)').matches)void el.play().catch(()=>{});else el.pause();};const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1});observer.observe(el);const stop=()=>{watching=true;sync();};window.addEventListener(watchEvent,stop);return()=>{observer.disconnect();window.removeEventListener(watchEvent,stop);el.pause();};},[paused,suspended]);
 return film.provider==='stream'||film.provider==='bunny'?<img src={film.poster} alt=""/>:<video ref={video} src={film.provider==='bunny'?undefined:film.source} poster={film.poster||undefined} muted loop playsInline preload="metadata" aria-hidden tabIndex={-1}/>;
}
