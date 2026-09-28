import {Work} from '@/components/rtv/work';
import {getPublicFilms} from '@/lib/server';
import {channels} from '@/lib/catalog';
export const dynamic='force-dynamic';
export const metadata={title:'The work — Film library'};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const q=await searchParams;const value=(key:string)=>typeof q[key]==='string'?q[key] as string:undefined;const product=value('product');return <Work films={await getPublicFilms()} initialFilters={{product:channels.some(c=>c.id===product)?product:'all',industry:value('industry'),q:value('q'),film:value('film')}}/>}
