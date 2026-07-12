export const environment = {
  production: false,
  /**
   * URL base dell'API vuoto = chiamate relative alla stessa origine del frontend
   * (es. /api/clienti). In sviluppo il dev server Angular fa da proxy verso il
   * backend .NET (vedi proxy.conf.json), così funziona con localhost, IP di rete
   * e tunnel VS Code inoltrando una sola porta (4200).
   */
  apiBaseUrl: '',
};
