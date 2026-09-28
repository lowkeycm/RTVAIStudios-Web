import {notFound} from 'next/navigation';
import {channels} from '@/lib/catalog';
import {getPublicFilms} from '@/lib/server';
import {ServiceExperience} from '@/components/rtv/service-experience';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const slug=(await params).slug;return {title:channels.find(c=>c.id===slug)?.name||'Production'}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const c=channels.find(c=>c.id===slug);if(!c)notFound();const films=(await getPublicFilms()).filter(f=>f.product===c.id);return <ServiceExperience channel={c.id} films={films}/>;}
