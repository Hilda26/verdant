export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function isPledgeId(value: string): boolean {
  return /^[A-Za-z0-9_-]{3,80}$/.test(value);
}
