import React from 'react';
import { Overlay, primaryBtn, secondaryBtn } from './ChallengeModal.jsx';

// Shown when a player clicks one of the two people already in an open match.
// Role-gated exactly like the backend enforces: only the two participants can
// confirm a result, only an admin can force-resolve or cancel at any time.
export default function MatchActionModal({
  match,
  challengerName,
  defenderName,
  isAdmin,
  isParticipant,
  selfId,
  otherName,
  onClose,
  onConfirmSelfWin,
  onConfirmOtherWin,
  onAdminResolve,
  onAdminCancel,
  error,
}) {
  const cConf = match.confirmations?.[match.challengerId];
  const dConf = match.confirmations?.[match.defenderId];
  const mismatch = cConf && dConf && cConf !== dConf;

  return (
    <Overlay>
      <div style={{ fontSize: 16, fontWeight: 800 }}>Offenes Match</div>
      <div style={{ fontSize: 13.5, color: 'oklch(0.35 0.02 90)' }}>
        {challengerName} vs. {defenderName}
      </div>

      {error && <div style={{ fontSize: 12.5, color: 'oklch(0.55 0.16 25)', fontWeight: 600 }}>{error}</div>}

      {mismatch && (
        <div style={{ padding: '10px 12px', background: 'oklch(0.96 0.05 40)', border: '1px solid oklch(0.65 0.13 40 / 0.4)', borderRadius: 9, fontSize: 12.5, color: 'oklch(0.4 0.1 40)', fontWeight: 600 }}>
          Widerspruch: beide Meldungen stimmen nicht überein. Ein Admin muss entscheiden.
        </div>
      )}

      {isParticipant && (
        <>
          <div style={{ fontSize: 13, color: 'oklch(0.35 0.02 90)' }}>Wer hat gewonnen?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={onConfirmSelfWin} style={winBtn}>Ich habe gewonnen</button>
            <button onClick={onConfirmOtherWin} style={loseBtn}>{otherName} hat gewonnen</button>
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'oklch(0.45 0.02 90)', padding: '10px 12px', background: 'oklch(0.98 0.005 90)', borderRadius: 9 }}>
            <div>{challengerName}: {reportText(match, match.challengerId, challengerName, defenderName)}</div>
            <div>{defenderName}: {reportText(match, match.defenderId, challengerName, defenderName)}</div>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin-Entscheidung</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => onAdminResolve(match.challengerId)} style={winBtn}>{challengerName} gewinnt (setzen)</button>
            <button onClick={() => onAdminResolve(match.defenderId)} style={loseBtn}>{defenderName} gewinnt (setzen)</button>
          </div>
          <button onClick={onAdminCancel} style={{ padding: 10, border: 'none', background: 'none', color: 'oklch(0.55 0.16 25)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
            Match abbrechen
          </button>
        </>
      )}

      <button onClick={onClose} style={{ padding: 8, border: 'none', background: 'none', color: 'oklch(0.55 0.02 90)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
        Schließen
      </button>
    </Overlay>
  );
}

function reportText(match, playerId, challengerName, defenderName) {
  const conf = match.confirmations?.[playerId];
  if (!conf) return 'Noch keine Meldung';
  return conf === match.challengerId ? `${challengerName} gewinnt` : `${defenderName} gewinnt`;
}

const winBtn = { padding: 12, border: '1.5px solid oklch(0.78 0.16 115 / 0.6)', background: 'oklch(0.97 0.03 115)', borderRadius: 10, fontWeight: 700, textAlign: 'left', cursor: 'pointer' };
const loseBtn = { padding: 12, border: '1.5px solid oklch(0.9 0.01 90)', background: 'none', borderRadius: 10, fontWeight: 700, textAlign: 'left', cursor: 'pointer' };
