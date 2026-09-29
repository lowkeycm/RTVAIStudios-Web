import {accessibleVideo} from '@/lib/video-access';
import {streamRequest} from '@/lib/providers';
import {HttpError} from '@/lib/server';

export async function GET(req: Request, {params}: {params: Promise<{key: string}>}) {
  try {
    const video = await accessibleVideo((await params).key, true);
    if (video.provider !== 'stream') throw new HttpError(404, 'Video not found.');
    const token = await streamRequest('/' + video.object_key + '/token', 'POST', {exp: Math.floor(Date.now() / 1000) + 3600});
    const url = new URL('https://iframe.videodelivery.net/' + token.token);
    url.searchParams.set('autoplay', new URL(req.url).searchParams.get('autoplay') === 'true' ? 'true' : 'false');
    url.searchParams.set('controls', 'true');
    return new Response(null, {status: 307, headers: {Location: url.toString(), 'Cache-Control': 'private, no-store'}});
  } catch (error) {
    return new Response(null, {status: error instanceof HttpError ? error.status : 503, headers: {'Cache-Control': 'private, no-store'}});
  }
}
