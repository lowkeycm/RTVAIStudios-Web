"use client";
import {Play,ArrowUpRight} from 'lucide-react';
import type {Film} from './chrome';
export function ServiceFilms({films}:{films:Film[]}){if(!films.length)return null;return <section className="content-section"><div className="section-heading"><h2>On this channel.</h2><a className="text-link" href={'/work?product='+films[0].product}>The screening room <ArrowUpRight size={18}/></a></div><div className="gallery-grid">{films.slice(0,4).map(f=><a className="film-card" key={f.id} href={'/work?product='+f.product+'&film='+encodeURIComponent(f.id)}><div className="film-frame"><img src={f.poster} alt="" loading="lazy"/><span className="film-play"><Play size={22}/></span></div><div className="film-caption"><h3>{f.title}</h3><ArrowUpRight size={21}/></div></a>)}</div></section>}
