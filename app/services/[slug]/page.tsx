import {notFound} from 'next/navigation';
import {channels} from '@/lib/catalog';
import {getPublicFilms} from '@/lib/server';
import {ServiceExperience} from '@/components/rtv/service-experience';
import {getVideoPlacements} from '@/lib/placements-server';
import {withOpener} from '@/lib/video-placement';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const slug=(await params).slug;return {title:channels.find(c=>c.id===slug)?.name||'Production'}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const c=channels.find(c=>c.id===slug);if(!c)notFound();const [all,placements]=await Promise.all([getPublicFilms(),getVideoPlacements()]);const films=withOpener(all.filter(f=>f.product===c.id),placements.openers[c.id]);return <ServiceExperience channel={c.id} films={films}/>;}
