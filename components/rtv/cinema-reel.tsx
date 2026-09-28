'use client';
import {useEffect,useRef,useState,type CSSProperties,type PointerEvent as ReactPointerEvent} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Play,Pause,Square} from 'lucide-react';
import type {Film} from './chrome';
import {InlineFilm,type FilmPlaybackHandle} from './inline-film';
import {useSiteMotion} from './motion-page';
import {channels} from '@/lib/catalog';

// Both spools and every frame use the same transport position. Nothing rotates
// while a film is playing: the reel only advances when the visitor selects it.
function ReelSpools({position}:{position:React.RefObject<number>}){
 const host=useRef<HTMLDivElement>(null),[rendered,setRendered]=useState(false);
 useEffect(()=>{let disposed=false,cleanup=()=>{};
  (async()=>{try{
   const T=await import('three');
   const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');
   const {RoomEnvironment}=await import('three/examples/jsm/environments/RoomEnvironment.js');
   if(disposed||!host.current)return;
   const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);
   renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
   let frame=0,visible=true;const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.1,40);
   const ro=new ResizeObserver(resize),io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible){cancelAnimationFrame(frame);last=NaN;draw();}});
   const resources:()=>void=()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();scene.traverse((o:any)=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach((m:any)=>m.dispose());});renderer.dispose();renderer.domElement.remove();};
   cleanup=resources;
   const gltf=await new GLTFLoader().loadAsync('/studio/reel/reel.glb');
   if(disposed){gltf.scene.traverse((o:any)=>{o.geometry?.dispose();o.material?.dispose?.();});resources();return;}
   const bounds=new T.Box3().setFromObject(gltf.scene),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
   gltf.scene.position.sub(center);const rotor=new T.Group();rotor.add(gltf.scene);rotor.scale.setScalar(3.2/Math.max(size.x,size.y));
   const left=new T.Group(),right=new T.Group();left.add(rotor);const rotor2=rotor.clone(true);right.add(rotor2);scene.add(left,right);
   left.position.set(-3.7,1.85,0);right.position.set(3.7,1.7,-.8);left.rotation.y=.18;right.rotation.y=-.25;
   scene.add(new T.HemisphereLight('#e9f2ff','#121724',2));
   const key=new T.DirectionalLight('#ffe1ba',5);key.position.set(-3,5,7);scene.add(key);
   const rim=new T.DirectionalLight('#b0dcfa',3);rim.position.set(6,3,2);scene.add(rim);
   const gen=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=gen.fromScene(room,.04);scene.environment=env.texture;room.dispose();gen.dispose();
   const oldCleanup=cleanup;cleanup=()=>{env.dispose();oldCleanup();};
   function resize(){if(!host.current||disposed)return;const w=host.current.clientWidth,h=host.current.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;const span=11.8;camera.position.set(0,.4,span/(2*Math.tan(Math.PI*16/180)*camera.aspect));camera.lookAt(0,.4,0);camera.updateProjectionMatrix();last=NaN;}
   let last=NaN,checkedFrame=false;
   function draw(){if(disposed||!visible)return;const p=position.current;if(p!==last){rotor.rotation.z=-p*Math.PI*.72;rotor2.rotation.z=-p*Math.PI*.9;renderer.render(scene,camera);last=p;
    if(!checkedFrame&&renderer.domElement.width>0&&renderer.domElement.height>0){
     // Never discard the visible image reels for an empty GPU frame.
     const probe=new T.WebGLRenderTarget(96,96),pixels=new Uint8Array(96*96*4);let coverage=0;
     try{renderer.setRenderTarget(probe);renderer.render(scene,camera);renderer.readRenderTargetPixels(probe,0,0,96,96,pixels);for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)coverage++;}finally{renderer.setRenderTarget(null);probe.dispose();renderer.render(scene,camera);}
     checkedFrame=true;if(coverage>64&&!renderer.getContext().isContextLost())setRendered(true);
    }}frame=requestAnimationFrame(draw);}
   host.current.appendChild(renderer.domElement);ro.observe(host.current);io.observe(host.current);resize();draw();
   const lost=(e:Event)=>{e.preventDefault();setRendered(false);visible=false;cancelAnimationFrame(frame);};
   const restored=()=>{checkedFrame=false;last=NaN;visible=true;cancelAnimationFrame(frame);draw();};
   renderer.domElement.addEventListener('webglcontextlost',lost);renderer.domElement.addEventListener('webglcontextrestored',restored);
   const disposeScene=cleanup;cleanup=()=>{renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);disposeScene();};
  }catch{cleanup();if(!disposed)setRendered(false);}})();
  return()=>{disposed=true;cleanup();};
 },[position]);
 return <div className={'reel-spools'+(rendered?' spools-rendered':'')} aria-hidden="true"><div ref={host} className="spools-canvas"/><img className="spool-fallback spool-left" src="/studio/reel/reel.webp" alt=""/><img className="spool-fallback spool-right" src="/studio/reel/reel.webp" alt=""/></div>;
}

export function CinemaReel({films,selectedId,onSelect}:{films:Film[];selectedId:string;onSelect:(id:string)=>void}){
 const {paused}=useSiteMotion(),root=useRef<HTMLDivElement>(null),position=useRef(0),frames=useRef<Record<string,HTMLDivElement|null>>({});
 const startIndex=Math.max(0,films.findIndex(f=>f.id===selectedId));
 const playback=useRef<FilmPlaybackHandle>(null),[playing,setPlaying]=useState(false);
 const [settled,setSettled]=useState(startIndex),[moving,setMoving]=useState(false),[autoPlay,setAutoPlay]=useState(false);
 const direction=useRef(0),userSelection=useRef(false),watching=useRef(false),swipe=useRef<{x:number;y:number;id:number;base:number;dragged:boolean}|null>(null),suppressClick=useRef(false),first=useRef(true);
 const targetIndex=Math.max(0,films.findIndex(f=>f.id===selectedId));
 const count=films.length,film=films[targetIndex];
 const paint=(p:number)=>{position.current=p;root.current?.style.setProperty('--reel-turn',String(p));films.forEach((f,i)=>{let delta=i-p;while(delta>count/2)delta-=count;while(delta< -count/2)delta+=count;const el=frames.current[f.id];if(el){el.style.setProperty('--frame-offset',String(delta));el.style.setProperty('--frame-depth',String(Math.abs(delta)));el.style.visibility=Math.abs(delta)>1.85?'hidden':'visible';el.style.zIndex=String(10-Math.round(Math.abs(delta)*2));}});};
 useEffect(()=>{
  if(first.current){first.current=false;paint(targetIndex);setSettled(targetIndex);return;}
  let delta=targetIndex-((Math.round(position.current)%count+count)%count);if(delta>count/2)delta-=count;if(delta< -count/2)delta+=count;if(direction.current<0&&delta>0)delta-=count;if(direction.current>0&&delta<0)delta+=count;direction.current=0;
  const from=position.current,to=Math.round(from)+delta;let frame=0;
  window.dispatchEvent(new CustomEvent('rtv:watch-film',{detail:'reel-transport'}));
  setMoving(true);setAutoPlay(false);setPlaying(false);
  const duration=paused?0:760,start=performance.now();
  const tick=(now:number)=>{const t=duration?Math.min(1,(now-start)/duration):1;const ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;paint(from+(to-from)*ease);if(t<1)frame=requestAnimationFrame(tick);else{setSettled(targetIndex);setMoving(false);setAutoPlay(userSelection.current);userSelection.current=false;}};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[targetIndex,paused]);
 const select=(i:number,play=true,intent=0)=>{if(moving||i===targetIndex)return;direction.current=intent;userSelection.current=play;onSelect(films[(i+count)%count].id);};
 const step=(delta:number)=>{if(count>1)select((targetIndex+delta+count)%count,watching.current,delta);};
 const dragStart=(e:ReactPointerEvent<HTMLDivElement>)=>{
  if(moving||count<2||e.button!==0)return;
  const target=e.target as HTMLElement;if(target.closest('a,input,iframe'))return;
  const video=target.closest('video');if(video&&e.clientY>video.getBoundingClientRect().bottom-52)return;
  swipe.current={x:e.clientX,y:e.clientY,id:e.pointerId,base:position.current,dragged:false};suppressClick.current=false;
 };
 const dragMove=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const gesture=swipe.current;if(!gesture||gesture.id!==e.pointerId)return;
  const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
  if(!gesture.dragged&&Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){swipe.current=null;return;}
  if(!gesture.dragged&&Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.2){gesture.dragged=true;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('is-dragging');window.dispatchEvent(new CustomEvent('rtv:watch-film',{detail:'reel-drag'}));}
  if(gesture.dragged){e.preventDefault();paint(gesture.base-Math.max(-.95,Math.min(.95,dx/(e.currentTarget.clientWidth*.5))));}
 };
 const dragEnd=(e:ReactPointerEvent<HTMLDivElement>,cancel=false)=>{
  const gesture=swipe.current;if(!gesture)return;swipe.current=null;e.currentTarget.classList.remove('is-dragging');
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  if(!gesture.dragged)return;suppressClick.current=true;const dx=e.clientX-gesture.x;
  if(!cancel&&Math.abs(dx)>40)step(dx<0?1:-1);else paint(gesture.base);
 };

 return <div ref={root} className={'cinema-transport'+(moving?' is-advancing':'')} data-selected-film={film.id} data-transport={moving?'advancing':'settled'} style={{'--reel-turn':startIndex} as CSSProperties}>
  <div className="transport-stage" role="region" aria-roledescription="carousel" aria-label="Film reel" tabIndex={0} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}}} onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={e=>dragEnd(e)} onPointerCancel={e=>dragEnd(e,true)} onLostPointerCapture={e=>{if(swipe.current)dragEnd(e,true);}} onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}} onDragStart={e=>e.preventDefault()}>
   <ReelSpools position={position}/>
   <div className="film-track">
    {films.map((f,i)=><div ref={el=>{frames.current[f.id]=el;}} key={f.id} className={'film-cell'+(!moving&&settled===i?' cell-current':'')} style={{'--frame-offset':i-startIndex,'--frame-depth':Math.abs(i-startIndex)} as CSSProperties} aria-hidden={moving||settled!==i} inert={moving||settled!==i?true:undefined}>
     <div className="film-perforations" aria-hidden="true"/>
     <div className="film-emulsion">{!moving&&settled===i?<InlineFilm key={f.id} film={f} autoStart={autoPlay} playbackRef={playback} onPlaybackChange={setPlaying} onStart={()=>{watching.current=true;}}/>:<img src={f.poster} alt="" loading={Math.abs(i-startIndex)<2?'eager':'lazy'}/>}</div>
     <div className="film-stock-label"><span>RTV · {String(i+1).padStart(2,'0')}</span><span>{channels.find(c=>c.id===f.product)?.name}</span></div>
     <div className="film-perforations" aria-hidden="true"/>
    </div>)}
   </div>
   <div className="transport-cue" aria-hidden="true"><span>35 / RTV</span><span>{moving?'ADVANCING':'READY TO ROLL'}</span></div>
  </div>
  <div className="transport-desk">
   <div className="transport-title" aria-live="polite" aria-atomic="true"><span className="eyebrow">{film.industry} / {channels.find(c=>c.id===film.product)?.name}</span><h2>{film.title}</h2></div>
   <div className="transport-controls"><div className="reel-playback"><button className="button metal reel-play-toggle" disabled={moving} onClick={()=>playback.current?.toggle()} aria-label={playing?(film.provider==='stream'?'Stop film':'Pause film'):'Play film'}>{playing?<Pause size={18}/>:<Play size={18}/>}<span>{playing?(film.provider==='stream'?'Stop':'Pause'):'Play'}</span></button><button className="metal-control" disabled={moving} onClick={()=>{playback.current?.stop();watching.current=false;}} aria-label="Stop and rewind film"><Square size={16}/></button></div><button className="metal-control" onClick={()=>step(-1)} disabled={count<2||moving} aria-label="Previous film"><ArrowLeft size={21}/></button><span className="frame-counter" aria-label={`Film ${targetIndex+1} of ${count}`}><b>{String(targetIndex+1).padStart(2,'0')}</b><span>/ {String(count).padStart(2,'0')}</span></span><button className="metal-control" onClick={()=>step(1)} disabled={count<2||moving} aria-label="Next film"><ArrowRight size={21}/></button></div>
  </div>
  <div className="reel-contact-sheet" aria-label="Choose a film">{films.map((f,i)=><button key={f.id} aria-label={'Select '+f.title} aria-pressed={i===targetIndex} disabled={moving} onClick={()=>select(i)}><span className="contact-image"><img src={f.poster} alt="" loading="lazy"/><span>{String(i+1).padStart(2,'0')}</span><Play size={16}/></span><span>{f.title}</span></button>)}</div>
  <div className="transport-next"><span>{count>1?'Drag the film strip or use the arrows.':'One film in this selection.'}</span><a className="text-link" href={'/services/'+film.product+'?from=work'}>Explore {channels.find(c=>c.id===film.product)?.name}<ArrowUpRight size={16}/></a></div>
 </div>;
}
