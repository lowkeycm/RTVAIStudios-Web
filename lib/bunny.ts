import 'server-only';
import {runtime, HttpError} from './server';
import {bunnySignedUrl, bunnyUploadSignature, bunnyVideoStatus} from './bunny-signing';

export function bunnyConfigured() {
  return !!(runtime.BUNNY_STREAM_API_KEY && runtime.BUNNY_STREAM_LIBRARY_ID && runtime.BUNNY_STREAM_CDN_HOST && runtime.BUNNY_STREAM_TOKEN_KEY);
}

export async function bunnyRequest(path: string, method = 'GET', payload?: unknown) {
  if (!bunnyConfigured()) throw new HttpError(409, 'Bunny Stream setup is not complete yet.');
  const response = await fetch(`https://video.bunnycdn.com/library/${runtime.BUNNY_STREAM_LIBRARY_ID}/videos${path}`, {
    method, cache: 'no-store', signal: AbortSignal.timeout(20000),
    headers: {AccessKey: runtime.BUNNY_STREAM_API_KEY!, 'Content-Type': 'application/json', Accept: 'application/json'},
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  if (!response.ok) throw new HttpError(502, 'Bunny could not complete this request. Check the connection and try again.');
  return response.json();
}

export function bunnyUploadTicket(videoId: string) {
  if (!bunnyConfigured()) throw new HttpError(409, 'Bunny Stream setup is not complete yet.');
  const expires = Math.floor(Date.now() / 1000) + 6 * 3600;
  return {
    endpoint: 'https://video.bunnycdn.com/tusupload',
    headers: {
      AuthorizationSignature: bunnyUploadSignature(runtime.BUNNY_STREAM_LIBRARY_ID!, runtime.BUNNY_STREAM_API_KEY!, expires, videoId),
      AuthorizationExpire: String(expires),
      LibraryId: runtime.BUNNY_STREAM_LIBRARY_ID!,
      VideoId: videoId,
    },
  };
}

export async function createBunnyVideo(title: string) {
  const video = await bunnyRequest('', 'POST', {title});
  if (!/^[a-f0-9-]{36}$/i.test(video.guid)) throw new HttpError(502, 'Bunny did not return a valid upload.');
  return {videoId: video.guid as string, ...bunnyUploadTicket(video.guid)};
}

export function bunnyPlayback(videoId: string, file = 'playlist.m3u8') {
  if (!bunnyConfigured()) throw new HttpError(503, 'Video playback is temporarily unavailable.');
  const expires = Math.floor(Date.now() / 1000) + 3600;
  return {url: bunnySignedUrl(runtime.BUNNY_STREAM_CDN_HOST!, runtime.BUNNY_STREAM_TOKEN_KEY!, videoId, file, expires), expires};
}

export async function getBunnyStatus(videoId: string) {
  const video = await bunnyRequest('/' + encodeURIComponent(videoId));
  return {status: bunnyVideoStatus(video), duration: video.length || 0, thumbnail: video.thumbnailFileName || 'thumbnail.jpg'};
}
