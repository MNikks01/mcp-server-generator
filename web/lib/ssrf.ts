// Basic SSRF guard for user-supplied spec URLs (MVP scope, SECURITY.md).
// Blocks non-http(s) and private/loopback/link-local hosts. Not full DNS-rebinding
// protection — sufficient for the MVP; harden later.

export function assertSafeSpecUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed.");
  }
  const host = url.hostname.toLowerCase();
  const blocked =
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) || // link-local incl. cloud metadata 169.254.169.254
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (blocked) throw new Error("That host is not allowed.");
  return url;
}
