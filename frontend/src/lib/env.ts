function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  apiBaseUrl: requireEnv("VITE_API_BASE_URL"),
  googleClientId: requireEnv("VITE_GOOGLE_CLIENT_ID"),
} as const;
