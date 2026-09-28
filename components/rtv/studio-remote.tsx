'use client';
import {useEffect,useRef,useState} from 'react';
import {Power,VolumeX,Volume2,Plus,Minus,Play,Pause,ChevronUp,ChevronDown,Maximize,PanelBottomClose,Info} from 'lucide-react';
import {channels} from '@/lib/catalog';
import type {Playback} from './playback';

export function StudioRemote({player,inline=false,serviceMode=false}:{player?:Playback;inline?:boolean;serviceMode?:boolean}) {
 const [open,setOpen]=useState(inline),remote=useRef<HTMLElement>(null);
 const channel=channels.find(c=>c.id===player?.channel);
 useEffect(()=>{if(!open||inline)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[open,inline]);
 const watch=(action:()=>void)=>{if(player)action();else location.href='/work';};
 return <aside ref={remote} className={`studio-remote ${inline?'inline-remote':'floating-remote'} ${open?'remote-open':'remote-docked'}`} aria-label="Studio remote control">
  {!open?<button className="remote-wake" onClick={()=>setOpen(true)} aria-label="Open studio remote" aria-expanded={false}><span className="remote-mini-light"/><span className="remote-mini-brand">RTV</span><span className="remote-mini-pad"><ChevronUp size={13}/><i/><ChevronDown size={13}/></span><span className="remote-mini-label">REMOTE</span></button>:<>
   <div className="remote-top"><span className="remote-brand">RTV <small>STUDIO CONTROL</small></span><button className={'remote-power '+(player?.powered?'is-on':'')} onClick={()=>watch(()=>player!.power())} aria-label={player?.powered?'Turn screen off':'Turn screen on'} aria-pressed={player?.powered??false}><Power size={18}/></button></div>
   <div className="remote-display" aria-live="polite"><span>{player?(player.powered?'NOW TUNED TO':'STANDBY'):'SELECT A CHANNEL'}</span><strong>{channel?`CH ${channel.number}`:'RTV / 01—04'}</strong><small>{channel?.name||'VIDEO TYPES'}</small></div>
   <div className="remote-channel-grid">{channels.map(c=><button key={c.id} className={player?.channel===c.id?'active':''} onClick={()=>serviceMode?location.assign('/services/'+c.id):player?player.selectChannel(c.id):location.assign('/services/'+c.id)} aria-label={(serviceMode?'Explore ':'Select ')+c.name} aria-pressed={player?.channel===c.id}><b>{c.number}</b><span>{c.id==='impossible'?'IMPOSSIBLE':c.id==='avatar'?'AVATAR':c.id==='universe'?'UNIVERSE':'THE SPOT'}</span></button>)}</div>
   <div className="remote-navigation"><div className="remote-rocker"><button aria-label="Volume up" onClick={()=>watch(()=>player!.changeVolume(.1))} disabled={!!player&&!player.film}><Plus size={19}/></button><span>VOL</span><button aria-label="Volume down" onClick={()=>watch(()=>player!.changeVolume(-.1))} disabled={!!player&&!player.film}><Minus size={19}/></button></div><button className="remote-play" onClick={()=>watch(()=>player!.toggle())} disabled={!!player&&!player.film} aria-label={player?.playing?'Pause film':'Play film'}>{player?.playing?<Pause size={24} fill="currentColor"/>:<Play size={24} fill="currentColor"/>}</button><div className="remote-rocker"><button aria-label="Next film" onClick={()=>watch(()=>player!.next(1))} disabled={!!player&&player.playlist.length<2}><ChevronUp size={22}/></button><span>CH</span><button aria-label="Previous film" onClick={()=>watch(()=>player!.next(-1))} disabled={!!player&&player.playlist.length<2}><ChevronDown size={22}/></button></div></div>
   <div className="remote-utilities"><button aria-label={player?.muted?'Unmute':'Mute'} onClick={()=>watch(()=>player!.toggleMute())} disabled={!!player&&!player.film}>{player?.muted?<VolumeX size={17}/>:<Volume2 size={17}/>}<span>MUTE</span></button><button aria-label="Fullscreen video" onClick={()=>watch(()=>player!.fullscreen())} disabled={!!player&&!player.film}><Maximize size={17}/><span>FULL</span></button><a href={'/services/'+(player?.channel||'spot')} aria-label="View channel package"><Info size={17}/><span>INFO</span></a></div>
   <a className="remote-talk" href={'/book?product='+(player?.channel||'spot')}>LET’S MAKE SOMETHING</a>
   <div className="remote-bottom"><span>RTV · UNIVERSAL</span>{!inline&&<button onClick={()=>setOpen(false)} aria-label="Put remote away"><PanelBottomClose size={17}/></button>}</div>
  </>}
 </aside>;
}
