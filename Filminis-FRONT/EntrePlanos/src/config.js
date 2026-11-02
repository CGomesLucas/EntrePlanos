export const config = Object.freeze({
  apiUrl: (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(
    /\/$/,
    "",
  ),
  requestTimeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS) || 15000,
  appName: "EntrePlanos",
  locale: "pt-BR",
  storagePrefix: "entreplanos",
});
