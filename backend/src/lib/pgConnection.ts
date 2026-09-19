/**
 * node-postgres settings for a DATABASE_URL — shared by the API and the seed
 * script (which deliberately doesn't load the API's environment validation).
 *
 * TLS: node-postgres reads `sslmode=require` in a URL as "verify the
 * certificate against the system's CAs", which fails for Supabase (its CA
 * isn't one of them). So the URL's sslmode is taken out and applied here with
 * its usual meaning — encrypt — plus certificate verification whenever the
 * CA certificate is provided. Local databases without sslmode are unchanged.
 */
export function pgConnection(databaseUrl: string, caCert?: string) {
  const url = new URL(databaseUrl);
  const sslmode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslmode");
  // Settings screens sometimes turn a pasted certificate's line breaks into "\n".
  const ca = caCert?.trim().replace(/\\n/g, "\n");

  if (ca) return { connectionString: url.toString(), ssl: { ca } };
  if (sslmode && sslmode !== "disable") {
    return { connectionString: url.toString(), ssl: { rejectUnauthorized: false } };
  }
  return { connectionString: databaseUrl };
}
