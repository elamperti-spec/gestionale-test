/** Porta su cui gira il backend .NET. */
const API_PORT = 5003;

/**
 * URL base dell'API calcolato a runtime dall'host del browser.
 * Così il frontend funziona sia via localhost / tunnel VS Code sia via IP di rete
 * (server in bind su 0.0.0.0) senza dover ricompilare.
 */
function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

export const environment = {
  production: false,
  apiBaseUrl: resolveApiBaseUrl(),
};
