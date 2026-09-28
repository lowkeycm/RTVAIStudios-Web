'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Play,Pause} from 'lucide-react';
import {channels} from '@/lib/catalog';
import {type Playback,type MediaHandle} from './playback';

type Display={label?:string;root:string;screen:string;render:string;glb?:string;width:number;height:number;corners:number[][];widthMeters?:number;heightMeters?:number;knobs?:{mesh:string;pixelCenter:number[];hitRadiusPx:number}[]};
type Manifest=Record<string,Display>;
let manifestPromise:Promise<Manifest>|null=null;
function manifest():Promise<Manifest>{return manifestPromise??=fetch('/studio/displays/manifest.json').then(r=>{if(!r.ok)throw Error('Display unavailable');return r.json();});}
// A projective transform keeps native video aligned with all four 3D screen corners.
export function screenTransform(points:number[][],width:number,height:number){
 const a:number[][]=[],source=[[0,0],[width,0],[width,height],[0,height]];
 source.forEach(([x,y],i)=>{const [u,v]=points[i];a.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
 for(let c=0;c<8;c++){let pivot=c;for(let j=c+1;j<8;j++)if(Math.abs(a[j][c])>Math.abs(a[pivot][c]))pivot=j;[a[c],a[pivot]]=[a[pivot],a[c]];const k=a[c][c];if(Math.abs(k)<1e-10)return '';for(let j=c;j<9;j++)a[c][j]/=k;for(let i=0;i<8;i++){if(i===c)continue;const f=a[i][c];for(let j=c;j<9;j++)a[i][j]-=f*a[c][j];}}
 const h=a.map(r=>r[8]);return `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
}
let streamSDK:Promise<void>|null=null;
function loadStream(){return streamSDK??=new Promise<void>((resolve,reject)=>{if((window as any).Stream)return resolve();const s=document.createElement('script');s.src='https://embed.cloudflarestream.com/embed/sdk.latest.js';s.onload=()=>resolve();s.onerror=()=>{streamSDK=null;reject(Error('Player unavailable'));};document.head.appendChild(s);});}
function ScreenMedia({player}:{player:Playback}){
 const picture=useRef<HTMLDivElement>(null),video=useRef<HTMLVideoElement>(null),frame=useRef<HTMLIFrameElement>(null),latest=useRef(player);latest.current=player;
 const f=player.film,c=channels.find(c=>c.id===player.channel)!;
 useEffect(()=>{if(!f)return;let cancelled=false;let cleanup=()=>{};
 if(f.provider!=='stream'){player.bind(video.current,picture.current);if(video.current&&video.current.readyState>=1)latest.current.events.onLoadedMetadata();return()=>player.bind(null,null);}
 loadStream().then(()=>{if(cancelled||!frame.current)return;const p=(window as any).Stream(frame.current) as MediaHandle;p.muted=latest.current.muted;p.volume=latest.current.volume;latest.current.bind(p,picture.current);
 const entries=[['play','onPlay'],['pause','onPause'],['timeupdate','onTimeUpdate'],['volumechange','onVolumeChange'],['ended','onEnded'],['error','onError'],['loadedmetadata','onLoadedMetadata'],['canplay','onCanPlay']] as const;
 const listeners=entries.map(([event,key])=>{const handler=()=>latest.current.events[key]();p.addEventListener(event,handler);return [event,handler] as const;});cleanup=()=>{p.pause();listeners.forEach(([e,h])=>p.removeEventListener(e,h));};}).catch(()=>latest.current.events.onError());
 return()=>{cancelled=true;cleanup();player.bind(null,null);};},[f?.id,player.bind]);
 useEffect(()=>{if(!player.powered)video.current?.pause();},[player.powered]);
 return <div ref={picture} className={'tv-picture '+(!player.powered?'tv-off':'')}>
  {f?(f.provider==='stream'?<iframe ref={frame} key={f.id} title={f.title} src={f.source+(f.source.includes('?')?'&':'?')+'controls=false'} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>:<video ref={video} key={f.id} src={f.source} poster={f.poster} playsInline preload="metadata" {...player.events}/>):<div className="tv-testcard"><span className="testcard-station">RTV / CH {c.number}</span><strong>{c.name}</strong><span className="testcard-rule"/><p>No films on this channel yet.</p><small>Explore another channel.</small></div>}
  {f&&<button className="tv-screen-action" aria-label={player.playing?'Pause '+f.title:'Play '+f.title} aria-pressed={player.playing} onClick={player.toggle} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();player.seek(Math.max(0,Math.min(player.duration,player.progress+(e.key==='ArrowRight'?10:-10))));}}}><span>{player.playing?<Pause size={60}/>:<Play size={60}/>}</span></button>}
  {!player.powered&&<div className="tv-standby">RTV<span>STANDBY</span></div>}
  {player.tuning&&<div className="tv-tuning" aria-hidden="true"/>}
 </div>;
}

export function TVStage({player,compact=false}:{player:Playback;compact?:boolean}){
 const mount=useRef<HTMLDivElement>(null),surface=useRef<HTMLDivElement>(null),canvas=useRef<HTMLDivElement>(null);
 const dialButtons=useRef<(HTMLButtonElement|null)[]>([]),redraw=useRef<(()=>void)|null>(null);
 const placeDial=(i:number,x:number,y:number,size:number)=>{const el=dialButtons.current[i];if(el){el.style.left=x+'px';el.style.top=y+'px';el.style.width=Math.max(36,size)+'px';el.style.height=Math.max(36,size)+'px';}};
 const [spec,setSpec]=useState<Display|null>(null),[mode,setMode]=useState<'loading'|'render'|'3d'>('loading'),[assetFailed,setAssetFailed]=useState(false),[renderLoaded,setRenderLoaded]=useState(false),[renderFailed,setRenderFailed]=useState(false);
 const displayReady=mode==='3d'||(mode==='render'&&(renderLoaded||renderFailed||assetFailed));
 // Paint again after React reveals the canvas, before the browser composites it.
 useLayoutEffect(()=>{if(mode==='3d')redraw.current?.();},[mode]);
 const channel=channels.find(c=>c.id===player.channel)!;
 useEffect(()=>{let disposed=false,cleanup=()=>{};setMode('loading');setSpec(null);setAssetFailed(false);setRenderLoaded(false);setRenderFailed(false);redraw.current=null;
 (async()=>{try{const data=await manifest();if(disposed)return;const d=data[player.channel];if(!d)throw Error('Display unavailable');setSpec(d);
 const host=mount.current!,media=surface.current!;
 const contentHeight=1000*((d.heightMeters||Math.hypot(d.corners[3][0]-d.corners[0][0],d.corners[3][1]-d.corners[0][1]))/(d.widthMeters||Math.hypot(d.corners[1][0]-d.corners[0][0],d.corners[1][1]-d.corners[0][1])));media.style.height=contentHeight+'px';
 const fallback=()=>{const w=host.clientWidth,h=host.clientHeight;const ratio=Math.min(w/d.width,h/d.height);const ox=(w-d.width*ratio)/2,oy=(h-d.height*ratio)/2;media.style.transform=screenTransform(d.corners.map(([x,y])=>[ox+x*ratio,oy+y*ratio]),1000,contentHeight);d.knobs?.forEach((knob,i)=>placeDial(i,ox+knob.pixelCenter[0]*ratio,oy+knob.pixelCenter[1]*ratio,knob.hitRadiusPx*ratio*2));};
 fallback();let update=fallback;const ro=new ResizeObserver(()=>update());ro.observe(host);cleanup=()=>ro.disconnect();
 try{const T=await import('three');const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');const {OrbitControls}=await import('three/examples/jsm/controls/OrbitControls.js');const {RoomEnvironment}=await import('three/examples/jsm/environments/RoomEnvironment.js');if(disposed)return;
 // This is an on-demand scene: retain its frame while the video/React layers update.
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.setClearColor(0x000000,0);
 cleanup=()=>{ro.disconnect();renderer.dispose();renderer.domElement.remove();};
 const gltf=await new GLTFLoader().loadAsync(d.glb||'/studio/displays/studio-displays.glb');if(disposed){renderer.dispose();return;}
 const scene=new T.Scene(),model=gltf.scene.getObjectByName(d.root)||gltf.scene;model.removeFromParent();model.position.set(0,0,0);scene.add(model);model.updateMatrixWorld(true);
 let bounds=new T.Box3().setFromObject(model);const size=bounds.getSize(new T.Vector3());const scale=3.8/Math.max(size.x,size.y*1.35);model.scale.multiplyScalar(scale);model.updateMatrixWorld(true);bounds=new T.Box3().setFromObject(model);const center=bounds.getCenter(new T.Vector3());model.position.x-=center.x;model.position.y-=bounds.min.y;model.position.z-=center.z;model.updateMatrixWorld(true);bounds=new T.Box3().setFromObject(model);
 const height=bounds.max.y,screenMesh=model.getObjectByName(d.screen);if(!screenMesh)throw Error('Missing screen surface');
 model.traverse((object:any)=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;}});
 const screenBounds=new T.Box3().setFromObject(screenMesh),sz=screenBounds.max.z+.002;
 const corners=[[screenBounds.min.x,screenBounds.max.y,sz],[screenBounds.max.x,screenBounds.max.y,sz],[screenBounds.max.x,screenBounds.min.y,sz],[screenBounds.min.x,screenBounds.min.y,sz]].map(p=>new T.Vector3(...p as [number,number,number]));
 const camera=new T.PerspectiveCamera(32,host.clientWidth/host.clientHeight,.1,50);
 const viewTarget=new T.Vector3(0,height*.48,0);
 const fitDistance=()=>Math.max(6.9,4.1/(2*Math.tan(16*Math.PI/180)*(host.clientWidth/host.clientHeight)));
 let fittedDistance=fitDistance();
 const controls=new OrbitControls(camera,canvas.current!);controls.target.copy(viewTarget);controls.enableZoom=false;controls.enablePan=false;controls.minAzimuthAngle=-.68;controls.maxAzimuthAngle=.68;controls.minPolarAngle=1.12;controls.maxPolarAngle=1.62;controls.rotateSpeed=.48;
 // Apply the opening angle after controls initialize, so their first update cannot replace it.
 camera.position.copy(viewTarget).add(new T.Vector3(.26,.18,1).normalize().multiplyScalar(fittedDistance));camera.lookAt(viewTarget);controls.update();controls.saveState();
 const generator=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=generator.fromScene(room,.03);scene.environment=environment.texture;room.dispose();generator.dispose();
 scene.add(new T.HemisphereLight('#fff0dc','#222731',2.4));const key=new T.DirectionalLight('#fff0d7',3.4);key.position.set(-3,6,5);key.castShadow=false;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.001;scene.add(key);const rim=new T.PointLight('#e0a16c',25,15);rim.position.set(4,3,-2);scene.add(rim);
 // Transparent scene: only the television is rendered onto the page.
 let contextLost=false,renderFrame=0,lastWidth=0,lastHeight=0;
 function requestRender(){if(disposed||contextLost||renderFrame)return;renderFrame=requestAnimationFrame(()=>{renderFrame=0;render();});}
 function render(){if(disposed||contextLost)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;const nextDistance=fitDistance();if(Math.abs(nextDistance-fittedDistance)>.01){camera.position.sub(viewTarget).multiplyScalar(nextDistance/fittedDistance).add(viewTarget);fittedDistance=nextDistance;}camera.updateProjectionMatrix();if(w!==lastWidth||h!==lastHeight){renderer.setSize(w,h,false);lastWidth=w;lastHeight=h;}renderer.render(scene,camera);const projected=corners.map(v=>{const p=v.clone().project(camera);return [(p.x+1)*w/2,(1-p.y)*h/2];});media.style.transform=screenTransform(projected,1000,contentHeight);d.knobs?.forEach((knob,i)=>{const mesh=model.getObjectByName(knob.mesh);if(!mesh)return;const p=new T.Box3().setFromObject(mesh).getCenter(new T.Vector3()).project(camera);placeDial(i,(p.x+1)*w/2,(1-p.y)*h/2,host.clientWidth*.065);});}
 // Reveal only the completed live scene. The still image is reserved for fallback.
 canvas.current!.appendChild(renderer.domElement);redraw.current=render;update=requestRender;controls.addEventListener('change',requestRender);render();setMode('3d');
 const loss=(event:Event)=>{event.preventDefault();contextLost=true;cancelAnimationFrame(renderFrame);renderFrame=0;controls.enabled=false;update=fallback;fallback();setMode('render');};
 const restore=()=>{if(disposed)return;contextLost=false;controls.enabled=true;update=requestRender;render();setMode('3d');};
 renderer.domElement.addEventListener('webglcontextlost',loss);renderer.domElement.addEventListener('webglcontextrestored',restore);
 cleanup=()=>{ro.disconnect();cancelAnimationFrame(renderFrame);redraw.current=null;controls.removeEventListener('change',requestRender);controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',loss);renderer.domElement.removeEventListener('webglcontextrestored',restore);scene.traverse((object:any)=>{object.geometry?.dispose();if(object.material)for(const mat of Array.isArray(object.material)?object.material:[object.material]){Object.values(mat).forEach((v:any)=>{if(v?.isTexture)v.dispose();});mat.dispose();}});environment.dispose();renderer.dispose();renderer.domElement.remove();};
 }catch{if(!disposed){cleanup();redraw.current=null;update=fallback;ro.observe(host);cleanup=()=>ro.disconnect();fallback();setMode('render');}}
 }catch{if(!disposed){manifestPromise=null;setMode('render');setAssetFailed(true);}}})();
 return()=>{disposed=true;redraw.current=null;cleanup();};},[player.channel]);
 return <div className={`tv-stage ${compact?'compact-stage':''}`}>
  <div ref={mount} className={'television-set '+(mode==='3d'?'has-3d':'has-render')+(assetFailed||(mode==='render'&&renderFailed)?' asset-unavailable':'')} data-display={player.channel} data-view={mode} aria-busy={!displayReady}>
   {spec&&<img className="display-render" src={spec.render} alt="" style={{visibility:mode==='render'?'visible':'hidden'}} onLoad={()=>setRenderLoaded(true)} onError={()=>setRenderFailed(true)}/>}
   <div ref={canvas} className="display-canvas" style={{visibility:mode==='3d'?'visible':'hidden'}} aria-label={mode==='3d'?`${spec?.label||channel.name+' television'}. Drag the edge to view the sides and top.`:spec?.label||`${channel.name} television`}/>
   <div ref={surface} className={`screen-projection ${player.channel==='spot'?'crt-projection':''}`} style={{visibility:displayReady?'visible':'hidden'}}><ScreenMedia player={player}/></div>
   {spec?.knobs?.map((knob,i)=><button key={knob.mesh} ref={el=>{dialButtons.current[i]=el;}} className="tv-dial-control" style={{visibility:displayReady?'visible':'hidden'}} aria-label={i===0?'TV channel dial: next film. Use left arrow for previous film.':player.muted?'TV volume dial: unmute. Use arrow keys to adjust volume.':'TV volume dial: mute. Use arrow keys to adjust volume.'} title={i===0?'Next film · ← previous / → next':'Mute · ↑ louder / ↓ quieter'} disabled={i===0?player.playlist.length<2:!player.film} onClick={()=>i===0?player.next(1):player.toggleMute()} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const delta=e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:1;i===0?player.next(delta):player.changeVolume(delta*.1);}}}><span>{i===0?'CH':'VOL'}</span></button>)}
   {!displayReady&&<div className="display-loading" role="status"><span>RTV</span><p>Setting the scene…</p></div>}
  </div>
  {player.error&&<p className="playback-error" role="alert">{player.error}</p>}
 </div>;
}
