import { Home } from '@/components/rtv/home';
import { getPublicFilms } from '@/lib/server';
export const dynamic = 'force-dynamic';
export default async function Page(){ return <Home films={await getPublicFilms()}/>; }
