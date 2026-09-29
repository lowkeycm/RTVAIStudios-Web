import {createHash, createHmac} from 'node:crypto';

export function bunnyUploadSignature(libraryId: string, apiKey: string, expires: number, videoId: string) {
  return createHash('sha256').update(libraryId + apiKey + expires + videoId).digest('hex');
}

// A directory token keeps the relative HLS playlists and segments authenticated.
// The signing string uses unescaped values; the URL uses escaped values.
export function bunnySignedUrl(host: string, key: string, videoId: string, file: string, expires: number) {
  if (!/^[a-zA-Z0-9.-]+\.b-cdn\.net$/.test(host) || !/^[a-f0-9-]{36}$/i.test(videoId) || !/^[a-zA-Z0-9_.-]+$/.test(file)) {
    throw new Error('Invalid Bunny playback configuration.');
  }
  const path = '/' + videoId + '/';
  const token = 'HS256-' + createHmac('sha256', key).update(path + expires + 'token_path=' + path).digest('base64url');
  return `https://${host}/bcdn_token=${token}&expires=${expires}&token_path=${encodeURIComponent(path)}${path}${file}`;
}

export function bunnyVideoStatus(video: {status: number; encodeProgress?: number; availableResolutions?: string}) {
  if ([5, 6].includes(video.status)) return 'Processing failed';
  if (video.status === 4 && video.encodeProgress === 100 && video.availableResolutions) return 'Ready';
  return video.status === 0 ? 'Awaiting upload' : 'Processing';
}
