import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Cliente, ClienteInput } from '../models/cliente';
import { ClienteService } from '../services/cliente.service';

function emptyForm(): ClienteInput {
  return { nome: '', cognome: '', email: '', telefono: '', societa: '', note: '' };
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

    this.saving.set(true);
    this.error.set(null);

    const id = this.editingId();
    const request$ =
      id === null ? this.service.create(payload) : this.service.update(id, payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.startCreate();
        this.load();
      },
      error: () => {
        this.error.set('Salvataggio non riuscito. Riprova.');
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
}
