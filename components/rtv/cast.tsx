'use client';
import {useEffect,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Pause,Play} from 'lucide-react';
import {cast} from '@/lib/cast';
import {useSiteMotion} from './motion-page';

export type CastId=typeof cast[number]['id'];
const castImage=(id:CastId)=>'/studio/cast/poses/'+(id==='truth-washington'?'truth-washington-faithful':id)+'.webp';
export function CastFigure({id,className='',label=false}:{id:CastId;className?:string;label?:boolean}){
 const character=cast.find(c=>c.id===id)!;
 return <figure className={'cast-figure '+className} style={{'--cast-color':character.color} as CSSProperties}><img src={castImage(id)} alt={label?character.name+', from the RTV cast':''} loading="lazy" draggable={false}/>{label&&<figcaption>{character.name}<span>THE RTV CAST</span></figcaption>}</figure>;
}
export function CastPreview(){return <a className="cast-preview cast-preview-link" href="/studio#cast">Meet the cast <ArrowUpRight size={18}/></a>;}

export function StudioCast(){
 const {paused,toggle}=useSiteMotion();
 const section=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),figures=useRef<(HTMLDivElement|null)[]>([]);
 const position=useRef(0),target=useRef(0),wake=useRef<()=>void>(()=>{}),paintNow=useRef<()=>void>(()=>{}),lastIndex=useRef(0);
 const gesture=useRef<{id:number;x:number;y:number;base:number;dragged:boolean}|null>(null);
 const [active,setActive]=useState(0),[ready,setReady]=useState(false);
 const current=cast[active];
 useEffect(()=>{
  const el=section.current,scene=stage.current;if(!el||!scene)return;
  let frame=0,visible=true,last=performance.now();setReady(true);
  const paint=()=>{const width=scene.clientWidth,height=scene.clientHeight,radius=Math.min(width*.38,470),depth=Math.min(width*.32,370);
   figures.current.forEach((figure,i)=>{if(!figure)return;const angle=(i-position.current)*Math.PI/3,front=Math.cos(angle),x=Math.sin(angle)*radius,z=(front-1)*depth,y=(1-front)*-height*.09;
    figure.style.transform=`translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),${z}px) rotateY(${-Math.sin(angle)*16}deg)`;
    figure.style.opacity=String(.35+(front+1)*.325);figure.style.filter=`brightness(${.6+(front+1)*.2})`;figure.style.zIndex=String(Math.round((front+1)*10));
   });
   const index=((Math.round(position.current)%cast.length)+cast.length)%cast.length;
   if(index!==lastIndex.current){lastIndex.current=index;setActive(index);}
  };
  paintNow.current=paint;
  const animate=(now:number)=>{frame=0;if(!visible||gesture.current?.dragged)return;const elapsed=Math.min(64,now-last);last=now;position.current=paused?target.current:position.current+(target.current-position.current)*(1-Math.exp(-elapsed/110));if(Math.abs(target.current-position.current)<.001)position.current=target.current;paint();if(position.current!==target.current)frame=requestAnimationFrame(animate);};
  const start=()=>{if(!frame){last=performance.now();frame=requestAnimationFrame(animate);}};wake.current=start;
  const sync=()=>{paint();start();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)sync();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px'});observer.observe(el);
  const resize=new ResizeObserver(sync);resize.observe(scene);sync();
  return()=>{observer.disconnect();resize.disconnect();cancelAnimationFrame(frame);wake.current=()=>{};paintNow.current=()=>{};};
 },[paused]);
 const select=(index:number)=>{
  const normalized=((index%cast.length)+cast.length)%cast.length;
  let next=Math.round(position.current)+(normalized-((Math.round(position.current)%cast.length+cast.length)%cast.length));
  if(next-position.current>3)next-=cast.length;if(next-position.current< -3)next+=cast.length;
  target.current=next;wake.current();
 };
 const dragStart=(e:ReactPointerEvent<HTMLDivElement>)=>{
  if(e.button!==0||!e.isPrimary)return;
  gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,base:position.current,dragged:false};
 };
 const dragMove=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const g=gesture.current;if(!g||g.id!==e.pointerId)return;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.dragged&&Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){gesture.current=null;return;}
  if(!g.dragged&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)*1.2){
   g.dragged=true;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('is-dragging');
  }
  if(g.dragged){e.preventDefault();position.current=g.base-dx/Math.max(140,e.currentTarget.clientWidth*.32);target.current=position.current;paintNow.current();}
 };
 const dragEnd=(e:ReactPointerEvent<HTMLDivElement>,cancel=false)=>{
  const g=gesture.current;if(!g||g.id!==e.pointerId)return;gesture.current=null;
  e.currentTarget.classList.remove('is-dragging');if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  if(!g.dragged)return;
  const dx=e.clientX-g.x,travel=position.current-g.base;
  target.current=cancel?Math.round(g.base):Math.abs(dx)>35&&Math.abs(travel)<.5?Math.round(g.base)+(dx<0?1:-1):Math.round(position.current);
  wake.current();
 };
 return <section ref={section} id="cast" className={'cast-orbit-section'+(paused?' orbit-paused':'')+(ready?' orbit-ready':'')} aria-label="Meet the RTV cast">
  <div className="cast-orbit-panel studio-surface">
   <div className="orbit-topline"><span className="eyebrow">MEET THE CAST / REALTRUTHVYBES</span><button className="motion-toggle" onClick={toggle} aria-label={paused?'Resume cast motion':'Pause cast motion'} aria-pressed={paused}>{paused?<Play size={14}/>:<Pause size={14}/>}<span>{paused?'Resume motion':'Pause motion'}</span></button></div>
   <div className="orbit-heading"><h2>Six characters.<br/><em>Plenty of stories.</em></h2><p>Meet the fictional cast in RTV’s studio world.<br/>{' '}Drag or swipe to bring each personality into the spotlight.</p></div>
   <div ref={stage} className="cast-orbit-stage" role="region" aria-roledescription="carousel" aria-label="RTV cast carousel" tabIndex={0} aria-keyshortcuts="ArrowLeft ArrowRight Home End"
    onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();target.current=Math.round(target.current)+(e.key==='ArrowRight'?1:-1);wake.current();}else if(e.key==='Home'||e.key==='End'){e.preventDefault();select(e.key==='Home'?0:cast.length-1);}}}
    onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={e=>dragEnd(e)} onPointerCancel={e=>dragEnd(e,true)} onLostPointerCapture={e=>{if(gesture.current)dragEnd(e,true);}} onDragStart={e=>e.preventDefault()}>
    <span className="orbit-room-mark" aria-hidden="true">RTV</span>
    {cast.map((c,i)=><div ref={el=>{figures.current[i]=el;}} className={'orbit-performer'+(active===i?' is-front':'')} key={c.id} aria-hidden="true" style={{'--cast-color':c.color} as CSSProperties}><img src={castImage(c.id)} alt="" draggable={false} loading={i===0?'eager':'lazy'}/><span className="orbit-footlight"/></div>)}
   </div>
   <div className="orbit-caption" style={{'--cast-color':current.color} as CSSProperties}>
    <div className="orbit-person" aria-live="polite" aria-atomic="true"><span className="eyebrow">{String(active+1).padStart(2,'0')} / THE RTV CAST</span><h3>{current.name}</h3><p>{current.line}</p><span className="orbit-tone">{current.tone}</span></div>
    <div className="orbit-actions"><div><button className="metal-control" aria-label="Previous cast member" onClick={()=>{target.current=Math.round(target.current)-1;wake.current();}}><ArrowLeft size={20}/></button><button className="metal-control" aria-label="Next cast member" onClick={()=>{target.current=Math.round(target.current)+1;wake.current();}}><ArrowRight size={20}/></button></div><a href="/services/universe" className="text-link">A world for your brand <ArrowUpRight size={17}/></a></div>
   </div>
   <div className="orbit-cast-selector" aria-label="Choose a cast member">{cast.map((c,i)=><button key={c.id} onClick={()=>select(i)} aria-pressed={active===i} style={{'--cast-color':c.color} as CSSProperties}><span>{String(i+1).padStart(2,'0')}</span>{c.name}</button>)}</div>
  </div>
 </section>;
}
