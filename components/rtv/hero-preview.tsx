'use client';
import {useEffect,useRef} from 'react';
import type {Film} from './chrome';
import {useSiteMotion} from './motion-page';
import {useVideoMedia} from './use-video-media';

export function HeroPreview({film,suspended}:{film:Film;suspended:boolean}){
 const video=useRef<HTMLVideoElement>(null),{paused}=useSiteMotion();
 const media=useVideoMedia(video,film,true);
 useEffect(()=>{
  const el=video.current;if(!el)return;
  let visible=false,watching=false,cancelled=false;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>{
   if(visible&&!paused&&!suspended&&!watching&&!document.hidden&&!preference.matches){
    media.muted=true;
    void media.play().catch(()=>{/* Autoplay denial leaves the poster and full-film button available. */});
   }else media.pause();
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1});
  observer.observe(el);
  const watch=(event:Event)=>{watching=(event as CustomEvent).detail!=='wall-close';sync();};
  const loop=()=>{if(el.currentTime>=8)el.currentTime=0;};
  const ended=()=>{if(!cancelled){el.currentTime=0;sync();}};
  el.addEventListener('timeupdate',loop);el.addEventListener('ended',ended);
  document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);
  window.addEventListener('rtv:watch-film',watch);
  return()=>{cancelled=true;observer.disconnect();media.pause();el.removeEventListener('timeupdate',loop);el.removeEventListener('ended',ended);document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',sync);window.removeEventListener('rtv:watch-film',watch);};
 },[media,paused,suspended]);
 return film.provider==='stream'?<img src={film.poster} alt=""/>:<video ref={video} src={film.provider==='bunny'?undefined:film.source} poster={film.poster||undefined} muted playsInline preload="none" aria-hidden tabIndex={-1}/>;
}
