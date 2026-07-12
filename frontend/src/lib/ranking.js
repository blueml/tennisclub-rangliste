// Pure ranking-tree math, kept identical to the backend's app/ranking.py and
// the original prototype so all three agree on layout and valid targets.

export function triangular(r) {
  return (r * (r + 1)) / 2;
}

export function coordsForIndex(i) {
  let r = Math.floor((Math.sqrt(8 * i + 1) - 1) / 2);
  while (triangular(r + 1) <= i) r++;
  while (triangular(r) > i) r--;
  return { row: r, col: i - triangular(r) };
}

export function getTargets(n, i) {
  const { row: r, col: c } = coordsForIndex(i);
  const rowStart = triangular(r);
  const leftIdx = [];
  for (let j = rowStart; j < i; j++) leftIdx.push(j);

  const aboveIdx = [];
  if (r > 0) {
    const prevStart = triangular(r - 1);
    const prevEnd = rowStart - 1;
    const from = prevStart + c;
    for (let j = Math.max(from, prevStart); j <= Math.min(prevEnd, n - 1); j++) aboveIdx.push(j);
  }
  return { leftIdx, aboveIdx };
}

export function rowsFromRanking(ranking) {
  const n = ranking.length;
  if (n === 0) return [];
  const rowCount = coordsForIndex(n - 1).row + 1;
  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    const start = triangular(r);
    const end = Math.min(triangular(r + 1), n);
    rows.push({ r, label: `Runde ${r + 1}`, entries: ranking.slice(start, end).map((entry, k) => ({ ...entry, idx: start + k })) });
  }
  padLastRow(rows);
  return rows;
}

// The pyramid is built row-by-row from a flat, ordered ranking list, so only
// the LAST row can ever be short of its full width (r+1 slots) — every row
// above it is always full because the next row starts exactly where it ends.
// Pad that final row with placeholder entries so the triangle shape reads as
// complete even while the club still has open spots to fill.
function padLastRow(rows) {
  if (rows.length === 0) return rows;
  const last = rows[rows.length - 1];
  const expected = last.r + 1;
  const missing = expected - last.entries.length;
  for (let k = 0; k < missing; k++) {
    last.entries.push({ id: `__placeholder_${last.r}_${k}`, name: 'frei', rank: null, isPlaceholder: true, idx: null });
  }
  return rows;
}
