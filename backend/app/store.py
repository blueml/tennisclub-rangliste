import asyncio
import json
import os
from pathlib import Path
from typing import Callable, Tuple, TypeVar

T = TypeVar("T")


class JsonStore:
    """A single JSON file treated as an atomic, serialized mini-database.

    - All reads/writes for this file go through one asyncio.Lock, so two
      concurrent requests can never interleave a read-modify-write cycle.
      This is sufficient because the app runs as a single Uvicorn worker
      on a single node (see README) — it is NOT safe across multiple
      processes or containers.
    - Writes are atomic: the new content is written to a temp file first,
      then moved into place with os.replace(), which is an atomic rename
      on POSIX filesystems. A crash mid-write can never leave a corrupt
      or half-written JSON file behind.
    """

    def __init__(self, path: Path, default_factory: Callable[[], dict]):
        self.path = Path(path)
        self._lock = asyncio.Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self._write_sync(default_factory())

    def _read_sync(self) -> dict:
        with open(self.path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write_sync(self, data: dict) -> None:
        tmp_path = self.path.with_name(self.path.name + ".tmp")
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(tmp_path, self.path)

    async def read(self) -> dict:
        async with self._lock:
            return self._read_sync()

    async def mutate(self, fn: Callable[[dict], Tuple[dict, T]]) -> T:
        """Read, let `fn` compute (new_data, return_value), persist new_data,
        and hand back return_value — all while holding the file's lock."""
        async with self._lock:
            data = self._read_sync()
            new_data, result = fn(data)
            self._write_sync(new_data)
            return result
