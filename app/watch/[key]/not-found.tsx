import {Brand} from '@/components/rtv/chrome';
export default function FilmNotFound() {
  return <main className="desk-welcome" style={{minHeight:'90svh',padding:'8vw'}}><Brand/><span className="eyebrow">RTV / SCREENING LINK</span><h1>This film isn’t available.</h1><p>The link may have been turned off, or the video is still being prepared. Ask the person who sent it for a current link.</p><a className="button light" href="/work">Explore the work</a></main>;
}
