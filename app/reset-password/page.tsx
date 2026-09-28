'use client';

import {useEffect, useState} from 'react';
import {ArrowUpRight} from 'lucide-react';

export default function ResetPassword() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/desk/session', {signal: controller.signal, cache: 'no-store'})
      .then(async response => {const data = await response.json(); setReady(response.ok && !!data.member);})
      .catch(failure => {if (failure.name !== 'AbortError') setReady(false);});
    return () => controller.abort();
  }, []);

  return <main className="desk-main"><div className="desk-welcome">
    <span className="eyebrow">TEAM ENTRANCE</span>
    <h1>A fresh<br/>start.</h1>
    {ready === null ? <p role="status">Checking your reset session…</p> : !ready ? <>
      <p>Your reset session is missing or has expired. Request a new link and open it in the browser where you requested it.</p>
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
