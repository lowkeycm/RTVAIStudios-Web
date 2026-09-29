'use client';
import {useEffect, useMemo, type RefObject} from 'react';
import type Hls from 'hls.js';
import type {Film} from './chrome';
import type {MediaHandle} from './playback';

// The signed stream and HLS runtime are requested only after an explicit play.
function createMediaController(film?: Pick<Film,'id'|'provider'|'source'>) {
    let videoElement: HTMLVideoElement | null = null;
    const getVideo = () => videoElement;
    let hls: Hls | null = null;
    let loading: Promise<void> | null = null;
    let loaded = false, disposed = false, wantsPlay = false;
    const ensureSource = async () => {
      const video = getVideo();
      if (!video || !film || disposed) throw new Error('Video unavailable.');
      if (film.provider !== 'bunny' || loaded) return;
      if (!loading) loading = (async () => {
        const response = await fetch(film.source, {cache: 'no-store', signal: AbortSignal.timeout(20000)});
        const data = await response.json();
        if (!response.ok || !data.url) throw new Error(data.error || 'Video unavailable.');
        if (disposed) return;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = data.url;
          loaded = true;
          return;
        }
        const {default: HlsPlayer} = await import('hls.js');
        if (disposed) return;
        if (!HlsPlayer.isSupported()) throw new Error('This browser cannot play this video.');
        hls = new HlsPlayer({autoStartLoad: false, maxBufferLength: 10, maxMaxBufferLength: 20, maxBufferSize: 10 * 1024 * 1024, backBufferLength: 10, capLevelToPlayerSize: true});
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Video loading timed out. Try again.')), 20000);
          hls!.on(HlsPlayer.Events.MANIFEST_PARSED, () => {clearTimeout(timer); loaded = true; resolve();});
          hls!.on(HlsPlayer.Events.ERROR, (_event, data) => {
            if (!data.fatal) return;
            clearTimeout(timer); loaded = false;
            hls?.destroy(); hls = null;
            if (!disposed) video.dispatchEvent(new Event('error'));
            reject(new Error('Video could not load. Try again.'));
          });
          hls!.loadSource(data.url);
          hls!.attachMedia(video);
        });
      })().catch(error => {hls?.destroy(); hls = null; loaded = false; throw error;}).finally(() => {loading = null;});
      await loading;
    };
    const handle: MediaHandle = {
      async play() {wantsPlay = true; await ensureSource(); if (!wantsPlay || disposed) return; hls?.startLoad(); await getVideo()?.play();},
      pause() {wantsPlay = false; getVideo()?.pause(); hls?.stopLoad();},
      get paused() {return getVideo()?.paused ?? true;},
      get muted() {return getVideo()?.muted ?? false;},
      set muted(value) {const video=getVideo(); if (video) video.muted = value;},
      get volume() {return getVideo()?.volume ?? .7;},
      set volume(value) {const video=getVideo(); if (video) video.volume = value;},
      get currentTime() {return getVideo()?.currentTime ?? 0;},
      set currentTime(value) {const video=getVideo(); if (video) video.currentTime = value;},
      get duration() {return getVideo()?.duration ?? 0;},
      addEventListener(event, listener) {getVideo()?.addEventListener(event, listener);},
      removeEventListener(event, listener) {getVideo()?.removeEventListener(event, listener);},
    };
    return {handle, attach(video: HTMLVideoElement | null) {videoElement = video; disposed = false;}, resumeLoading() {hls?.startLoad();}, stopLoading() {hls?.stopLoad();}, destroy() {disposed = true; wantsPlay = false; hls?.destroy(); hls = null; loaded = false; loading = null;}};
}

export function useVideoMedia(videoRef: RefObject<HTMLVideoElement | null>, film?: Film) {
  const id=film?.id, provider=film?.provider, source=film?.source;
  const controller = useMemo(() => createMediaController(id&&provider&&source?{id,provider,source}:undefined),[id,provider,source]);

  useEffect(() => {
    const video = videoRef.current;
    controller.attach(video);
    if (!video || film?.provider === 'stream') return () => controller.destroy();
    const hidden = () => {if (document.hidden) controller.handle.pause();};
    const observer = new IntersectionObserver(([entry]) => {if (!entry.isIntersecting) controller.handle.pause();}, {threshold: 0});
    observer.observe(video);
    video.addEventListener('play', controller.resumeLoading);
    video.addEventListener('pause', controller.stopLoading);
    document.addEventListener('visibilitychange', hidden);
    return () => {controller.handle.pause(); controller.destroy(); observer.disconnect(); video.removeEventListener('play', controller.resumeLoading); video.removeEventListener('pause', controller.stopLoading); document.removeEventListener('visibilitychange', hidden);};
  }, [controller, videoRef, film?.provider]);
  return controller.handle;
}
