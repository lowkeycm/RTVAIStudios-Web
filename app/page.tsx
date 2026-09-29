import { Home } from '@/components/rtv/home';
import { getPublicFilms } from '@/lib/server';
import {getVideoPlacements} from '@/lib/placements-server';
export const dynamic = 'force-dynamic';
export default async function Page(){ const [films,placements]=await Promise.all([getPublicFilms(),getVideoPlacements()]);return <Home films={films} placements={placements}/>; }
