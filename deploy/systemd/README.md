# Avvio automatico al boot (systemd user services)

Questi due unit file fanno partire backend e frontend del gestionale
automaticamente all'avvio del server, **senza sudo**, tramite l'istanza
systemd dell'utente.

- `gestionale-backend.service` → API .NET su porta **5003** (bind `0.0.0.0`)
- `gestionale-frontend.service` → Angular `ng serve` su porta **4200** (bind `0.0.0.0`)

> **Nota sui percorsi:** gli unit usano percorsi assoluti che presuppongono il
> progetto in `/home/adminai/progetti-ai/gestionale-test` e l'utente `adminai`.
> Se cambi utente o cartella, aggiorna `WorkingDirectory` ed `ExecStart`.

## Installazione

```bash
# 1. Pubblica il backend (usato dal servizio backend)
cd ~/progetti-ai/gestionale-test/backend/GestionaleApi
dotnet publish -c Release -o ./publish

# 2. Copia gli unit file nella cartella systemd dell'utente
mkdir -p ~/.config/systemd/user
cp ~/progetti-ai/gestionale-test/deploy/systemd/gestionale-*.service ~/.config/systemd/user/

# 3. (una tantum) abilita il linger, così i servizi partono al boot
#    anche senza login dell'utente
loginctl enable-linger "$USER"

# 4. Ricarica, abilita all'avvio e avvia subito
systemctl --user daemon-reload
systemctl --user enable --now gestionale-backend.service gestionale-frontend.service
```

## Gestione

```bash
# stato
systemctl --user status gestionale-backend gestionale-frontend

# log in tempo reale
journalctl --user -u gestionale-backend -f
journalctl --user -u gestionale-frontend -f

# restart / stop
systemctl --user restart gestionale-backend gestionale-frontend
systemctl --user stop gestionale-frontend

# disattivare l'avvio al boot
systemctl --user disable gestionale-backend gestionale-frontend
```

## URL

- Frontend: http://<host>:4200/
- Swagger:  http://<host>:5003/swagger/index.html

## Accesso via tunnel VS Code / port forwarding

Il dev server Angular è configurato (in `angular.json`) con:

- `allowedHosts: true` → accetta anche host non-locali (es. `*.devtunnels.ms`),
  altrimenti risponderebbe **403**;
- `proxyConfig: proxy.conf.json` → le richieste a `/api` e `/swagger` sulla
  porta 4200 vengono inoltrate al backend (5003).

Il frontend usa quindi URL relativi (`apiBaseUrl` vuoto in `environment.ts`) e
tutto passa dalla porta 4200. **Per usare l'app via tunnel basta inoltrare la
sola porta 4200** (la 5003 serve solo per accedere a Swagger diretto).
