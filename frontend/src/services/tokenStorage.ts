let accessToken: string | null = null;
let sessionExpiredHandler: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function registerSessionExpiredHandler(handler: () => void): void {
  sessionExpiredHandler = handler;
}

export function triggerSessionExpired(): void {
  accessToken = null;
  sessionExpiredHandler?.();
}
