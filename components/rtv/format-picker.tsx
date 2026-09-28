'use client';
import {ArrowUpRight} from 'lucide-react';
import {type CSSProperties} from 'react';
import {channels,money} from '@/lib/catalog';
import type {Film} from './chrome';
import {InlineFilm} from './inline-film';
export const formatDescriptions={
 spot:{title:'A short commercial.',need:'I need to promote something.',body:'Put one clear offer, launch, or message in front of the right people.',uses:['Promotions and new launches','Short social and digital ads','One message, up to 30 seconds'],label:'Short commercials'},
 impossible:{title:'A bigger brand film.',need:'I have an idea a normal shoot can’t deliver.',body:'Turn an ambitious concept into a custom commercial, without needing a physical set for every scene.',uses:['Campaign and website hero films','Custom concepts and visual worlds','A longer story, up to 90 seconds'],label:'Concept commercials'},
 avatar:{title:'A face for your brand.',need:'I need someone to explain it.',body:'Create a recognizable AI spokesperson who can explain your business and keep showing up for your audience.',uses:['Product and service explainers','Education and how-to content','A consistent spokesperson'],label:'AI spokesperson'},
 universe:{title:'A series worth returning to.',need:'I want an ongoing story.',body:'Build recurring characters and connected episodes around your brand.',uses:['Episodic brand storytelling','Recurring characters and settings','An ongoing content series'],label:'Branded series'},
} as const;
export function FormatPicker({films=[]}:{films?:Film[]}){
 return <section id="formats" className="format-comparison section studio-surface" data-scroll-scene>
  <span className="surface-wordmark" aria-hidden="true">RTV</span><div className="section-top" data-reveal><span className="eyebrow">01 / CHOOSE YOUR VIDEO</span><a href="/pricing" className="text-link">Compare pricing <ArrowUpRight size={17}/></a></div>
  <div className="comparison-heading" data-reveal><h2>What does your<br/><em>video need to do?</em></h2><p>Start with the job.<br/>Then choose the format.</p></div>
  <div className="format-rows">{channels.map(c=>{const example=films.find(f=>f.product===c.id);return <article key={c.id} id={'format-'+c.id} className="format-row" data-reveal style={{'--format-color':c.color} as CSSProperties}>
   <div className="format-row-title"><span className="format-row-number">{c.number}</span><div><span className="format-category">{formatDescriptions[c.id].label}</span><h3>{c.name}</h3><strong>{c.short}</strong></div></div>
   <div className="format-row-example">{example&&<InlineFilm film={example}/>}</div>
   <div className="format-row-description"><p>{c.description}</p><span>{c.fit}</span></div>
   <div className="format-row-action"><span>ONE-OFF PRODUCTION</span><strong>{money(c.price)}</strong><a className="button metal" href={'/services/'+c.id}>Explore {c.name}<ArrowUpRight size={17}/></a></div>
  </article>;})}</div>
  <div className="comparison-footer"><p>Have a longer story to tell? Monthly programs start at $1,250.</p><a href="/pricing" className="text-link">All packages & pricing <ArrowUpRight size={17}/></a></div>
 </section>;
}
