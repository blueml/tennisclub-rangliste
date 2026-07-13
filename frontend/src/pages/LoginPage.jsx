import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

const tabBase = {
  padding: '9px 20px',
  border: 'none',
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

export default function LoginPage() {
  const { loginAsPlayer, loginAsAdmin } = useAuth();
  const [tab, setTab] = useState('player');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (tab === 'player') {
        await loginAsPlayer(email, password);
      } else {
        await loginAsAdmin(username, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 40,
        gap: 22,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'oklch(0.55 0.13 155)' }}>
          TC Rösrath e.V.
        </div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>Anmelden</div>
      </div>

      <div style={{ display: 'flex', background: 'oklch(0.95 0.006 90)', borderRadius: 10, padding: 4, gap: 4 }}>
        <button
          type="button"
          onClick={() => setTab('player')}
          style={{ ...tabBase, background: tab === 'player' ? 'white' : 'none', color: tab === 'player' ? 'oklch(0.22 0.02 90)' : 'oklch(0.55 0.02 90)', boxShadow: tab === 'player' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}
        >
          Spieler
        </button>
        <button
          type="button"
          onClick={() => setTab('admin')}
          style={{ ...tabBase, background: tab === 'admin' ? 'white' : 'none', color: tab === 'admin' ? 'oklch(0.22 0.02 90)' : 'oklch(0.55 0.02 90)', boxShadow: tab === 'admin' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}
        >
          Admin
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
        {tab === 'player' ? (
          <input
            placeholder="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
        ) : (
          <input
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
        )}
        <input
          placeholder="Kennwort"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        {error && <div style={{ fontSize: 13, color: 'oklch(0.55 0.16 25)', fontWeight: 600 }}>{error}</div>}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: 11,
            background: tab === 'player' ? 'oklch(0.55 0.13 155)' : 'oklch(0.22 0.02 90)',
            color: 'white',
            border: 'none',
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 14,
            cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {tab === 'player' ? 'Anmelden' : 'Als Admin anmelden'}
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
