'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Menu, X, ChevronDown, Radio, ArrowRight, Play, Pause, Square } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator} from '@/components/ui/dropdown-menu';
import {channels} from '@/lib/catalog';
import { StudioRemote } from './studio-remote';
import {InlineFilm,type FilmPlaybackHandle} from './inline-film';
export function Brand(){return <a className="brand brand-art" href="/" aria-label="RTV AI Studios home"><picture><source media="print" srcSet="/brand/rtv-light.webp"/><img src="/brand/rtv-dark.webp" alt="RTV AI Studios" width={2048} height={1143}/></picture></a>}
export function Nav({active=''}:{active?:string}){const [open,setOpen]=useState(false);return <header className="nav"><Brand/><nav aria-label="Main navigation" className={open?'nav-links is-open':'nav-links'}>
 <DropdownMenu modal={false}><DropdownMenuTrigger asChild><button className={'video-types-trigger'+(active.startsWith('/services/')?' active':'')} aria-label="Video types"><span>Video types</span><ChevronDown size={15}/></button></DropdownMenuTrigger><DropdownMenuContent align="start" sideOffset={15} className="video-types-menu" collisionPadding={16}>
 <div className="video-types-menu-label">CHOOSE YOUR PRODUCTION</div>{channels.map(c=><DropdownMenuItem asChild key={c.id}><a className="video-type-menu-link" href={'/services/'+c.id} onClick={()=>setOpen(false)} aria-current={active==='/services/'+c.id?'page':undefined} style={{'--offer-color':c.color} as CSSProperties}><span className="menu-channel">{c.number}</span><span><strong>{c.name}</strong><small>{c.short}</small></span><ArrowUpRight size={18}/></a></DropdownMenuItem>)}<DropdownMenuSeparator/><DropdownMenuItem asChild><a className="video-types-compare" href="/#formats" onClick={()=>setOpen(false)}>Compare all video types <ArrowRight size={16}/></a></DropdownMenuItem>
 </DropdownMenuContent></DropdownMenu>
 {[['The work','/work'],['Our studio','/studio'],['Pricing','/pricing']].map(([label,path])=><a key={path} className={active===path?'active':''} href={path}>{label}</a>)}<a className="nav-book" href="/book">Let’s talk <ArrowUpRight size={16}/></a></nav><button className="menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header>}
export function Footer(){return <footer><div className="footer-top"><Brand/><p>Everyone has a story to tell.<br/>We make the world listen.</p><a className="text-link" href="/book">Start your next story <ArrowUpRight size={20}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RTV AI Studios</span><div><a href="/pricing#terms">Project terms</a><a href="/privacy">Privacy</a><a href="/desk">Team entrance <ArrowUpRight size={12}/></a></div></div></footer>}
export function Remote(){return <StudioRemote/>;}
export type Film={id:string;title:string;product:string;industry:string;tags:string;poster:string;source:string;provider:string;placement:string;description:string};
function PreviewPlayback({film}:{film:Film}){
 const playback=useRef<FilmPlaybackHandle>(null),[playing,setPlaying]=useState(false);
 return <><InlineFilm film={film} autoStart playbackRef={playback} onPlaybackChange={setPlaying}/><div className="studio-preview-controls"><button className="button small" onClick={()=>playback.current?.toggle()}>{playing?<Pause size={17}/>:<Play size={17}/>} {playing?'Pause video':'Play video'}</button><button className="button small" onClick={()=>playback.current?.stop()}><Square size={16}/>Stop video</button><span>Studio preview · publishing is not required.</span></div></>;
}
export function FilmPlayer({film,onClose}:{film:Film|null;onClose:()=>void}){return <Dialog open={!!film} onOpenChange={v=>!v&&onClose()}><DialogContent className="film-dialog"><DialogTitle>{film?.title}</DialogTitle><DialogDescription>{film?.description||'Preview this film in your production library.'}</DialogDescription>{film&&<PreviewPlayback key={film.id} film={film}/>}</DialogContent></Dialog>}
export function Attribution(){useEffect(()=>{const p=new URLSearchParams(location.search);const ref=p.get('ref');if(ref&&/^[a-zA-Z0-9_-]{3,40}$/.test(ref)){document.cookie=`rtv_ref=${encodeURIComponent(ref)}; Max-Age=2592000; Path=/; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;}},[]);return null}
