import React, { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ChangePasswordPage() {
  const { session, markPasswordChanged, logout } = useAuth();
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (pwNew.length < 6) return setError('Mindestens 6 Zeichen.');
    if (pwNew !== pwConfirm) return setError('Kennwörter stimmen nicht überein.');
    setError(null);
    setSubmitting(true);
    try {
      await api.changePassword(pwNew);
      markPasswordChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 40, gap: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Kennwort ändern</div>
        <div style={{ fontSize: 13.5, color: 'oklch(0.5 0.02 90)', marginTop: 6, lineHeight: 1.5 }}>
          Hallo {session?.name}, bevor du andere Spieler:innen herausfordern kannst, lege bitte ein neues Kennwort fest.
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
        <input placeholder="Neues Kennwort" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} style={inputStyle} required />
        <input placeholder="Kennwort bestätigen" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} style={inputStyle} required />
        {error && <div style={{ fontSize: 12.5, color: 'oklch(0.55 0.16 25)', fontWeight: 600 }}>{error}</div>}
        <button type="submit" disabled={submitting} style={{ padding: 11, background: 'oklch(0.55 0.13 155)', color: 'white', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Kennwort speichern
        </button>
        <button type="button" onClick={logout} style={{ padding: 9, background: 'none', border: 'none', color: 'oklch(0.55 0.02 90)', fontSize: 12.5, cursor: 'pointer' }}>
          Abmelden
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: '11px 14px',
  border: '1px solid oklch(0.88 0.01 90)',
  borderRadius: 9,
  fontSize: 14,
};
