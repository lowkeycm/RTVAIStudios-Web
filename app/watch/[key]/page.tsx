import {cache} from 'react';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ArrowUpRight, Film, Download} from 'lucide-react';
import {Brand, Attribution} from '@/components/rtv/chrome';
import {InlineFilm} from '@/components/rtv/inline-film';
import {ShareLink} from '@/components/rtv/share-link';
import {accessibleVideo, watchFilm} from '@/lib/video-access';
import {HttpError} from '@/lib/server';
import {channels} from '@/lib/catalog';
import './watch.css';

export const dynamic = 'force-dynamic';
const getFilm = cache(async (key: string) => {
  try {return watchFilm(await accessibleVideo(key), key);}
  catch (error) {if (error instanceof HttpError && error.status === 404) notFound(); throw error;}
});

export async function generateMetadata({params}: {params: Promise<{key: string}>}): Promise<Metadata> {
  const {key} = await params, film = await getFilm(key);
  return {
    title: film.title, description: film.description || 'An RTV AI Studios production.',
    robots: {index: false, follow: false}, referrer: 'origin',
    openGraph: {title: film.title + ' | RTV AI Studios', description: film.description || 'Watch the film.', images: film.poster ? [new URL(film.poster, 'https://www.rtvaistudios.com').href] : undefined},
  };
}

export default async function WatchPage({params}: {params: Promise<{key: string}>}) {
  const {key} = await params, film = await getFilm(key), channel = channels.find(channel => channel.id === film.product);
  return <div className="watch-page"><Attribution/><header className="watch-header"><Brand/><a href="/work" className="text-link">Explore the studio <ArrowUpRight size={16}/></a></header><main className="watch-main"><div className="watch-kicker"><span><Film size={14}/>RTV / NOW SHOWING</span><span>{channel?.name || 'Studio production'}</span></div><div className="watch-screen"><InlineFilm film={film}/></div><div className="watch-details"><div><h1>{film.title}</h1>{film.description && <p>{film.description}</p>}{film.industry && <span className="watch-industry">{film.industry}</span>}</div>{film.downloadPath?<a className="button light" href={film.downloadPath}><Download size={19}/>Download video · {film.downloadLabel}</a>:<ShareLink path={'/watch/' + key}/>}</div>{film.showCta && <aside className="watch-cta"><div><span className="eyebrow">YOUR STORY, NEXT.</span><h2>Let’s make something worth watching.</h2></div><a href={'/book?product=' + film.product} className="button light">Make me one like this! <ArrowUpRight size={20}/></a></aside>}</main><footer className="watch-footer"><span>© {new Date().getFullYear()} RTV AI Studios</span><a href="/privacy">Privacy</a></footer></div>;
}
