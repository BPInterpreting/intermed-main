type SessionClaims = {
  metadata?: { role?: string };
  publicMetadata?: { role?: string };
  public_metadata?: { role?: string };
} | null | undefined;

export const getRoleFromClaims = (claims: SessionClaims) => {
  return (
    claims?.metadata?.role ??
    claims?.publicMetadata?.role ??
    claims?.public_metadata?.role
  );
};
