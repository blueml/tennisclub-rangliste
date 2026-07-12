// Thin fetch wrapper for the FastAPI backend. `credentials: 'include'` sends
// the httpOnly session cookie set by /api/auth/*-login on every request.
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let detail = `Fehler ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response had no JSON body
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  playerLogin: (email, password) =>
    request('/auth/player-login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  adminLogin: (username, password) =>
    request('/auth/admin-login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  changePassword: (newPassword) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ newPassword }) }),

  getRanking: () => request('/ranking'),

  createMatch: (defenderId) =>
    request('/matches', { method: 'POST', body: JSON.stringify({ defenderId }) }),
  confirmResult: (matchId, winnerId) =>
    request(`/matches/${matchId}/confirm`, { method: 'POST', body: JSON.stringify({ winnerId }) }),

  createPlayer: (name, email, initialPassword) =>
    request('/admin/players', { method: 'POST', body: JSON.stringify({ name, email, initialPassword }) }),
  deletePlayer: (playerId) => request(`/admin/players/${playerId}`, { method: 'DELETE' }),
  adminResolveMatch: (matchId, winnerId) =>
    request(`/admin/matches/${matchId}/resolve`, { method: 'POST', body: JSON.stringify({ winnerId }) }),
  adminCancelMatch: (matchId) => request(`/admin/matches/${matchId}/cancel`, { method: 'POST' }),
};
