export interface Cliente {
  id: number;
  nome: string;
  cognome: string;
  email?: string | null;
  telefono?: string | null;
  societa?: string | null;
  note?: string | null;
}

/** Dati inviati alla creazione/aggiornamento (senza id). */
export type ClienteInput = Omit<Cliente, 'id'>;
