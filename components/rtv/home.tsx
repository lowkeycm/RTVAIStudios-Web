'use client';
import {ArrowDown,ArrowUpRight} from 'lucide-react';
import {Nav,Footer,type Film,Attribution} from './chrome';
import {VideoWall} from './video-wall';
import {CastPreview} from './cast';
import {FormatPicker} from './format-picker';
import {MotionPage} from './motion-page';
import {heroFilms,type VideoPlacements} from '@/lib/video-placement';
export function Home({films,placements}:{films:Film[];placements:VideoPlacements}){
 const wall=heroFilms(films,placements);
 return <MotionPage><Attribution/><Nav/><main>
  <section className="broadcast-hero" data-scroll-scene><div className="broadcast-topline"><span className="eyebrow">RTV AI STUDIOS / CREATIVE PRODUCTION</span><a href="/work">Watch the films <ArrowUpRight size={15}/></a></div>
   <div className="broadcast-heading"><h1>Your brand.<br/><em>Impossible to ignore.</em></h1><div><p>AI-powered commercials, characters, and worlds. Built around what makes your business different.</p><a className="button light" href="#formats">Find your video type <ArrowDown size={18}/></a></div></div>
   <VideoWall films={wall.length?wall:films.slice(0,6)} autoplay={placements.heroAutoplay}/>
  </section>
  <FormatPicker films={films} examples={placements.examples}/>
  <div className="film-library-link studio-surface" data-scroll-scene><span className="eyebrow">THE WORK / EXPLORE THE FILMS</span><a className="button light" href="/work">Browse all films <ArrowUpRight size={19}/></a></div>
  <section id="studio-preview" className="studio-invitation motion-studio cast-home-scene seated-cast-scene" data-scroll-scene><img src="/studio/reception-truth-jen-seated.webp" alt="Truth and Jen seated in the RTV studio lounge" loading="lazy"/><div className="studio-invitation-copy" data-reveal><span className="eyebrow">THE PEOPLE BEHIND THE PICTURE</span><h2>A little unexpected.<br/>Entirely your brand.</h2><p>Technology opens the door. Creative direction makes it worth walking through. We bring the idea, the production, and the attention to detail.</p><a className="button light" href="/studio">Meet the studio <ArrowUpRight size={19}/></a><CastPreview/></div></section>
  <section className="closing section studio-surface" data-scroll-scene><span className="surface-wordmark" aria-hidden="true">RTV</span><span className="eyebrow">HAVE SOMETHING IN MIND?</span><a href="/book" className="contact-scene-link contact-original-text" data-reveal><h2>Let’s make<br/><span>some noise.</span></h2><ArrowUpRight/></a><p>Tell us about your business. We’ll find the story.</p></section>
 </main><Footer/></MotionPage>;
}
