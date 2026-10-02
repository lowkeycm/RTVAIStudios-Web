'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight} from 'lucide-react';

export default function ResetPassword() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const access_token = fragment.get('access_token');
    const refresh_token = fragment.get('refresh_token');
    // Tokens are consumed only here and removed from browser history immediately.
    if (window.location.hash) history.replaceState(null, '', window.location.pathname);
    async function initialize() {
      if (fragment.has('error')) throw new Error('This setup link has expired. Ask your administrator to send a new one.');
      if (access_token || refresh_token) {
        if (!access_token || !refresh_token) throw new Error('This setup link is incomplete. Ask for a new email.');
        const response = await fetch('/api/auth/setup', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token,refresh_token})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'This setup link could not be opened.');
      }
      const response = await fetch('/api/desk/session', {cache:'no-store'});
      const data = await response.json();
      setReady(response.ok && !!data.member);
    }
    initialize().catch(failure => {setError(failure.message);setReady(false);});
  }, []);

  return <main className="desk-main"><div className="desk-welcome">
    <span className="eyebrow">TEAM ENTRANCE</span>
    <h1>A fresh<br/>start.</h1>
    {ready === null ? <p role="status">Checking your reset session…</p> : !ready ? <>
      <p>{error || 'Your setup session is missing or has expired. Ask your administrator to send a new setup email, or request a password reset.'}</p>
      <a href="/forgot-password" className="button light">Request a reset link<ArrowUpRight size={18}/></a>
    </> : <>
      <p>Choose a new password with at least 12 characters. You’ll sign in again after saving it.</p>
      <form onSubmit={async event => {
        event.preventDefault(); setError('');
        if (password !== confirmation) {setError('The passwords do not match.'); return;}
        setBusy(true);
        try {
          const response = await fetch('/api/auth/recovery', {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({password})});
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Your password could not be updated.');
          window.location.assign('/team-login?password=updated');
        } catch (failure) {setError(failure instanceof Error ? failure.message : 'Please try again.'); setBusy(false);}
      }}>
        <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)}/></div>
        <div className="field"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={event => setConfirmation(event.target.value)}/></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button light" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}<ArrowUpRight size={18}/></button>
      </form>
    </>}
    <a href="/team-login" className="text-link">Back to sign in</a>
  </div></main>;
}
