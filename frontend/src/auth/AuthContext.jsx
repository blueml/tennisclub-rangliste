import React, { createContext, useCallback, useContext, useState } from 'react';
import { api } from '../api.js';

// The backend's session cookie is httpOnly — the frontend can't read its
// contents directly. We keep a small mirror of "who is logged in" in memory,
// populated by the login calls' response bodies, and cleared on logout or on
// a 401 from any API call (see RankingPage's error handling).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { role: 'player'|'admin', id?, name?, username?, mustChangePassword? }

  const loginAsPlayer = useCallback(async (email, password) => {
    const player = await api.playerLogin(email, password);
    setSession({ role: 'player', id: player.id, name: player.name, mustChangePassword: player.mustChangePassword });
    return player;
  }, []);

  const loginAsAdmin = useCallback(async (username, password) => {
    const admin = await api.adminLogin(username, password);
    setSession({ role: 'admin', username: admin.username });
    return admin;
  }, []);

  const markPasswordChanged = useCallback(() => {
    setSession((s) => (s ? { ...s, mustChangePassword: false } : s));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setSession(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ session, loginAsPlayer, loginAsAdmin, markPasswordChanged, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
