import 'server-only';
import {admin,result} from './supabase/admin';
import {parsePlacements} from './video-placement';
export async function getVideoPlacements(){
  try{const row=await result<{value:string}|null>(admin().from('settings').select('value').eq('key','video_placements').maybeSingle());return parsePlacements(row?.value);}catch{return parsePlacements();}
}
