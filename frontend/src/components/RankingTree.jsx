import React from 'react';
import { rowsFromRanking } from '../lib/ranking.js';

export default function RankingTree({ ranking, lockColorFor, selectedId, targetIds, onSelect }) {
  const rows = rowsFromRanking(ranking);

  return (
    <div style={{ padding: '28px 28px 40px', display: 'flex', flexDirection: 'column', alignItems: 'safe center', gap: 16, overflowX: 'auto' }}>
      {rows.map((row) => (
        <div key={row.r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'oklch(0.62 0.02 90)' }}>
            {row.label}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'nowrap', justifyContent: 'safe center' }}>
            {row.entries.map((entry) => {
              if (entry.isPlaceholder) {
                return (
                  <div key={entry.id} style={{ ...placeholderStyle, flexShrink: 0 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'oklch(0.65 0.01 90)' }}>{entry.name}</span>
                  </div>
                );
              }
              const isSelected = selectedId === entry.id;
              const isTarget = targetIds?.has(entry.id);
              const lockColor = lockColorFor?.(entry.id);
              const style = { ...cardStyle(isSelected, isTarget, lockColor), flexShrink: 0 };
              return (
                <button key={entry.id} onClick={() => onSelect(entry)} style={style}>
                  <span style={{ fontSize: 11, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'oklch(0.55 0.02 90)' }}>
                    #{entry.rank}
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'oklch(0.22 0.02 90)' }}>{entry.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function cardStyle(isSelected, isTarget, lockColor) {
  const base = {
    padding: '10px 16px',
    borderRadius: 14,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    minWidth: 112,
    transition: 'all .15s',
  };
  if (lockColor) {
    return { ...base, background: `color-mix(in oklch, ${lockColor} 16%, white)`, border: `1.5px solid ${lockColor}`, boxShadow: `0 0 0 2px color-mix(in oklch, ${lockColor} 25%, transparent)` };
  }
  if (isSelected) {
    return { ...base, background: 'oklch(0.96 0.03 155)', border: '1.5px solid oklch(0.55 0.13 155)', boxShadow: '0 0 0 3px oklch(0.55 0.13 155 / 0.15)' };
  }
  if (isTarget) {
    return { ...base, background: 'oklch(0.98 0.03 115)', border: '1.5px dashed oklch(0.78 0.16 115)' };
  }
  return { ...base, background: 'white', border: '1.5px solid oklch(0.9 0.01 90)' };
}

const placeholderStyle = {
  padding: '10px 16px',
  borderRadius: 14,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  minWidth: 112,
  background: 'oklch(0.98 0.004 90)',
  border: '1.5px dashed oklch(0.9 0.01 90)',
};
