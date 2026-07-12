import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AdminPanel from '../components/AdminPanel.jsx';
import ChallengeModal from '../components/ChallengeModal.jsx';
import MatchActionModal from '../components/MatchActionModal.jsx';
import OpenMatches, { colorForMatch } from '../components/OpenMatches.jsx';
import RankingTree from '../components/RankingTree.jsx';
import { getTargets } from '../lib/ranking.js';

export default function RankingPage() {
  const { session, logout } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [openMatches, setOpenMatches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [pendingChallenge, setPendingChallenge] = useState(null); // { defenderId }
  const [activeMatch, setActiveMatch] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getRanking();
      setRanking(data.ranking);
      setOpenMatches(data.openMatches);
    } catch (err) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('nicht angemeldet')) {
        logout();
      }
    }
  }, [logout]);

  useEffect(() => {
    load();
  }, [load]);

  const byId = useMemo(() => Object.fromEntries(ranking.map((p) => [p.id, p])), [ranking]);
  const lockMap = useMemo(() => {
    const m = new Map();
    for (const match of openMatches) {
      m.set(match.challengerId, match.id);
      m.set(match.defenderId, match.id);
    }
    return m;
  }, [openMatches]);

  const isPlayer = session.role === 'player';
  const selfLocked = isPlayer && lockMap.has(session.id);

  const targetIds = useMemo(() => {
    if (!isPlayer || selectedId !== session.id || selfLocked) return new Set();
    const idx = ranking.findIndex((p) => p.id === session.id);
    if (idx === -1) return new Set();
    const { leftIdx, aboveIdx } = getTargets(ranking.length, idx);
    return new Set([...leftIdx, ...aboveIdx].map((i) => ranking[i].id).filter((id) => !lockMap.has(id)));
  }, [isPlayer, selectedId, selfLocked, ranking, session, lockMap]);

  function handleSelect(entry) {
    const lockedMatchId = lockMap.get(entry.id);
    if (lockedMatchId) {
      setActiveMatch(openMatches.find((m) => m.id === lockedMatchId));
      return;
    }
    if (!isPlayer) return;
    if (entry.id === session.id) {
      setSelectedId((cur) => (cur === entry.id ? null : entry.id));
    } else if (targetIds.has(entry.id)) {
      setPendingChallenge({ defenderId: entry.id });
    }
  }

  async function confirmNewMatch() {
    setError(null);
    try {
      await api.createMatch(pendingChallenge.defenderId);
      setPendingChallenge(null);
      setSelectedId(null);
      setToast('Neues offenes Match eröffnet.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmResult(winnerId) {
    setError(null);
    try {
      const res = await api.confirmResult(activeMatch.id, winnerId);
      setActiveMatch(null);
      setToast(res.status === 'resolved' ? 'Match abgeschlossen.' : 'Bestätigung gespeichert — warte auf die andere Person.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function adminResolve(winnerId) {
    setError(null);
    try {
      await api.adminResolveMatch(activeMatch.id, winnerId);
      setActiveMatch(null);
      setToast('Match vom Admin entschieden.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function adminCancel() {
    setError(null);
    try {
      await api.adminCancelMatch(activeMatch.id);
      setActiveMatch(null);
      setToast('Match abgebrochen.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addPlayer(name, email, initialPassword) {
    await api.createPlayer(name, email, initialPassword);
    setToast(`${name} wurde angelegt.`);
    await load();
  }

  async function removePlayer(playerId) {
    try {
      await api.deletePlayer(playerId);
      setToast('Spieler:in wurde entfernt.');
      await load();
    } catch (err) {
      setToast(err.message);
    }
  }

  async function updateEmail(playerId, email) {
    await api.updatePlayerEmail(playerId, email);
    setToast('E-Mail wurde aktualisiert.');
    await load();
  }

  async function resetPassword(playerId, newPassword) {
    await api.resetPlayerPassword(playerId, newPassword);
    setToast('Kennwort wurde zurückgesetzt — Spieler:in muss es bei nächster Anmeldung ändern.');
    await load();
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', background: 'white', minHeight: '100vh', boxShadow: '0 0 0 1px oklch(0.9 0.01 90)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid oklch(0.9 0.01 90)' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'oklch(0.55 0.13 155)' }}>TC Waldpark e.V.</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Rangliste</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'oklch(0.4 0.02 90)' }}>
            {isPlayer ? <>Angemeldet als <strong>{session.name}</strong></> : <>Angemeldet als <strong>Admin</strong></>}
          </div>
          <button onClick={logout} style={{ padding: '8px 14px', background: 'none', border: '1.5px solid oklch(0.88 0.01 90)', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: 'oklch(0.35 0.02 90)', cursor: 'pointer' }}>
            Abmelden
          </button>
        </div>
      </div>

      {toast && (
        <div style={{ margin: '16px 28px 0', padding: '10px 16px', background: 'oklch(0.94 0.05 155)', border: '1px solid oklch(0.7 0.1 155 / 0.35)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'oklch(0.3 0.08 155)' }}>
          <span>{toast}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'oklch(0.4 0.06 155)' }}>×</button>
        </div>
      )}

      <OpenMatches matches={openMatches} byId={byId} onOpen={setActiveMatch} />

      {!isPlayer && (
        <AdminPanel
          ranking={ranking}
          lockedIds={new Set(lockMap.keys())}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onUpdateEmail={updateEmail}
          onResetPassword={resetPassword}
        />
      )}

      <RankingTree
        ranking={ranking}
        lockColorFor={(id) => (lockMap.has(id) ? colorForMatch(lockMap.get(id)) : null)}
        selectedId={selectedId}
        targetIds={targetIds}
        onSelect={handleSelect}
      />

      {pendingChallenge && (
        <ChallengeModal
          challengerName={session.name}
          defenderName={byId[pendingChallenge.defenderId]?.name}
          error={error}
          onClose={() => { setPendingChallenge(null); setError(null); }}
          onConfirm={confirmNewMatch}
        />
      )}

      {activeMatch && (
        <MatchActionModal
          match={activeMatch}
          challengerName={byId[activeMatch.challengerId]?.name}
          defenderName={byId[activeMatch.defenderId]?.name}
          isAdmin={!isPlayer}
          isParticipant={isPlayer && (session.id === activeMatch.challengerId || session.id === activeMatch.defenderId)}
          selfId={session.id}
          otherName={isPlayer ? byId[session.id === activeMatch.challengerId ? activeMatch.defenderId : activeMatch.challengerId]?.name : null}
          error={error}
          onClose={() => { setActiveMatch(null); setError(null); }}
          onConfirmSelfWin={() => confirmResult(session.id)}
          onConfirmOtherWin={() => confirmResult(session.id === activeMatch.challengerId ? activeMatch.defenderId : activeMatch.challengerId)}
          onAdminResolve={adminResolve}
          onAdminCancel={adminCancel}
        />
      )}
    </div>
  );
}
