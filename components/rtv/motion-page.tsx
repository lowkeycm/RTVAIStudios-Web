'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
const MotionContext=createContext({paused:false,toggle:()=>{}});
export const useSiteMotion=()=>useContext(MotionContext);
export function MotionPage({children}:{children:ReactNode}){
 const root=useRef<HTMLDivElement>(null),[paused,setPaused]=useState(false);
 useEffect(()=>{const preference=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setPaused(preference.matches);sync();preference.addEventListener('change',sync);return()=>preference.removeEventListener('change',sync);},[]);
 useEffect(()=>{const el=root.current;if(!el)return;const items=el.querySelectorAll<HTMLElement>('[data-reveal]');
  if(paused){items.forEach(item=>item.classList.add('is-visible'));el.classList.remove('motion-ready');return;}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
  items.forEach(item=>{if(item.getBoundingClientRect().top<innerHeight-24)item.classList.add('is-visible');else observer.observe(item);});el.classList.add('motion-ready');
  return()=>{observer.disconnect();el.classList.remove('motion-ready');};
 },[paused]);
 useEffect(()=>{const el=root.current;if(!el)return;let frame=0;
  const update=()=>{frame=0;el.querySelectorAll<HTMLElement>('[data-scroll-scene]').forEach(scene=>{const box=scene.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight)return;const progress=Math.max(-1,Math.min(1,(innerHeight*.5-(box.top+box.height*.5))/innerHeight));scene.style.setProperty('--travel',paused?'0':String(progress));});};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};update();if(!paused){addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);}return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);};
 },[paused]);
 return <MotionContext.Provider value={{paused,toggle:()=>setPaused(p=>!p)}}><div ref={root} className={'motion-page'+(paused?' motion-paused':'')}>{children}</div></MotionContext.Provider>;
}
