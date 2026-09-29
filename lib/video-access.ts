import 'server-only';
import {admin, result, currentMember, getPublicFilms, HttpError} from './server';
import {baselineFilms} from './catalog';
import {canWatchVideo, isPublicVideo, type VideoVisibility} from './video-policy';
import type {Film} from '@/components/rtv/chrome';
type VideoRecord = Film & VideoVisibility & {object_key:string; show_cta?:boolean};

export async function accessibleVideo(key: string, allowStaff = false) {
  if (!/^[a-zA-Z0-9_-]{3,80}$/.test(key)) throw new HttpError(404, 'Video not found.');
  if (baselineFilms.some(film => film.id === key)) {
    const film = (await getPublicFilms()).find(film => film.id === key);
    if (film) return {...film, status: 'Ready', published: 1, consent: 1, show_cta: true, object_key:''};
    throw new HttpError(404, 'Video not found.');
  }
  const video = await result<VideoRecord | null>(admin().from('videos').select('*').or(`id.eq.${key},share_key.eq.${key}`).maybeSingle());
  if (!video) throw new HttpError(404, 'Video not found.');
  if (!canWatchVideo(video, key)) {
    const member = allowStaff ? await currentMember() : null;
    if (!canWatchVideo(video, key, member?.role)) throw new HttpError(404, 'Video not found.');
  }
  return video;
}

export function watchFilm(video: VideoRecord, key: string) {
  return {
    id: video.id, title: video.title, description: video.description,
    product: video.product, industry: video.industry, tags: video.tags,
    placement: video.placement, provider: video.provider,
    poster: video.provider === 'bunny' ? '/api/video-poster/' + key : video.poster,
    source: video.provider === 'bunny' ? '/api/playback/' + key : video.provider === 'supabase' ? '/api/media/' + key : video.provider === 'stream' ? '/api/video-embed/' + key : video.source,
    showCta: video.show_cta !== false, public: isPublicVideo(video),
  };
}
