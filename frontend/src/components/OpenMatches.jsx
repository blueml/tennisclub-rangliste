import React from 'react';

const MATCH_COLORS = [
  'oklch(0.62 0.14 25)',
  'oklch(0.62 0.13 75)',
  'oklch(0.58 0.13 145)',
  'oklch(0.6 0.12 220)',
  'oklch(0.58 0.13 280)',
  'oklch(0.62 0.14 335)',
];

export function colorForMatch(matchId) {
  // Deterministic color per match id so it stays stable across re-renders
  // without needing the server to assign/persist a color.
  let hash = 0;
  for (let i = 0; i < matchId.length; i++) hash = (hash * 31 + matchId.charCodeAt(i)) >>> 0;
  return MATCH_COLORS[hash % MATCH_COLORS.length];
}

export default function OpenMatches({ matches, byId, onOpen }) {
  return (
    <div style={{ margin: '16px 28px 0', padding: '14px 18px', background: 'oklch(0.98 0.005 90)', border: '1px solid oklch(0.9 0.01 90)', borderRadius: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Offene Matches</div>
      {matches.length === 0 ? (
        <div style={{ fontSize: 12.5, color: 'oklch(0.55 0.02 90)' }}>Keine offenen Matches.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {matches.map((m) => (
            <button
              key={m.id}
              onClick={() => onOpen(m)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'white', border: '1px solid oklch(0.9 0.01 90)', borderRadius: 9, cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: colorForMatch(m.id), flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'oklch(0.25 0.02 90)' }}>
                <strong>{byId[m.challengerId]?.name}</strong> vs. <strong>{byId[m.defenderId]?.name}</strong>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
