import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash, createHmac} from 'node:crypto';
import {canWatchVideo, videoSharePath} from '../lib/video-policy.ts';
import {bunnySignedUrl, bunnyUploadSignature, bunnyVideoStatus} from '../lib/bunny-signing.ts';

const privateVideo = {id:'video-123',status:'Ready',published:0,consent:0,share_enabled:false,share_key:'unlisted-secret'};

test('private uploads are denied to visitors and sales, even with a guessed ID', () => {
  assert.equal(canWatchVideo(privateVideo, privateVideo.id), false);
  assert.equal(canWatchVideo(privateVideo, privateVideo.id, 'sales'), false);
  assert.equal(canWatchVideo(privateVideo, privateVideo.id, 'production'), true);
  assert.equal(canWatchVideo(privateVideo, privateVideo.id, 'admin'), true);
  assert.equal(videoSharePath(privateVideo), null);
});

test('unlisted access requires both an enabled link and its exact token', () => {
  const video = {...privateVideo, share_enabled:true};
  assert.equal(canWatchVideo(video, video.id), false);
  assert.equal(canWatchVideo(video, 'wrong-token'), false);
  assert.equal(canWatchVideo(video, video.share_key), true);
  assert.equal(videoSharePath(video), '/watch/unlisted-secret');
  assert.equal(canWatchVideo({...video,share_enabled:false}, video.share_key), false);
  assert.equal(canWatchVideo({...video,share_key:'rotated-token'}, video.share_key), false);
});

test('public playback requires permission and completed processing', () => {
  const video = {...privateVideo,published:1,consent:1};
  assert.equal(canWatchVideo(video, video.id), true);
  assert.equal(videoSharePath(video), '/watch/video-123');
  assert.equal(canWatchVideo({...video,consent:0}, video.id), false);
  for (const status of ['Awaiting upload','Processing','Processing failed']) {
    assert.equal(canWatchVideo({...video,status,share_enabled:true},video.share_key,'admin'),false);
  }
});

test('trashed films cannot be played by any role or shared, even with stale visibility fields', () => {
  const video={...privateVideo,published:1,consent:1,share_enabled:true,deleted_at:'2026-09-29T23:45:00Z'};
  for(const role of [undefined,'sales','production','admin']){
    assert.equal(canWatchVideo(video,video.id,role),false);
    assert.equal(canWatchVideo(video,video.share_key,role),false);
  }
  assert.equal(videoSharePath(video),null);
  const restored={...video,deleted_at:null,published:0,share_enabled:false};
  assert.equal(canWatchVideo(restored,restored.id),false);
  assert.equal(canWatchVideo(restored,restored.id,'production'),true);
});

test('directory signing authenticates relative HLS segments and restricts scope to one video', () => {
  const id='01234567-0123-4123-8123-012345678901', expires=2000000000;
  const url=new URL(bunnySignedUrl('test.b-cdn.net','test-key',id,'playlist.m3u8',expires));
  const path='/'+id+'/';
  const prefix=url.pathname.split('/')[1];
  const params=new URLSearchParams(prefix.replace('bcdn_token=', 'token='));
  const expected='HS256-'+createHmac('sha256','test-key').update(path+expires+'token_path='+path).digest('base64url');
  assert.equal(params.get('token'),expected);
  assert.equal(params.get('token_path'),path);
  const variant=new URL('720p/video.m3u8',url);
  const segment=new URL('segment0.ts',variant);
  assert.ok(segment.pathname.startsWith('/'+prefix+path));
  assert.notEqual(bunnySignedUrl('test.b-cdn.net','different-key',id,'playlist.m3u8',expires),url.href);
  assert.throws(()=>bunnySignedUrl('evil.example','test-key',id,'playlist.m3u8',expires));
  assert.throws(()=>bunnySignedUrl('test.b-cdn.net','test-key',id,'../other.mp4',expires));
});

test('upload authorization binds the library, expiry and video without revealing its API key', () => {
  const signature=bunnyUploadSignature('123','test-api-key',2000000000,'video-guid');
  assert.equal(signature,createHash('sha256').update('123test-api-key2000000000video-guid').digest('hex'));
  assert.equal(signature.length,64);
  assert.notEqual(signature,bunnyUploadSignature('123','test-api-key',2000000000,'other-guid'));
});

test('processing cannot become ready until all encoding finishes', () => {
  assert.equal(bunnyVideoStatus({status:4,encodeProgress:100,availableResolutions:'360p,720p,1080p'}),'Ready');
  assert.equal(bunnyVideoStatus({status:4,encodeProgress:25,availableResolutions:'360p'}),'Processing');
  assert.equal(bunnyVideoStatus({status:5,encodeProgress:100}),'Processing failed');
  assert.equal(bunnyVideoStatus({status:0}),'Awaiting upload');
});
