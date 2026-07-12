import React, { useState } from 'react';

export default function AdminPanel({ ranking, lockedIds, onAddPlayer, onRemovePlayer, onUpdateEmail, onResetPassword }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [resettingId, setResettingId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [rowError, setRowError] = useState(null);

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

  function generatePassword(setter) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let out = '';
    for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setter(out);
  }

  function startEditEmail(p) {
    setResettingId(null);
    setRowError(null);
    setEditingId(p.id);
    setEditEmail(p.email);
  }

  async function saveEmail(playerId) {
    setRowError(null);
    try {
      await onUpdateEmail(playerId, editEmail);
      setEditingId(null);
    } catch (err) {
      setRowError(err.message);
    }
  }

  function startResetPassword(p) {
    setEditingId(null);
    setRowError(null);
    setResettingId(p.id);
    setResetPassword('');
  }

  async function saveResetPassword(playerId) {
    setRowError(null);
    try {
      await onResetPassword(playerId, resetPassword);
      setResettingId(null);
    } catch (err) {
      setRowError(err.message);
    }
  }

  return (
    <div style={{ margin: '16px 28px 0', padding: '16px 20px', background: 'oklch(0.98 0.005 90)', border: '1px solid oklch(0.9 0.01 90)', borderRadius: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Spielerverwaltung · {ranking.length} Mitglieder</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto', marginBottom: 14 }}>
        {ranking.map((p) => (
          <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '6px 10px', background: 'white', border: '1px solid oklch(0.92 0.01 90)', borderRadius: 8, fontSize: 12.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontVariantNumeric: 'tabular-nums', color: 'oklch(0.48 0.02 90)', width: 24, fontWeight: 700 }}>#{p.rank}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                {editingId !== p.id && <div style={{ color: 'oklch(0.55 0.02 90)', fontSize: 11 }}>{p.email}</div>}
              </span>
              {lockedIds.has(p.id) ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'oklch(0.55 0.02 90)' }}>im Match</span>
              ) : (
                <button onClick={() => onRemovePlayer(p.id)} style={{ background: 'none', border: 'none', color: 'oklch(0.55 0.16 25)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                  Entfernen
                </button>
              )}
            </div>

            {editingId !== p.id && resettingId !== p.id && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => startEditEmail(p)} style={linkBtn}>E-Mail bearbeiten</button>
                <button onClick={() => startResetPassword(p)} style={linkBtn}>Kennwort zurücksetzen</button>
              </div>
            )}

            {editingId === p.id && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => saveEmail(p.id)} style={primaryBtnSm}>Speichern</button>
                <button onClick={() => setEditingId(null)} style={secondaryBtnSm}>Abbrechen</button>
              </div>
            )}

            {resettingId === p.id && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Neues Kennwort" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                <button type="button" onClick={() => generatePassword(setResetPassword)} style={secondaryBtnSm}>Generieren</button>
                <button onClick={() => saveResetPassword(p.id)} style={primaryBtnSm}>Zurücksetzen</button>
                <button onClick={() => setResettingId(null)} style={secondaryBtnSm}>Abbrechen</button>
              </div>
            )}

            {(editingId === p.id || resettingId === p.id) && rowError && (
              <div style={{ fontSize: 11.5, color: 'oklch(0.55 0.16 25)', fontWeight: 600 }}>{rowError}</div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
        <input placeholder="E-Mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Initiales Kennwort" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, flex: 1 }} required />
          <button type="button" onClick={() => generatePassword(setPassword)} style={secondaryBtn}>Generieren</button>
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
const primaryBtnSm = { padding: '7px 12px', background: 'oklch(0.55 0.13 155)', color: 'white', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' };
const secondaryBtnSm = { padding: '7px 12px', background: 'none', border: '1.5px solid oklch(0.88 0.01 90)', borderRadius: 7, fontSize: 12, fontWeight: 700, color: 'oklch(0.35 0.02 90)', cursor: 'pointer' };
const linkBtn = { background: 'none', border: 'none', color: 'oklch(0.5 0.13 155)', cursor: 'pointer', fontSize: 11.5, fontWeight: 700, padding: 0 };
