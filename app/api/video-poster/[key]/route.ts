import {accessibleVideo} from '@/lib/video-access';
import {bunnyPlayback} from '@/lib/bunny';
import {HttpError} from '@/lib/server';

export async function GET(_req: Request, {params}: {params: Promise<{key: string}>}) {
  try {
    const video = await accessibleVideo((await params).key, true);
    if (video.provider !== 'bunny') throw new HttpError(404, 'Image not found.');
    return new Response(null, {status: 307, headers: {Location: bunnyPlayback(video.object_key, 'thumbnail.jpg').url, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'origin'}});
  } catch (error) {
    return new Response(null, {status: error instanceof HttpError ? error.status : 503, headers: {'Cache-Control': 'private, no-store'}});
  }
}
