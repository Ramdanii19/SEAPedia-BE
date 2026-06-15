// In-memory JTI blacklist. Tokens auto-evict once their exp passes (no memory leak).
// For multi-instance or persistent invalidation, replace Map with Redis SETEX.
const blacklist = new Map(); // jti → expiresAt (ms)

export function blacklistToken(jti, expiresAt) {
  blacklist.set(jti, expiresAt);
}

export function isBlacklisted(jti) {
  if (!blacklist.has(jti)) return false;
  if (Date.now() > blacklist.get(jti)) {
    blacklist.delete(jti);
    return false;
  }
  return true;
}
