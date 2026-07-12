import React from 'react';

export default function ChallengeModal({ challengerName, defenderName, onClose, onConfirm, error }) {
  return (
    <Overlay>
      <div style={{ fontSize: 16, fontWeight: 800 }}>Neue Herausforderung</div>
      <div style={{ fontSize: 13.5, color: 'oklch(0.35 0.02 90)', lineHeight: 1.55 }}>
        <strong>{challengerName}</strong> fordert <strong>{defenderName}</strong> heraus. Beide werden gesperrt, bis das Match beendet ist.
      </div>
      {error && <div style={{ fontSize: 12.5, color: 'oklch(0.55 0.16 25)', fontWeight: 600 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={secondaryBtn}>Abbrechen</button>
        <button onClick={onConfirm} style={primaryBtn}>Match eröffnen</button>
      </div>
    </Overlay>
  );
}

export function Overlay({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,30,20,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
      <div style={{ width: 340, background: 'white', borderRadius: 16, padding: 26, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        {children}
      </div>
    </div>
  );
}

export const primaryBtn = {
  padding: '10px 16px',
  background: 'oklch(0.55 0.13 155)',
  color: 'white',
  border: 'none',
  borderRadius: 9,
  fontWeight: 700,
  cursor: 'pointer',
};

export const secondaryBtn = {
  padding: '10px 16px',
  border: '1.5px solid oklch(0.88 0.01 90)',
  background: 'none',
  borderRadius: 9,
  fontWeight: 700,
  cursor: 'pointer',
};
