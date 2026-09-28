'use client';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {channels, type Channel} from '@/lib/catalog';
import type {Film} from './chrome';

export type MediaHandle = {play:()=>Promise<void>;pause:()=>void;muted:boolean;volume:number;currentTime:number;duration:number;paused:boolean;addEventListener:(event:string,listener:()=>void)=>void;removeEventListener:(event:string,listener:()=>void)=>void};
export function useStudioPlayback(films:Film[], initial:Channel='impossible', fixedChannel=false) {
  const [channel,setChannel]=useState<Channel>(initial),[index,setIndex]=useState(0),[query,setQuery]=useState('');
  const [playing,setPlaying]=useState(false),[muted,setMuted]=useState(false),[powered,setPowered]=useState(true);
  const [volume,setVolume]=useState(.7),[progress,setProgress]=useState(0),[duration,setDuration]=useState(0),[error,setError]=useState('');
  const [tuning,setTuning]=useState(false),[initialized,setInitialized]=useState(false);
  const media=useRef<MediaHandle|null>(null),screen=useRef<HTMLElement|null>(null),resume=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const playlist=useMemo(()=>films.filter(f=>f.product===channel&&`${f.title} ${f.industry} ${f.tags}`.toLowerCase().includes(query.toLowerCase())),[films,channel,query]);
  const film=playlist[Math.min(index,Math.max(0,playlist.length-1))];
  const tune=useCallback(()=>{setTuning(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setTuning(false),280);},[]);
  const stop=useCallback(()=>{media.current?.pause();setPlaying(false);setProgress(0);setDuration(0);setError('');},[]);
  const selectChannel=useCallback((id:Channel)=>{resume.current=false;stop();setChannel(id);setIndex(0);setQuery('');setPowered(true);tune();},[stop,tune]);
  const selectFilm=useCallback((id:string)=>{const n=playlist.findIndex(f=>f.id===id);if(n<0)return;resume.current=true;stop();setIndex(n);setPowered(true);tune();if(film?.id===id)media.current?.play().catch(()=>setError('Press play on the screen to start.'));},[playlist,film,stop,tune]);
  const next=useCallback((step:number)=>{if(playlist.length<2)return;resume.current=playing;stop();setIndex(i=>(i+step+playlist.length)%playlist.length);setPowered(true);tune();},[playlist.length,playing,stop,tune]);
  const toggle=useCallback(()=>{if(!film)return;setPowered(true);const m=media.current;if(!m){setError('Use the play control on the screen.');return;}if(!m.paused){m.pause();}else{m.play().catch(()=>setError('Playback could not start. Press play on the screen to retry.'));}},[film]);
  const power=useCallback(()=>{if(powered){media.current?.pause();setPlaying(false);}setPowered(v=>!v);},[powered]);
  const changeVolume=useCallback((delta:number)=>{setMuted(false);setVolume(v=>Math.min(1,Math.max(0,Math.round((v+delta)*10)/10)));},[]);
  const seek=useCallback((seconds:number)=>{if(media.current&&Number.isFinite(seconds))media.current.currentTime=seconds;},[]);
  const fullscreen=useCallback(()=>{const el=screen.current as (HTMLElement&{webkitEnterFullscreen?:()=>void})|null;if(el?.requestFullscreen)void el.requestFullscreen().catch(()=>setError('Fullscreen is unavailable in this browser.'));else{const video=media.current as (MediaHandle&{webkitEnterFullscreen?:()=>void})|null;video?.webkitEnterFullscreen?.();}},[]);
  const bind=useCallback((handle:MediaHandle|null, element:HTMLElement|null)=>{media.current=handle;screen.current=element;if(handle&&Number.isFinite(handle.duration))setDuration(handle.duration);},[]);
  useEffect(()=>{const m=media.current;if(m){m.muted=muted;m.volume=volume;}},[muted,volume,film?.id]);
  useEffect(()=>{setIndex(0);},[query]);
  useEffect(()=>{const params=new URLSearchParams(location.search);const ch=params.get('product');if(!fixedChannel&&ch&&channels.some(c=>c.id===ch))setChannel(ch as Channel);const id=params.get('film');if(id){const f=films.find(f=>f.id===id);if(f&&(!fixedChannel||f.product===initial)){setChannel(f.product as Channel);setIndex(films.filter(x=>x.product===f.product).findIndex(x=>x.id===id));}}setInitialized(true);return()=>{if(timer.current)clearTimeout(timer.current);media.current?.pause();};},[films,fixedChannel,initial]);
  useEffect(()=>{if(!initialized)return;const url=new URL(location.href);if(url.pathname==='/work'){url.searchParams.set('product',channel);if(film)url.searchParams.set('film',film.id);else url.searchParams.delete('film');history.replaceState(null,'',url.pathname+url.search+url.hash);}},[channel,film?.id,initialized]);
  const onReady=useCallback(()=>{const m=media.current;if(!m)return;m.muted=muted;m.volume=volume;setDuration(Number.isFinite(m.duration)?m.duration:0);if(resume.current){resume.current=false;m.play().catch(()=>setError('Press play to watch this film.'));}},[muted,volume]);
  const events={onPlay:()=>{setPlaying(true);setError('');},onPause:()=>setPlaying(false),onTimeUpdate:()=>{const m=media.current;if(m){setProgress(m.currentTime||0);setDuration(Number.isFinite(m.duration)?m.duration:0);}},onVolumeChange:()=>{const m=media.current;if(m){setMuted(m.muted);setVolume(m.volume);}},onEnded:()=>setPlaying(false),onError:()=>{setPlaying(false);setError('This film could not load. Check your connection and try again.');},onLoadedMetadata:onReady,onCanPlay:onReady};
  return {channel,playlist,film,index,query,setQuery,playing:!!film&&playing,muted,powered,volume,progress:film?progress:0,duration:film?duration:0,error:film?error:'',tuning,selectChannel,selectFilm,next,toggle,power,changeVolume,seek,fullscreen,bind,events,toggleMute:()=>setMuted(v=>!v)};
}
export type Playback=ReturnType<typeof useStudioPlayback>;
export const time=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
