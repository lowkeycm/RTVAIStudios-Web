'use client';

import {useEffect, useState} from 'react';
import {ArrowUpRight} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordMode, setPasswordMode] = useState(true);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  useEffect(() => {
    setPasswordUpdated(new URLSearchParams(window.location.search).get('password') === 'updated');
  }, []);

  return <main className="desk-main"><div className="desk-welcome">
    <span className="eyebrow">TEAM ENTRANCE</span>
    <h1>The other side<br/>of the studio.</h1>
    <p>Sign in with your approved studio email.</p>
    {passwordUpdated && <p role="status">Your password has been updated. Sign in with your new password.</p>}
    {sent ? <div role="status">
      <p>Check your inbox for a sign-in link. Open it in this same browser to enter your studio workspace.</p>
      <p>To change your password, use the password-reset option below.</p>
      <button type="button" className="text-link" onClick={() => setSent(false)}>Use another email or request a new link</button>
    </div> : <form onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError('');
      try {
        const response = await fetch('/api/auth', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, ...(passwordMode ? {password} : {})}),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Sign-in is unavailable. Please try again.');
        if (passwordMode) window.location.assign('/desk');
        else setSent(true);
      } catch (failure) {setError(failure instanceof Error ? failure.message : 'Please try again.');}
      finally {setBusy(false);}
    }}>
      <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} required onChange={event => setEmail(event.target.value)}/></div>
      {passwordMode && <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} required onChange={event => setPassword(event.target.value)}/></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button light" disabled={busy}>{busy ? 'One moment…' : passwordMode ? 'Open my studio' : 'Email my sign-in link'}<ArrowUpRight size={18}/></button>
    </form>}
    <button type="button" className="text-link" disabled={busy} onClick={() => {setPasswordMode(!passwordMode); setSent(false); setError('');}}>{passwordMode ? 'Sign in with an email link' : 'Use my password'}</button>
    <a href="/forgot-password" className="text-link">Forgot password? Send a reset link</a>
    <a href="/" className="text-link">Back to the website</a>
  </div></main>;
}
