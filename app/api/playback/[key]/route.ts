import {accessibleVideo} from '@/lib/video-access';
import {bunnyPlayback} from '@/lib/bunny';
import {safe, HttpError} from '@/lib/server';

export async function GET(req: Request, {params}: {params: Promise<{key: string}>}) {
  return safe(async () => {
    if (req.headers.get('sec-fetch-site') === 'cross-site') throw new HttpError(403, 'Open this video on the studio website.');
    const video = await accessibleVideo((await params).key, true);
    if (video.provider !== 'bunny') throw new HttpError(404, 'Video not found.');
    return {...bunnyPlayback(video.object_key), type: 'hls'};
  });
}
