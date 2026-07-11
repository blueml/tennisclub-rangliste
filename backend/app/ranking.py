"""Pure ranking-tree math, ported 1:1 from the frontend prototype so both
sides agree on layout and rotation. The pyramid's row/column for a given
0-based rank index is derived purely from its position — the `ranking`
list (an ordered list of player IDs) is the single source of truth; there
is no separately stored row/column per player.
"""
from typing import List, Tuple


def triangular(r: int) -> int:
    return r * (r + 1) // 2


def coords_for_index(i: int) -> Tuple[int, int]:
    r = int(((8 * i + 1) ** 0.5 - 1) // 2)
    while triangular(r + 1) <= i:
        r += 1
    while triangular(r) > i:
        r -= 1
    return r, i - triangular(r)


def get_targets(n: int, i: int) -> Tuple[List[int], List[int]]:
    """Returns (left_indices, above_indices): valid challenge targets for the
    player at rank index `i` — everyone to their left in the same row, and
    everyone one row up whose column is at or right of their own column."""
    r, c = coords_for_index(i)
    row_start = triangular(r)
    left = list(range(row_start, i))

    above: List[int] = []
    if r > 0:
        prev_start = triangular(r - 1)
        prev_end = row_start - 1
        start = max(prev_start + c, prev_start)
        end = min(prev_end, n - 1)
        if start <= end:
            above = list(range(start, end + 1))

    return left, above


def apply_challenge_win(ranking: List[str], challenger_idx: int, defender_idx: int) -> List[str]:
    """Challenger takes the defender's slot; the defender and everyone ranked
    between them each drop exactly one position (a single move, not a swap)."""
    ranking = list(ranking)
    challenger = ranking.pop(challenger_idx)
    ranking.insert(defender_idx, challenger)
    return ranking
