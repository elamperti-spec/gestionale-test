export interface Cliente {
  id: number;
  nome: string;
  cognome: string;
  codiceFiscale: string;
  partitaIva?: string | null;
  pec?: string | null;
  codiceSdi?: string | null;
  email?: string | null;
  telefono?: string | null;
  societa?: string | null;
  note?: string | null;
}

/** Dati inviati alla creazione/aggiornamento (senza id). */
export type ClienteInput = Omit<Cliente, 'id'>;
