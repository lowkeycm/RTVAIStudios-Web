export type VideoVisibility = {
  id: string;
  status: string;
  published: number | boolean;
  consent: number | boolean;
  share_enabled?: boolean;
  share_key?: string;
};

export function isPublicVideo(video: VideoVisibility) {
  return video.status === 'Ready' && !!video.published && !!video.consent;
}

export function canWatchVideo(video: VideoVisibility, key: string, staffRole?: string) {
  if (video.status !== 'Ready') return false;
  if (key === video.id && isPublicVideo(video)) return true;
  if (video.share_enabled && !!video.share_key && key === video.share_key) return true;
  return key === video.id && (staffRole === 'admin' || staffRole === 'production');
}

export function videoSharePath(video: VideoVisibility) {
  if (isPublicVideo(video)) return '/watch/' + video.id;
  if (video.status === 'Ready' && video.share_enabled && video.share_key) return '/watch/' + video.share_key;
  return null;
}
