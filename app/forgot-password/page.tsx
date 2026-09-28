'use client';

import {useEffect, useState} from 'react';
import {ArrowUpRight} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'invalid-link') {
      setError('That reset link could not be verified. Request a new link and open it in this same browser.');
    }
  }, []);

  return <main className="desk-main"><div className="desk-welcome">
    <span className="eyebrow">TEAM ENTRANCE</span>
    <h1>Back to<br/>the studio.</h1>
    <p>Reset the password for your approved studio account.</p>
    {sent ? <div role="status"><p>If that address belongs to an active team member, a reset link is on its way. Check your inbox and spam folder, and open the link in this same browser.</p></div> :
      <form onSubmit={async event => {
        event.preventDefault(); setBusy(true); setError('');
        try {
          const response = await fetch('/api/auth/recovery', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email})});
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'The reset email could not be sent.');
          setSent(true);
        } catch (failure) {setError(failure instanceof Error ? failure.message : 'Please try again.');}
        finally {setBusy(false);}
      }}>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} required onChange={event => setEmail(event.target.value)}/></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button light" disabled={busy}>{busy ? 'One moment…' : 'Send reset link'}<ArrowUpRight size={18}/></button>
      </form>}
    <a href="/team-login" className="text-link">Back to sign in</a>
  </div></main>;
}
