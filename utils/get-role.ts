type SessionClaims = {
  metadata?: { role?: string };
  publicMetadata?: { role?: string };
} | null | undefined;

export const getRoleFromClaims = (claims: SessionClaims) => {
  return claims?.metadata?.role ?? claims?.publicMetadata?.role;
};
