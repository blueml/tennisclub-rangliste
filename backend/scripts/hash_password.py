"""Generate a bcrypt hash for admins.json or for seeding a player's initial password.

Usage:
    python scripts/hash_password.py "MeinKennwort123"
"""
import sys

import bcrypt

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/hash_password.py <password>")
        sys.exit(1)
    print(bcrypt.hashpw(sys.argv[1].encode("utf-8"), bcrypt.gensalt()).decode("utf-8"))
