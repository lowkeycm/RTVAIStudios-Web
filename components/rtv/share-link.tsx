'use client';
import {useState} from 'react';
import {Check, Copy} from 'lucide-react';

export function ShareLink({path, referral, label = 'Copy share link'}: {path: string; referral?: string; label?: string}) {
  const [copied, setCopied] = useState(false), [fallback, setFallback] = useState('');
  async function copy() {
    // Copied client links must use the domain approved for video delivery,
    // even when this component is opened from a deployment preview.
    const url = new URL(path, 'https://www.rtvaistudios.com');
    if (referral) url.searchParams.set('ref', referral);
    try {await navigator.clipboard.writeText(url.toString()); setCopied(true); setTimeout(() => setCopied(false), 2500);}
    catch {setFallback(url.toString());}
  }
  return <div className="share-control"><button type="button" className="button small" onClick={copy}>{copied ? <Check size={16}/> : <Copy size={16}/>}<span aria-live="polite">{copied ? 'Link copied' : label}</span></button>{fallback && <input className="share-fallback" readOnly value={fallback} aria-label="Select and copy video link" onFocus={event => event.target.select()}/>}</div>;
}
