import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Cliente, ClienteInput } from '../models/cliente';
import { ClienteService } from '../services/cliente.service';

function emptyForm(): ClienteInput {
  return {
    nome: '',
    cognome: '',
    codiceFiscale: '',
    partitaIva: '',
    pec: '',
    codiceSdi: '',
    email: '',
    telefono: '',
    societa: '',
    note: '',
  };
}

@Component({
  selector: 'app-clienti',
  imports: [FormsModule],
  templateUrl: './clienti.html',
  styleUrl: './clienti.css',
})
export class Clienti implements OnInit {
  private readonly service = inject(ClienteService);

  readonly clienti = signal<Cliente[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);

  /** id del cliente in modifica; null = creazione di un nuovo cliente. */
  readonly editingId = signal<number | null>(null);
  readonly form = signal<ClienteInput>(emptyForm());

  readonly isEditing = computed(() => this.editingId() !== null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getAll().subscribe({
      next: (data) => {
        this.clienti.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare i clienti. Verifica che il backend sia in esecuzione.');
        this.loading.set(false);
      },
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.form.set(emptyForm());
    this.error.set(null);
  }

  startEdit(cliente: Cliente): void {
    this.editingId.set(cliente.id);
    this.form.set({
      nome: cliente.nome,
      cognome: cliente.cognome,
      codiceFiscale: cliente.codiceFiscale ?? '',
      partitaIva: cliente.partitaIva ?? '',
      pec: cliente.pec ?? '',
      codiceSdi: cliente.codiceSdi ?? '',
      email: cliente.email ?? '',
      telefono: cliente.telefono ?? '',
      societa: cliente.societa ?? '',
      note: cliente.note ?? '',
    });
    this.error.set(null);
  }

  cancel(): void {
    this.startCreate();
  }

  save(): void {
    const payload = this.form();
    if (!payload.nome.trim() || !payload.cognome.trim()) {
      this.error.set('Nome e Cognome sono obbligatori.');
      return;
    }

    const cf = (payload.codiceFiscale ?? '').trim();
    if (!cf) {
      this.error.set('Il codice fiscale è obbligatorio.');
      return;
    }

    const id = this.editingId();

    // Controllo anti-duplicato lato client (feedback immediato). Il backend
    // resta la fonte autorevole e blocca comunque i duplicati (409).
    const duplicato = this.clienti().some(
      (c) => c.id !== id && (c.codiceFiscale ?? '').trim().toUpperCase() === cf.toUpperCase(),
    );
    if (duplicato) {
      this.error.set(`Esiste già un cliente con il codice fiscale ${cf.toUpperCase()}.`);
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const request$ =
      id === null ? this.service.create(payload) : this.service.update(id, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.startCreate();
        this.load();
      },
      error: (err: unknown) => {
        this.error.set(this.extractError(err, 'Salvataggio non riuscito. Riprova.'));
        this.saving.set(false);
      },
    });
  }

  remove(cliente: Cliente): void {
    if (!confirm(`Eliminare il cliente "${cliente.nome} ${cliente.cognome}"?`)) {
      return;
    }
    this.error.set(null);
    this.service.delete(cliente.id).subscribe({
      next: () => {
        if (this.editingId() === cliente.id) {
          this.startCreate();
        }
        this.load();
      },
      error: () => this.error.set('Eliminazione non riuscita. Riprova.'),
    });
  }

  /** Estrae il messaggio d'errore restituito dal backend (es. codice fiscale duplicato). */
  private extractError(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse && err.error && typeof err.error === 'object') {
      const message = (err.error as { message?: string }).message;
      if (message) {
        return message;
      }
    }
    return fallback;
  }
}
