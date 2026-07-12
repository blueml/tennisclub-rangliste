import React, { useState } from 'react';

export default function AdminPanel({ ranking, lockedIds, onAddPlayer, onRemovePlayer }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await onAddPlayer(name, email, password);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  }

  function generatePassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let out = '';
    for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setPassword(out);
  }

  return (
    <div style={{ margin: '16px 28px 0', padding: '16px 20px', background: 'oklch(0.98 0.005 90)', border: '1px solid oklch(0.9 0.01 90)', borderRadius: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Spielerverwaltung · {ranking.length} Mitglieder</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto', marginBottom: 14 }}>
        {ranking.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'white', border: '1px solid oklch(0.92 0.01 90)', borderRadius: 8, fontSize: 12.5 }}>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'oklch(0.48 0.02 90)', width: 24, fontWeight: 700 }}>#{p.rank}</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{p.name}</span>
            {lockedIds.has(p.id) ? (
              <span style={{ fontSize: 11, fontWeight: 700, color: 'oklch(0.55 0.02 90)' }}>im Match</span>
            ) : (
              <button onClick={() => onRemovePlayer(p.id)} style={{ background: 'none', border: 'none', color: 'oklch(0.55 0.16 25)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                Entfernen
              </button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
        <input placeholder="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Initiales Kennwort" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, flex: 1 }} required />
          <button type="button" onClick={generatePassword} style={secondaryBtn}>Generieren</button>
        </div>
        {error && <div style={{ fontSize: 12.5, color: 'oklch(0.55 0.16 25)', fontWeight: 600 }}>{error}</div>}
        <button type="submit" style={primaryBtn}>Spieler:in anlegen</button>
      </form>
    </div>
  );
}

const inputStyle = { padding: '9px 12px', border: '1px solid oklch(0.88 0.01 90)', borderRadius: 8, fontSize: 13 };
const primaryBtn = { padding: '9px 16px', background: 'oklch(0.55 0.13 155)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const secondaryBtn = { padding: '9px 14px', background: 'none', border: '1.5px solid oklch(0.88 0.01 90)', borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: 'oklch(0.35 0.02 90)', cursor: 'pointer' };
