'use client';
import {useEffect,useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowUpRight,ChevronRight,Play} from 'lucide-react';
import {Nav,Footer,type Film} from './chrome';
import {channels,money,type Channel} from '@/lib/catalog';
import {useStudioPlayback} from './playback';
import {TVStage} from './tv-stage';
import {StudioRemote} from './studio-remote';
import {CastFigure,type CastId} from './cast';
import {MotionPage} from './motion-page';
import {formatDescriptions} from './format-picker';
const packageDetails={
 spot:{heading:'A focused ad. One clear message.',items:['RTV creative direction','Stock AI visuals shaped around your offer','A final commercial up to 30 seconds','One consolidated revision round'],note:'A practical starting point for promotions and launches. Custom characters are outside this package.'},
 impossible:{heading:'Your idea, beyond a physical shoot.',items:['A custom concept developed for your brand','Creative approval before production','An AI-produced commercial up to 90 seconds','Two consolidated revision rounds'],note:'For campaigns that need a setting, scale, or visual concept an ordinary shoot cannot easily deliver.'},
 avatar:{heading:'A spokesperson people can recognize.',items:['A custom AI spokesperson for your brand','Character, voice, and personality development','Video length and delivery agreed in your brief','Two consolidated revision rounds'],note:'For explainers, education, and an ongoing brand voice. Monthly production is available when you’re ready for a regular schedule.'},
 universe:{heading:'Connected stories. A consistent world.',items:['A branded world with recurring characters','An episodic storytelling direction','Episode length and delivery agreed in your brief','Two consolidated revision rounds'],note:'For businesses building an ongoing series. A monthly program can turn the concept into a continuing production calendar.'},
} as const;
const serviceCast:Record<Channel,CastId>={spot:'real-deal-richards',impossible:'cornell-vybes',avatar:'jen-sparx',universe:'yolo-yung'};
export function ServiceExperience({channel,films}:{channel:Channel;films:Film[]}){
 const c=channels.find(c=>c.id===channel)!,details=packageDetails[channel],player=useStudioPlayback(films,channel,true);
 const [fromWork,setFromWork]=useState(false),[returnTo,setReturnTo]=useState('/work?product='+channel);
 useEffect(()=>{setFromWork(new URLSearchParams(location.search).get('from')==='work');try{const saved=JSON.parse(sessionStorage.getItem('rtv:work-return')||'{}');if(typeof saved.url==='string'&&/^\/work(?:\?|$)/.test(saved.url))setReturnTo(saved.url);}catch{}},[]);
 return <MotionPage><Nav active={'/services/'+channel}/><main className={'service-detail service-cinematic service-'+channel} style={{'--offer-color':c.color} as CSSProperties}>
  <nav className="service-breadcrumb" aria-label="Breadcrumb"><a href={fromWork?returnTo:'/#format-'+channel} onClick={()=>{if(fromWork)try{sessionStorage.setItem('rtv:restore-work','1');}catch{}}} className="back-link"><ArrowLeft size={16}/>{fromWork?'Back to the work':'Back to video types'}</a><span><a href="/">Home</a><ChevronRight size={14}/><a href="/#formats">Video types</a><ChevronRight size={14}/>{c.name}</span></nav>
  <section className="service-device-hero studio-surface" data-scroll-scene><div className="service-device-copy" data-reveal><span className="eyebrow" style={{color:c.color}}>{formatDescriptions[channel].label.toUpperCase()} / {c.name.toUpperCase()}</span><h1>{formatDescriptions[channel].title}</h1><p>{c.detail}</p><div className="service-price"><strong>{money(c.price)}</strong><span>one-off production</span></div><a href={'/book?product='+channel} className="button light">Talk about your video <ArrowUpRight size={18}/></a><a className="service-gallery-link" href={'/work?product='+channel}>Browse this video type <ArrowUpRight size={17}/></a></div>
   <div className="service-device-display"><TVStage player={player}/><div className="device-caption"><span>{player.film?player.film.title:c.name}</span><span>{player.film?'WATCH ON THE SCREEN':'YOUR FORMAT / YOUR STORY'}</span></div></div>
  </section>
  {films.length>0&&<section className="service-film-selector service-film-shelf" aria-label={c.name+' films'}><span className="eyebrow">WATCH THE WORK</span><div>{films.map(f=><button key={f.id} onClick={()=>player.selectFilm(f.id)} aria-pressed={player.film?.id===f.id}><Play size={16}/>{f.title}</button>)}</div></section>}
  <div className="service-facts" data-reveal><div><span>RUNNING TIME</span><b>{c.duration}</b></div><div><span>REVISION ROUNDS</span><b>{c.revisions} included</b></div><div><span>PRODUCTION WINDOW</span><b>7–10 business days*</b></div><div><span>BEST FOR</span><b>{c.fit}</b></div></div>
  <section className="service-inclusions content-section studio-surface" data-scroll-scene><span className="surface-wordmark" aria-hidden="true">RTV</span><div className="service-inclusion-copy" data-reveal><span className="eyebrow">WHAT’S INCLUDED</span><h2>{details.heading}</h2><p>{details.note}</p></div><ol>{details.items.map((item,i)=><li key={item} data-reveal><span>{String(i+1).padStart(2,'0')}</span>{item}</li>)}</ol><CastFigure id={serviceCast[channel]} className="service-cast" label/><span className="service-cast-note">From the RTV cast. Your production is shaped around your brand.</span></section>
  <div className="content-section service-terms"><p>*The production window starts after your deposit, complete brief, assets, and required approvals. Monthly programs use an agreed calendar.</p><a className="text-link" href="/pricing#terms">Scope, payment & monthly options <ArrowUpRight size={17}/></a></div>
  <section className="service-next studio-surface" data-scroll-scene><div><span className="eyebrow">IS THIS YOUR FORMAT?</span><h2>Let’s shape the brief.</h2></div><a href={'/book?product='+channel} className="button light">Start the conversation <ArrowUpRight size={18}/></a><a className="text-link" href="/#formats"><ArrowLeft size={17}/>Compare video types</a></section>
 </main><Footer/><StudioRemote player={player} serviceMode/></MotionPage>;
}
