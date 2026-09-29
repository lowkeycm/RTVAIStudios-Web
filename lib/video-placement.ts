export const videoTypes = ['spot', 'impossible', 'avatar', 'universe'] as const;
export type VideoType = typeof videoTypes[number];
export type VideoPlacements = {hero: string[]; examples: Record<VideoType,string>; openers: Record<VideoType,string>; order: string[]};
export type PlacedFilm = {id:string; product:string; placement:string};
const curatedHero = ['rtv-bang','rtv-impossible','rtv-laced-01','rtv-brand','rtv-heritage-coaches','rtv-santa-director'];
export function defaultPlacements(): VideoPlacements {
  return {hero:[...curatedHero],examples:{spot:'rtv-bang',impossible:'rtv-impossible',avatar:'rtv-brand',universe:'rtv-laced-01'},openers:{spot:'rtv-bang',impossible:'rtv-impossible',avatar:'rtv-brand',universe:'rtv-laced-01'},order:['rtv-impossible','rtv-brand','rtv-laced-01','rtv-laced-02','rtv-laced-03','rtv-boring-epic','rtv-bang','rtv-santa-director','rtv-heritage-coaches','rtv-heritage-fees','rtv-heritage-returns','rtv-deathcast','rtv-horus-seth']};
}
export function parsePlacements(raw?: string): VideoPlacements {
  const fallback=defaultPlacements();
  try {
    const value=JSON.parse(raw||'null');
    if(!value || !Array.isArray(value.hero) || value.hero.length!==6 || !value.hero.every((id:unknown)=>typeof id==='string') || !Array.isArray(value.order) || !value.order.every((id:unknown)=>typeof id==='string'))return fallback;
    for(const group of ['examples','openers'])if(!value[group] || !videoTypes.every(type=>typeof value[group][type]==='string'))return fallback;
    return {hero:value.hero,examples:value.examples,openers:value.openers,order:value.order};
  }catch{return fallback;}
}
export function orderFilms<T extends PlacedFilm>(films:T[], order:string[]):T[]{
  const rank=new Map(order.map((id,index)=>[id,index]));
  return [...films].sort((a,b)=>(rank.get(a.id)??Infinity)-(rank.get(b.id)??Infinity));
}
export function heroFilms<T extends PlacedFilm>(films:T[], placements:VideoPlacements):T[]{
  const byId=new Map(films.map(f=>[f.id,f]));
  const reserved=new Set(placements.hero.filter(id=>byId.has(id)));
  const fallback=[...films.filter(f=>f.placement==='featured'),...curatedHero.map(id=>byId.get(id)).filter((f):f is T=>!!f),...films];
  const used=new Set<string>();
  return placements.hero.flatMap(id=>{
    const selected=byId.get(id);
    const film=selected&&!used.has(id)?selected:fallback.find(f=>!used.has(f.id)&&!reserved.has(f.id));
    if(!film)return []; used.add(film.id);return [film];
  });
}
export function typeExample<T extends PlacedFilm>(films:T[], type:string, id?:string):T|undefined{
  return films.find(f=>f.id===id&&f.product===type)||films.find(f=>f.product===type);
}
export function withOpener<T extends PlacedFilm>(films:T[], id?:string):T[]{
  const opener=films.find(f=>f.id===id);return opener?[opener,...films.filter(f=>f.id!==id)]:films;
}
export function validatePlacements(value:VideoPlacements, films:PlacedFilm[]):string|null{
  const byId=new Map(films.map(f=>[f.id,f]));
  const assigned=value.hero.filter(Boolean);
  if(new Set(assigned).size!==assigned.length)return 'Choose a different film for each hero screen.';
  if(new Set(value.order).size!==value.order.length)return 'Each film can appear only once in the gallery order.';
  for(const id of [...assigned,...value.order,...Object.values(value.examples),...Object.values(value.openers)].filter(Boolean))if(!byId.has(id))return 'An assigned film is no longer published. Replace it before saving.';
  for(const group of [value.examples,value.openers])for(const type of videoTypes)if(group[type]&&byId.get(group[type])?.product!==type)return 'Video-type examples and opening films must match their channel.';
  return null;
}

export function publicCatalog<T extends PlacedFilm & {status:string;published:number;consent:number}>(records:T[], legacy:PlacedFilm[], hideLegacy:boolean){
  const overridden=new Set(records.map(f=>f.id));
  return [...records.filter(f=>f.status==='Ready'&&!!f.published&&!!f.consent&&f.placement!=='none'),...(hideLegacy?[]:legacy.filter(f=>!overridden.has(f.id)))];
}
