# CLAUDE.md — Istruzioni operative per lo sviluppo di SerialDash

Questo file guida l'assistente AI (Claude Code) nel lavoro su questo repository.
La specifica completa è in `SPEC.md`: **leggila prima di qualsiasi attività** e trattala come fonte di verità.

## Come lavorare

1. **Una milestone alla volta** (SPEC §11). Prima di iniziare, riassumi in un breve piano quali requisiti (per ID) implementerai e in che ordine, e attendi conferma.
2. **Passi piccoli e verificabili**: dopo ogni blocco di lavoro esegui lint, test e build. Non accumulare modifiche non testate.
3. **Cita gli ID dei requisiti** (es. `PRT-31`, `APP-CON-05`) nei messaggi di commit, nei test (`describe('PRT-31 …')`) e nei commenti dove una scelta non è ovvia.
4. **Se la specifica è ambigua o contraddittoria, fermati e chiedi.** Non inventare comportamenti del protocollo. Per dettagli minori di UI puoi decidere, spiegando la scelta nel riepilogo.
5. **Rispetta la Definition of Done** (SPEC §9.5) prima di dichiarare completata una funzionalità, documentazione inclusa.
6. A fine milestone: riepilogo di cosa è stato fatto, requisiti coperti, eventuali scostamenti dalla specifica e proposte di modifica a `SPEC.md` (non modificarla senza approvazione).

## Regole fondamentali

- **Protocollo**: lo JSON Schema in `/protocol/schema` è la fonte di verità (SPEC §7). Ordine obbligatorio per qualsiasi modifica: SPEC §3 → schema → test vector → `npm run gen` → codice → changelog del protocollo.
- **Mai modificare a mano** i file sotto `app/src/protocol/generated/` né le sezioni `<!-- generated -->` della documentazione: rigenerale.
- **Dati dal dispositivo = non fidati**: niente `innerHTML`/`dangerouslySetInnerHTML` con contenuti ricevuti, colori validati (APP-NFR-06).
- **Nessuna nuova dipendenza** runtime oltre a SPEC §2.2 senza motivarla e chiedere.
- **Libreria Arduino**: niente `String`, `malloc`, `new`, `delay()`; overload `F()` per ogni stringa costante; C++11; nessuna dipendenza esterna (SPEC §6.1). Controlla sempre l'impatto su Arduino Uno.
- **Transport astratto**: il codice sopra `transport/` non deve sapere se sta parlando con una porta reale, il simulatore o un replay.
- **i18n**: nessuna stringa visibile all'utente scritta direttamente nei componenti; aggiungi sempre sia `it` sia `en`.

## Convenzioni

- Codice, identificatori, commenti nel codice e messaggi di commit: **inglese**.
- Documentazione utente: secondo la decisione D2 (SPEC §10).
- Commit: Conventional Commits (`feat(app): …`, `fix(lib): …`, `docs: …`, `test(protocol): …`).
- TypeScript `strict`, niente `any` esplicito. TSDoc sulle API esportate (DOC-40).
- C++: clang-format del repository, commenti Doxygen su ogni simbolo pubblico (DOC-10).

## Comandi (da creare in M0 e mantenere aggiornati qui)

| Comando                                | Effetto                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `npm install`                          | Installa le dipendenze del monorepo                                                    |
| `npm run gen`                          | Genera tipi TS e documentazione dallo schema                                           |
| `npm run dev`                          | Avvia la webapp in sviluppo                                                            |
| `npm run lint`                         | Lint di app, tools e docs                                                              |
| `npm test`                             | Unit test dell'app                                                                     |
| `npm run test:coverage -w app`         | Unit test con soglia all'85% di copertura righe su `protocol`/`session`/`data` (QA-02) |
| `npm run e2e`                          | Test end-to-end con il simulatore                                                      |
| `npm run docs:dev`                     | Sito di documentazione in locale (porta 5174, proxata da `/docs/` nella webapp)        |
| `pio test -e native -d lib/SerialDash` | Test nativi della libreria                                                             |
| `npm run lib:compile`                  | Compila tutti gli esempi per tutte le schede (richiede arduino-cli)                    |

## Testare senza hardware

Usa sempre `SimulatorTransport` (SPEC §5.7) per sviluppo e test automatici. Il test con schede reali è manuale e documentato in `docs/contributing/testing.md`: quando una funzionalità richiede verifica su hardware, dillo esplicitamente nel riepilogo invece di dichiararla verificata.
