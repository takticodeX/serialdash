# SerialDash — Specifiche di progetto

> Versione specifiche: 1.0 · Protocollo: v1 · Stato: bozza approvata per sviluppo
>
> "SerialDash" è un nome provvisorio: va rinominato in un solo punto (vedi §10, Decisioni aperte).

Questo documento è la fonte di verità per lo sviluppo. È pensato per essere letto da uno sviluppatore **o da un assistente AI (Claude Code in VS Code)**: ogni requisito ha un identificativo (es. `APP-CON-03`) da citare in commit, test e issue. Le parole **DEVE**, **DOVREBBE**, **PUÒ** hanno il significato di RFC 2119 (MUST, SHOULD, MAY).

---

## 1. Visione

SerialDash è una **webapp installabile (PWA)** che sostituisce e potenzia il Monitor Seriale dell'Arduino IDE:

1. si collega a qualsiasi dispositivo USB-seriale (Arduino, ESP32, ESP8266, RP2040, ecc.) **direttamente dal browser**, senza installare nulla;
2. mostra le righe di testo in una **console** come il monitor classico;
3. riconosce le righe del **protocollo SerialDash** (JSON) e le trasforma in una **dashboard** di widget: grafici in tempo reale, gauge, torte, heatmap, indicatori;
4. permette **controlli bidirezionali** (pulsanti, slider, interruttori…) dichiarati dal firmware, che inviano comandi alla scheda;
5. è accompagnata da una **libreria Arduino/ESP32** che rende l'uso del protocollo banale.

### 1.1 Principi guida

| #   | Principio                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | **Zero installazione**: basta un link. Funziona offline dopo la prima apertura.                                                       |
| P2  | **Retrocompatibile**: uno sketch che usa solo `Serial.println` funziona esattamente come nel monitor classico.                        |
| P3  | **Zero configurazione possibile**: un valore inviato senza dichiarazioni viene comunque visualizzato (auto-discovery).                |
| P4  | **Il dispositivo è la fonte di verità** sullo stato dei controlli. La UI non mostra mai uno stato non confermato come se fosse reale. |
| P5  | **Leggero sul microcontrollore**: la libreria funziona su Arduino Uno (2 KB RAM) senza allocazione dinamica.                          |
| P6  | **Privacy**: nessun dato lascia il computer. Nessuna telemetria, nessun backend.                                                      |
| P7  | **Una sola fonte di verità** per il protocollo: lo JSON Schema in `/protocol` genera tipi, validazione e documentazione.              |

### 1.2 Fuori ambito (v1)

Firefox e Safari (non supportano Web Serial), iOS, comunicazione via rete (WebSocket/MQTT), multi-dispositivo simultaneo, backend/cloud, account utente. Alcuni sono candidati per versioni future (§10).

---

## 2. Architettura

### 2.1 Struttura del repository (monorepo)

```
serialdash/
├── CLAUDE.md                 # istruzioni operative per l'assistente AI
├── SPEC.md                   # questo documento
├── protocol/
│   ├── schema/               # JSON Schema v1 (fonte di verità del protocollo)
│   │   ├── device-to-app.schema.json
│   │   ├── app-to-device.schema.json
│   │   └── widgets/*.schema.json   # un file per tipo di widget
│   └── test-vectors/         # casi di test condivisi (app + libreria), formato .jsonl
├── app/                      # webapp PWA (TypeScript)
├── lib/SerialDash/           # libreria Arduino (conforme Library Manager + PlatformIO)
├── docs/                     # sito di documentazione (VitePress)
├── tools/                    # script di generazione (tipi TS, tabelle doc, screenshot)
└── .github/workflows/        # CI/CD
```

### 2.2 Stack tecnologico della webapp

| Area                    | Scelta                           | Motivo                                          |
| ----------------------- | -------------------------------- | ----------------------------------------------- |
| Linguaggio              | TypeScript (strict)              | Manutenibilità, tipi generati dallo schema      |
| Build                   | Vite                             | Veloce, output statico, plugin PWA              |
| UI framework            | React 18 + Zustand (stato)       | Ecosistema ampio, familiare agli assistenti AI  |
| Grafici serie temporali | uPlot                            | Il più veloce per migliaia di punti al secondo  |
| Altri grafici           | Apache ECharts (import modulare) | Copre gauge, torta, heatmap, polare, istogramma |
| Layout dashboard        | react-grid-layout                | Drag & drop e ridimensionamento a griglia       |
| Persistenza             | IndexedDB (via `idb`)            | Profili, layout, registrazioni                  |
| PWA/offline             | vite-plugin-pwa (Workbox)        | Service worker e manifest                       |
| i18n                    | i18next                          | UI in italiano e inglese                        |
| Validazione runtime     | Ajv (schemi compilati in build)  | Validazione messaggi contro lo schema           |
| Test                    | Vitest (unit) + Playwright (e2e) | Standard, e2e con dispositivo simulato          |
| Hosting                 | GitHub Pages (HTTPS)             | Gratuito, statico. App su `/`, docs su `/docs/` |

Nuove dipendenze runtime oltre a queste **DEVONO** essere motivate nel commit. Il bundle iniziale **DOVREBBE** restare sotto 400 KB gzip (ECharts e i widget pesanti caricati in lazy loading).

### 2.3 Moduli della webapp

```
app/src/
├── serial/        # SerialTransport: Web Serial, lettura/scrittura, riconnessione
├── transport/     # interfaccia Transport + SimulatorTransport + ReplayTransport
├── protocol/      # LineSplitter, Parser, Encoder, Validator, tipi generati
├── session/       # DeviceSession: stato del dispositivo, handshake, comandi pendenti
├── data/          # ChannelStore: ring buffer per canale, statistiche
├── widgets/       # registry + un modulo per widget (display e controlli)
├── dashboard/     # griglia, gruppi/tab, editor widget, override utente
├── console/       # console virtualizzata, invio, cronologia
├── recording/     # registrazione e riproduzione sessioni
├── storage/       # IndexedDB: profili, layout, impostazioni
├── i18n/          # traduzioni it/en
└── ui/            # componenti comuni, tema chiaro/scuro
```

Flusso dati:

```
Transport ──bytes──▶ LineSplitter ──righe──▶ Parser ─┬─▶ Console (righe testo + errori)
    ▲                                                └─▶ DeviceSession ─▶ ChannelStore ─▶ Widgets (render a 30–60 fps)
    └──────────── Encoder ◀── comandi dai controlli ◀────────────────────────────────────┘
```

`Transport` è un'interfaccia astratta con tre implementazioni: `WebSerialTransport` (reale), `SimulatorTransport` (dispositivo virtuale in-browser) e `ReplayTransport` (riproduce una registrazione). Tutto ciò che sta sopra il transport **NON DEVE** sapere quale implementazione è in uso. Questo rende l'app testabile senza hardware.

---

## 3. Protocollo v1

La sezione è **normativa**. Lo JSON Schema in `/protocol/schema` DEVE rispecchiarla esattamente; in caso di conflitto si corregge prima questa sezione, poi lo schema.

### 3.1 Trasporto e framing

| ID     | Requisito                                                                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRT-01 | Codifica UTF-8. Ogni messaggio è **una riga** terminata da `\n` (LF). Il ricevitore DEVE accettare anche `\r\n` e ignorare `\r` finali.                                               |
| PRT-02 | Una riga di protocollo inizia con il carattere `@` seguito immediatamente da un **oggetto JSON** (`@{...}`). Nessuno spazio tra `@` e `{`.                                            |
| PRT-03 | Qualsiasi riga che non inizia con `@{` è **testo libero** e va nella console (app) o al callback testo (libreria).                                                                    |
| PRT-04 | Una riga che inizia con `@{` ma non è JSON valido o non rispetta lo schema NON DEVE essere scartata in silenzio: l'app la mostra in console come errore di protocollo, con il motivo. |
| PRT-05 | Ogni oggetto ha il campo obbligatorio `"t"` (tipo di messaggio, stringa). Tipi sconosciuti DEVONO essere ignorati senza errore (compatibilità futura) e registrati nel log di debug.  |
| PRT-06 | Campi sconosciuti in un messaggio noto DEVONO essere ignorati.                                                                                                                        |
| PRT-07 | Lunghezza massima riga dispositivo→app: l'app DEVE accettare almeno 16 384 byte. Righe più lunghe vengono troncate e segnalate come errore.                                           |
| PRT-08 | Lunghezza massima riga app→dispositivo: il dispositivo la dichiara con il campo `rx` in `hi` (§3.3). L'app NON DEVE mai inviare righe più lunghe; se non dichiarato, vale 64 byte.    |
| PRT-09 | I numeri sono JSON standard. `NaN` e `Infinity` non esistono in JSON: si inviano come `null` e l'app li tratta come "valore mancante" (buco nel grafico).                             |
| PRT-10 | Nelle stringhe, `"`, `\`, e i caratteri di controllo (incluso `\n`) DEVONO essere escapati secondo JSON.                                                                              |

### 3.2 Identificatori

| ID     | Requisito                                                                                                 |
| ------ | --------------------------------------------------------------------------------------------------------- |
| PRT-11 | Gli id di widget e canali rispettano la regex `^[A-Za-z_][A-Za-z0-9_.-]{0,15}$` (max 16 caratteri).       |
| PRT-12 | Widget e canali hanno **spazi di nomi separati**: un widget `temp` e un canale `temp` possono coesistere. |
| PRT-13 | Per i **controlli**, l'id del widget è anche l'id del canale del suo stato (vedi §3.6).                   |

### 3.3 Messaggi dispositivo → app

Riepilogo:

| `t`    | Nome          | Scopo                                                    |
| ------ | ------------- | -------------------------------------------------------- |
| `hi`   | Presentazione | Identità e capacità del dispositivo                      |
| `w`    | Widget        | Dichiara (o ridichiara) un widget                        |
| `u`    | Update        | Modifica parziale delle proprietà di un widget esistente |
| `x`    | Rimozione     | Rimuove un widget o tutti                                |
| `d`    | Dati          | Valori dei canali                                        |
| `e`    | Evento        | Log strutturato con livello                              |
| `ack`  | Conferma      | Esito di un comando dell'app                             |
| `pong` | Risposta ping | Misura latenza e vitalità                                |

#### `hi` — Presentazione

```json
@{"t":"hi","v":1,"name":"Serra","fw":"1.2.0","board":"ESP32","rx":256}
```

| Campo   | Tipo         | Obbl. | Descrizione                                                           |
| ------- | ------------ | ----- | --------------------------------------------------------------------- |
| `v`     | intero       | sì    | Versione del protocollo. v1 = `1`.                                    |
| `name`  | stringa ≤ 32 | sì    | Nome del dispositivo. Usato come chiave del profilo dashboard.        |
| `fw`    | stringa ≤ 16 | no    | Versione del firmware utente.                                         |
| `board` | stringa ≤ 16 | no    | Tipo di scheda (informativo).                                         |
| `rx`    | intero       | no    | Dimensione del buffer di ricezione in byte (vedi PRT-08). Default 64. |

Regole:

- **PRT-20** Il dispositivo DEVE inviare `hi` all'avvio e in risposta a ogni `hi` dell'app, seguito da tutte le dichiarazioni `w`. Lo stato corrente di ogni controllo DEVE essere comunicato con il campo `val` della dichiarazione oppure con un `d` subito dopo le dichiarazioni.
- **PRT-21** Se `v` è maggiore della versione supportata dall'app, l'app mostra un avviso ma prova comunque a interpretare i messaggi.
- **PRT-22** Alla ricezione di un `hi`, l'app considera la dichiarazione dei widget "in ricostruzione": i widget non ridichiarati entro 2 secondi vengono marcati come _orfani_ (grigi, non rimossi automaticamente, rimovibili dall'utente).

#### `w` — Dichiarazione widget

```json
@{"t":"w","id":"g1","k":"line","title":"Temperature","ch":["t1","t2"],"unit":"°C","min":0,"max":50}
```

Proprietà comuni a tutti i widget:

| Campo    | Tipo               | Obbl.   | Descrizione                                                                        |
| -------- | ------------------ | ------- | ---------------------------------------------------------------------------------- |
| `id`     | id                 | sì      | Identificatore unico del widget.                                                   |
| `k`      | stringa            | sì      | Tipo di widget (§4). Tipo sconosciuto → widget "non supportato" con i dati grezzi. |
| `title`  | stringa ≤ 48       | no      | Titolo. Default: l'id.                                                             |
| `ch`     | id o array di id   | dipende | Canali visualizzati. Per i controlli non si usa (vale PRT-13).                     |
| `grp`    | stringa ≤ 24       | no      | Gruppo/scheda (tab) in cui mostrare il widget. Default: "Principale".              |
| `ord`    | intero             | no      | Ordine di posizionamento iniziale nel gruppo.                                      |
| `size`   | `[w,h]`            | no      | Dimensione suggerita in celle della griglia (12 colonne).                          |
| `unit`   | stringa ≤ 8        | no      | Unità di misura.                                                                   |
| `dec`    | intero 0–6         | no      | Decimali mostrati.                                                                 |
| `labels` | array di stringhe  | no      | Etichette per i canali, nello stesso ordine di `ch`.                               |
| `colors` | array di `#RRGGBB` | no      | Colori per i canali.                                                               |

Le proprietà specifiche di ogni tipo sono nel catalogo (§4). Una nuova `w` con un id esistente **sostituisce** la dichiarazione precedente (gli override dell'utente restano, §5.5).

#### `u` — Update parziale

```json
@{"t":"u","id":"g1","max":100,"title":"Temperature (estate)"}
```

Unisce i campi indicati nella dichiarazione esistente (merge superficiale). `id`, `k` non sono modificabili. Serve per cambiare a runtime min/max, zone, opzioni di un menu, ecc. Se il widget non esiste, il messaggio è ignorato con un avviso di debug.

#### `x` — Rimozione

```json
@{"t":"x","id":"g1"}     rimuove un widget
@{"t":"x"}               rimuove tutti i widget dichiarati dal dispositivo
```

#### `d` — Dati

```json
@{"t":"d","d":{"t1":23.4,"t2":24.1}}
@{"t":"d","d":{"pos":[1.2,3.4]},"ts":123456}
```

| Campo | Tipo       | Obbl. | Descrizione                                               |
| ----- | ---------- | ----- | --------------------------------------------------------- |
| `d`   | oggetto    | sì    | Mappa `canale → valore`.                                  |
| `ts`  | intero ≥ 0 | no    | Timestamp del dispositivo in ms (tipicamente `millis()`). |

Forme ammesse per un valore:

| Forma                            | Esempio         | Usata da                                    |
| -------------------------------- | --------------- | ------------------------------------------- |
| numero                           | `23.4`          | line, gauge, value, level, hist, compass, … |
| booleano                         | `true`          | led, switch                                 |
| stringa                          | `"auto"`        | value, table, select, text, color           |
| `null`                           | `null`          | valore mancante                             |
| coppia                           | `[x, y]`        | xy, polar                                   |
| array di numeri                  | `[1,2,3,…]`     | heat, bar (spettro)                         |
| oggetto etichetta→numero/stringa | `{"A":3,"B":5}` | pie, bar, table                             |

Regole di tempo:

- **PRT-30** Senza `ts`, l'app usa l'istante di arrivo della riga.
- **PRT-31** Con `ts`, l'app calcola l'offset tra orologio del dispositivo e orologio locale al primo messaggio con `ts` e lo applica ai successivi. Un salto indietro di `ts` (reset o overflow di `millis()` dopo ~49 giorni) DEVE ricalcolare l'offset senza corrompere i grafici.
- **PRT-32** Un canale mai dichiarato in alcun widget attiva l'auto-discovery (§5.4).

#### `e` — Evento

```json
@{"t":"e","lvl":"warn","msg":"Umidità sopra soglia","src":"hum"}
```

| Campo | Tipo                        | Obbl. | Descrizione             |
| ----- | --------------------------- | ----- | ----------------------- |
| `lvl` | `debug`/`info`/`warn`/`err` | no    | Default `info`.         |
| `msg` | stringa                     | sì    | Testo dell'evento.      |
| `src` | stringa ≤ 16                | no    | Origine (per filtrare). |

Gli eventi appaiono in console (colorati per livello) e nei widget `log`. Gli eventi `err` generano anche una notifica non bloccante (toast).

#### `ack` — Conferma comando

```json
@{"t":"ack","r":17,"ok":true}
@{"t":"ack","r":18,"ok":false,"err":"Valore fuori range"}
```

| Campo | Tipo         | Obbl. | Descrizione                                  |
| ----- | ------------ | ----- | -------------------------------------------- |
| `r`   | intero       | sì    | Id della richiesta a cui si risponde (§3.4). |
| `ok`  | booleano     | sì    | Esito.                                       |
| `err` | stringa ≤ 48 | no    | Motivo in caso di rifiuto.                   |

#### `pong`

```json
@{"t":"pong","r":5}
```

### 3.4 Messaggi app → dispositivo

Anche in questa direzione il formato è `@` + JSON su una riga. Per poter essere interpretati da un microcontrollore con pochissima RAM, **i messaggi app→dispositivo DEVONO essere oggetti piatti** (nessun oggetto o array annidato) e rispettare l'ordine dei campi indicato. La libreria (§6) può così usare un parser minimale a streaming.

| `t`    | Formato                                | Scopo                                                     |
| ------ | -------------------------------------- | --------------------------------------------------------- |
| `hi`   | `@{"t":"hi","v":1}`                    | Chiede al dispositivo di presentarsi e ridichiarare tutto |
| `c`    | `@{"t":"c","r":17,"id":"pwm","v":128}` | Un controllo ha cambiato valore                           |
| `ping` | `@{"t":"ping","r":5}`                  | Verifica vitalità / latenza                               |

Regole:

- **PRT-40** Ordine dei campi: `t` sempre per primo, poi `r`, poi `id`, poi `v`. Il parser della libreria PUÒ fare affidamento su questo ordine.
- **PRT-41** `r` è un intero 1–65535, incrementale per sessione, che torna a 1 dopo 65535.
- **PRT-42** Tipi ammessi per `v` in `c`: numero, booleano, stringa. Il tipo dipende dal controllo (§4.3).
- **PRT-43** L'app DEVE rispettare `rx` (PRT-08): una stringa che farebbe superare il limite viene troncata **prima dell'invio** e l'utente viene avvisato; i campi `text` limitano la lunghezza di input di conseguenza.
- **PRT-44** L'app non invia mai righe di testo libero se non su esplicita azione dell'utente dalla console.

### 3.5 Handshake e ciclo di vita della connessione

1. L'utente seleziona la porta e si connette.
2. L'app attende i messaggi. Se entro 300 ms non ha ricevuto un `hi`, invia `@{"t":"hi","v":1}`; ripete dopo 1 s e 3 s (le schede ESP32 impiegano fino a ~2 s per il boot dopo il reset da DTR).
3. Se nessun `hi` arriva dopo il terzo tentativo, la sessione prosegue in **modalità testo**: console attiva, auto-discovery attiva per eventuali `d`, nessun avviso invasivo (P2).
4. Ogni `hi` successivo (reset della scheda) riavvia la ricostruzione (PRT-22) senza cancellare lo storico dei grafici; nel grafico viene disegnata una linea verticale "reset".
5. Durante una sessione attiva (dopo un `hi`), l'app invia `ping` ogni 2 s: serve all'app per misurare la latenza e al dispositivo per sapere che l'app è in ascolto (`appConnected()` nella libreria, §6.4). Tre `ping` senza `pong` → indicatore "dispositivo non risponde" nella barra di stato.
6. Alla disconnessione (volontaria o cavo staccato) i widget restano visibili con lo stato "disconnesso"; i controlli sono disabilitati.

### 3.6 Semantica dei controlli (bidirezionale)

Principio P4: **il dispositivo è la fonte di verità**.

1. Un controllo dichiarato con `w` considera `val` (se presente) come **stato confermato** dal dispositivo; da lì in poi mostra l'ultimo valore ricevuto sul canale con il suo stesso id (PRT-13). Senza `val` e senza `d`, il controllo mostra lo stato "sconosciuto" (es. interruttore in posizione intermedia).
2. Quando l'utente agisce, l'app invia `c` con un nuovo `r` e mette il controllo in stato **pendente** (indicatore visivo discreto, es. bordo tratteggiato animato). Il controllo mostra il valore scelto dall'utente.
3. Il dispositivo esegue e risponde con `ack`. Se `ok:true` e il dispositivo ha applicato il valore, DEVE anche inviare lo stato effettivo con `d` (la libreria lo fa automaticamente, §6.5).
4. Alla ricezione del `d` il controllo si allinea al valore reale (che può differire da quello chiesto, es. limitato). Alla ricezione di `ack` con `ok:false` il controllo torna all'ultimo valore confermato e mostra `err` in un tooltip/toast.
5. Timeout: se entro 1000 ms (configurabile) non arriva `ack`, il controllo torna all'ultimo valore confermato e mostra "Nessuna risposta dal dispositivo".
6. Il dispositivo PUÒ cambiare lo stato di un controllo in qualsiasi momento inviando `d` (es. un pulsante fisico accende il LED: l'interruttore nella UI si aggiorna da solo).
7. **Limitazione di frequenza**: controlli continui (slider, color) inviano al massimo 20 comandi/s durante il trascinamento e SEMPRE il valore finale al rilascio. Mentre un comando è pendente, i successivi dello stesso controllo si fondono (viene inviato solo l'ultimo appena arriva l'`ack` o scade il timeout).

### 3.7 Esempio di sessione completa

```
← Avvio completato                                   (testo → console)
← @{"t":"hi","v":1,"name":"Serra","fw":"1.2.0","rx":256}
← @{"t":"w","id":"temp","k":"line","title":"Temperatura","ch":["tin","tout"],"labels":["Interna","Esterna"],"unit":"°C","min":-10,"max":45}
← @{"t":"w","id":"hum","k":"gauge","ch":"h","unit":"%","min":0,"max":100,"zones":[[0,30,"#e67e22"],[30,70,"#2ecc71"],[70,100,"#3498db"]]}
← @{"t":"w","id":"fan","k":"switch","title":"Ventola","val":false}
← @{"t":"w","id":"pwm","k":"slider","title":"Potenza","min":0,"max":255,"step":1,"val":0}
← @{"t":"d","d":{"fan":false,"pwm":0}}
← @{"t":"d","d":{"tin":22.8,"tout":17.1,"h":58}}
→ @{"t":"c","r":1,"id":"fan","v":true}               (utente accende la ventola)
← @{"t":"ack","r":1,"ok":true}
← @{"t":"d","d":{"fan":true}}
← @{"t":"e","lvl":"warn","msg":"Umidità alta","src":"h"}
```

(← dal dispositivo, → dall'app)

---

## 4. Catalogo dei widget

Ogni widget è un modulo in `app/src/widgets/<kind>/` che esporta un **descrittore** registrato nel `WidgetRegistry`:

- `kind`, nome e descrizione localizzati, icona;
- lo JSON Schema delle sue proprietà (da `/protocol/schema/widgets/<kind>.schema.json`);
- le forme di valore accettate (§3.3);
- il componente di rendering e il pannello di configurazione;
- un **esempio dimostrativo** (dichiarazione + generatore di dati) usato dal simulatore, dalla documentazione e dai test e2e.

Il descrittore è la fonte da cui la documentazione genera la pagina di riferimento di ogni widget (§8.3): aggiungere un widget senza descrittore completo DEVE far fallire la build.

Le priorità indicano l'ordine di sviluppo: **P0** = MVP, **P1** = prima release pubblica, **P2** = successiva.

### 4.1 Widget di visualizzazione

| `k`        | Nome                          | Valore                                                                        | Proprietà specifiche                                                                                                                         | Priorità |
| ---------- | ----------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `line`     | Grafico a linea (tempo reale) | numero per canale                                                             | `min`, `max` (assenti = scala automatica), `win` finestra in secondi (default 30), `step` (bool, linea a gradini), `fill` (bool)             | P0       |
| `value`    | Card numerica (KPI)           | numero o stringa                                                              | `trend` (bool, freccia di tendenza), `minmax` (bool, mostra min/max di sessione), `warn`/`alarm` soglie `[basso, alto]` che colorano la card | P0       |
| `gauge`    | Lancetta                      | numero                                                                        | `min`, `max` (obbl.), `zones`: array di `[da, a, colore]`                                                                                    | P0       |
| `led`      | Indicatore di stato           | bool, numero o stringa                                                        | `on`/`off` colori; oppure `states`: oggetto `valore → [etichetta, colore]`                                                                   | P0       |
| `log`      | Registro eventi               | eventi `e`                                                                    | `lvl` livello minimo mostrato, `src` array di sorgenti filtrate, `max` righe (default 500). Non usa `ch`.                                    | P0       |
| `xy`       | Grafico XY / scatter          | `[x,y]`                                                                       | `xmin`,`xmax`,`ymin`,`ymax`, `trail` punti mantenuti (default 500), `mode`: `points`/`lines`, `xlabel`,`ylabel`                              | P1       |
| `bar`      | Barre                         | un numero per canale, oppure oggetto etichetta→numero, oppure array (spettro) | `min`, `max`, `horiz` (bool), `xlabels` per array                                                                                            | P1       |
| `pie`      | Torta / ciambella             | oggetto etichetta→numero, oppure un numero per canale                         | `donut` (bool), `pct` (bool, mostra percentuali)                                                                                             | P1       |
| `level`    | Barra di livello / progresso  | numero                                                                        | `min`, `max`, `vert` (bool), `zones` come gauge                                                                                              | P1       |
| `table`    | Tabella chiave-valore         | oggetto, oppure un valore per canale                                          | `cols`: intestazioni. Evidenzia per 500 ms i valori cambiati.                                                                                | P1       |
| `heat`     | Heatmap / matrice             | array di `rows*cols` numeri                                                   | `rows`, `cols` (obbl.), `min`, `max`, `palette`: `thermal`/`viridis`/`gray`, `interp` (bool, interpolazione bilineare)                       | P1       |
| `hist`     | Istogramma                    | numero                                                                        | `bins` (default 20), `min`, `max`, `n` campioni considerati (default 1000)                                                                   | P2       |
| `polar`    | Radar / polare                | `[angolo°, distanza]`                                                         | `rmax`, `amin`,`amax` (settore, default 0–360), `sweep` (bool: cancella i punti vecchi al passaggio del "raggio")                            | P2       |
| `compass`  | Bussola                       | numero (gradi)                                                                | `ref`: stringhe dei punti cardinali localizzate                                                                                              | P2       |
| `attitude` | Orizzonte artificiale         | coppia `[pitch°, roll°]`                                                      | nessuna                                                                                                                                      | P2       |

Note comuni:

- I grafici con più canali (`line`, `bar`, `pie`) mostrano la legenda cliccabile (nasconde/mostra una serie).
- Tutti i widget mostrano **l'età del dato**: se non arriva un valore da più di 5 s (o `stale` secondi, proprietà comune opzionale), il widget si attenua e mostra "dato non aggiornato".
- Scala automatica: con `min`/`max` assenti la scala segue i dati con un margine del 5% e si **allarga ma non si restringe** finché l'utente non preme "Adatta" (evita lo sfarfallio).

### 4.2 Esempi di dichiarazione

```json
@{"t":"w","id":"acc","k":"line","title":"Accelerometro","ch":["ax","ay","az"],"labels":["X","Y","Z"],"unit":"g","min":-2,"max":2,"win":10}
@{"t":"w","id":"cons","k":"pie","title":"Consumi","ch":"cons","donut":true}
@{"t":"d","d":{"cons":{"Pompa":120,"Luci":45,"Ventola":30}}}
@{"t":"w","id":"cam","k":"heat","title":"Termocamera","ch":"ir","rows":8,"cols":8,"min":20,"max":40,"palette":"thermal","interp":true}
@{"t":"w","id":"stato","k":"led","ch":"st","states":{"0":["Fermo","#888888"],"1":["In funzione","#2ecc71"],"2":["Errore","#e74c3c"]}}
@{"t":"w","id":"sonar","k":"polar","ch":"scan","rmax":200,"amin":0,"amax":180,"sweep":true}
```

### 4.3 Controlli (bidirezionali)

Per i controlli: `id` = canale di stato (PRT-13); `val` = valore iniziale opzionale; `dis` (bool) = disabilitato; `confirm` (stringa) = se presente, chiede conferma all'utente con quel testo prima di inviare (utile per azioni pericolose).

| `k`      | Nome             | `v` inviato       | Proprietà specifiche                                                                                  | Priorità |
| -------- | ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| `button` | Pulsante         | `true` al clic    | `hold` (bool): invia `true` alla pressione e `false` al rilascio; `label` testo del pulsante; `color` | P0       |
| `switch` | Interruttore     | booleano          | `on`/`off` etichette                                                                                  | P0       |
| `slider` | Cursore          | numero            | `min`, `max` (obbl.), `step` (default 1), `unit`, `vert` (bool)                                       | P0       |
| `number` | Campo numerico   | numero            | `min`, `max`, `step`, `unit`. Invio con Invio o perdita del focus.                                    | P1       |
| `select` | Menu a scelta    | stringa           | `opts`: array di stringhe, oppure array di `[valore, etichetta]`                                      | P1       |
| `text`   | Campo di testo   | stringa           | `max` lunghezza (limitata anche da `rx`), `ph` placeholder. Invio con Invio.                          | P1       |
| `color`  | Selettore colore | stringa `#RRGGBB` | `swatches`: colori rapidi                                                                             | P2       |

Stati visivi comuni ai controlli: **normale**, **pendente** (comando inviato, in attesa di `ack`), **errore** (ultimo comando rifiutato o scaduto, per 3 s), **disabilitato** (`dis` o dispositivo scollegato).

---

## 5. Webapp — Requisiti funzionali

### 5.1 Compatibilità e avvio

| ID         | Requisito                                                                                                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP-GEN-01 | Funziona su Chrome, Edge, Opera, Brave desktop (Windows, macOS, Linux, ChromeOS) nelle ultime 2 versioni principali.                                                                                                       |
| APP-GEN-02 | Se `navigator.serial` non esiste, l'app mostra una pagina che spiega il motivo, elenca i browser compatibili e **offre comunque il simulatore e il replay** di registrazioni (utili anche senza seriale).                  |
| APP-GEN-03 | È una PWA installabile; dopo la prima visita funziona completamente offline. Un aggiornamento disponibile viene segnalato con un banner "Nuova versione — ricarica", mai applicato a sorpresa durante una sessione attiva. |
| APP-GEN-04 | Interfaccia in italiano e inglese, lingua scelta dal browser e modificabile nelle impostazioni. Nessuna stringa visibile hardcoded nel codice.                                                                             |
| APP-GEN-05 | Tema chiaro, scuro e "automatico" (segue il sistema).                                                                                                                                                                      |
| APP-GEN-06 | Layout usabile da 1024 px di larghezza in su; sotto, la dashboard passa a una colonna.                                                                                                                                     |
| APP-GEN-07 | Accessibilità: navigazione da tastiera per tutti i comandi, contrasti WCAG AA, controlli con etichette ARIA.                                                                                                               |

### 5.2 Connessione

| ID         | Requisito                                                                                                                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP-CON-01 | Pulsante "Connetti" che apre il selettore porte del browser (`navigator.serial.requestPort()`).                                                                                                                                                     |
| APP-CON-02 | Porte già autorizzate in passato (`getPorts()`) mostrate in un elenco per la riconnessione con un clic, con nome amichevole ricavato da USB VID/PID (tabella interna dei chip comuni: CH340, CP210x, FTDI, ESP32-S2/S3/C3 nativi, Arduino, RP2040). |
| APP-CON-03 | Baud rate da elenco (300 … 2 000 000, default 115 200) o valore personalizzato. Impostazioni avanzate: data bits, parità, stop bits, controllo di flusso.                                                                                           |
| APP-CON-04 | Opzioni DTR/RTS all'apertura: "Reset della scheda alla connessione" (default attivo, comportamento come l'Arduino IDE) oppure "Non resettare".                                                                                                      |
| APP-CON-05 | **Riconnessione automatica**: se il dispositivo viene scollegato e ricollegato (evento `connect` di `navigator.serial`), l'app si riconnette da sola con le stesse impostazioni, se l'opzione è attiva (default: sì).                               |
| APP-CON-06 | Barra di stato sempre visibile: stato connessione, porta, baud, nome dispositivo (da `hi`), byte/s in ricezione, righe/s, errori di protocollo (cliccabile → filtra la console sugli errori), latenza media degli `ack`.                            |
| APP-CON-07 | Se la porta è occupata (tipicamente dall'Arduino IDE), messaggio chiaro: "La porta è usata da un altro programma. Chiudi il Monitor Seriale dell'Arduino IDE e riprova."                                                                            |
| APP-CON-08 | Pulsante "Disconnetti per caricare lo sketch", che libera la porta e si riconnette automaticamente quando la scheda riappare.                                                                                                                       |

### 5.3 Console

| ID         | Requisito                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| APP-CSL-01 | Mostra le righe di testo libero in ordine di arrivo, con font monospazio.                                                                                                      |
| APP-CSL-02 | Lista virtualizzata: fluida anche con 100 000 righe. Limite configurabile (default 20 000), poi le righe più vecchie vengono scartate.                                         |
| APP-CSL-03 | Opzioni: orario per ogni riga (ms), scorrimento automatico (si sospende da solo se l'utente scorre verso l'alto, riprende con un pulsante "↓ Nuove righe"), a capo automatico. |
| APP-CSL-04 | Filtro: "Mostra righe di protocollo" (default no; se sì, in colore attenuato), "Mostra solo errori", ricerca testuale con evidenziazione.                                      |
| APP-CSL-05 | Eventi `e` mostrati in console colorati per livello; errori di protocollo in rosso con il motivo e la riga originale.                                                          |
| APP-CSL-06 | Supporto dei codici colore ANSI (SGR base 16 colori + bold) nelle righe di testo.                                                                                              |
| APP-CSL-07 | Campo di invio con scelta del fine riga (nessuno, LF, CR, CRLF — default LF), cronologia con frecce ↑/↓ (ultimi 50, persistita).                                               |
| APP-CSL-08 | Vista esadecimale opzionale (byte grezzi) per debug di protocolli binari.                                                                                                      |
| APP-CSL-09 | Azioni: pulisci, copia tutto, salva come .txt.                                                                                                                                 |
| APP-CSL-10 | La console è un pannello ridimensionabile e comprimibile, affiancato o sotto la dashboard (scelta dell'utente, persistita).                                                    |

### 5.4 Dati e auto-discovery

| ID         | Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP-DAT-01 | `ChannelStore` mantiene per ogni canale un **ring buffer** di coppie (tempo, valore). Capacità default 20 000 punti per canale, configurabile. Nessuna crescita di memoria illimitata.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| APP-DAT-02 | Il rendering dei widget è disaccoppiato dall'arrivo dei dati: si aggiorna a ritmo di `requestAnimationFrame` (max 60 fps) e solo per i widget visibili (tab attiva, non comprimati).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| APP-DAT-03 | **Auto-discovery**: un canale senza widget crea automaticamente un widget nel gruppo "Auto": `line` per valori numerici, `led` per booleani, `value` per stringhe, `xy` per coppie, `table` per oggetti, `bar` per array. Disattivabile nelle impostazioni.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| APP-DAT-04 | Compatibilità con il **formato del Plotter Seriale di Arduino** (opzione, default attiva): righe di testo come `temp:23.4 hum:58` o `23.4,58` vengono riconosciute come dati e inviate all'auto-discovery, restando visibili anche in console.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| APP-DAT-05 | Pausa globale: congela la visualizzazione di tutti i grafici (i dati continuano a essere registrati nel buffer); alla ripresa si torna al tempo reale.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| APP-DAT-06 | **Testo esteso** (oltre al formato numerico di APP-DAT-04): una riga `etichetta:valore` riconosce anche booleani (`true`/`false`), stringhe tra virgolette (`"testo"`), array di soli numeri (`[1,2,3]`, nessun elemento non numerico) e oggetti piatti `"chiave":numero\|stringa` (`{"a":1,"b":"x"}`, mai un booleano come valore, nessun annidamento in nessuno dei due casi) — stessa grammatica JSON dei valori, instradati verso l'auto-discovery (APP-DAT-03) esattamente come se fossero arrivati in un messaggio `d` del protocollo. I valori posizionali senza etichetta restano solo numerici (APP-DAT-04 invariato). Una riga con almeno un campo `etichetta:` riconoscibile che però non rispetta la grammatica per il resto (parentesi/virgolette sbilanciate, booleano dentro un oggetto, array con elementi non numerici, annidamento) viene scartata per intero — non trattata come testo libero silenzioso, vedi APP-DAT-07. |
| APP-DAT-07 | Una riga scartata da APP-DAT-06 genera un evento (`e`, `lvl:"warn"`, `src:"plotter"`) con il motivo dello scarto, visibile in console come un qualsiasi evento del dispositivo. Al primo evento di questo tipo, se non esiste già un widget `log` che lo mostrerebbe, l'app ne crea automaticamente uno (kind `log`, filtrato su `src:"plotter"`) nel gruppo "Auto" (APP-DAT-03) — così l'utente vede gli scarti senza dover aprire la console.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### 5.5 Dashboard

| ID         | Requisito                                                                                                                                                                                                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP-DSH-01 | Griglia a 12 colonne con widget trascinabili e ridimensionabili. I gruppi (`grp`) diventano schede (tab).                                                                                                                                                                                                                                      |
| APP-DSH-02 | Posizionamento iniziale: in ordine di `ord` poi di arrivo, con dimensione `size` o quella di default del tipo. Le modifiche dell'utente al layout vengono ricordate.                                                                                                                                                                           |
| APP-DSH-03 | **Profili**: layout e override sono salvati per dispositivo, con chiave `name` del messaggio `hi`; senza `hi`, con chiave VID/PID USB. Quando lo stesso dispositivo si ricollega, la dashboard viene ripristinata.                                                                                                                             |
| APP-DSH-04 | **Override utente**: ogni proprietà di un widget è modificabile da un pannello laterale (min, max, colori, finestra temporale, tipo di grafico compatibile…). Precedenza: **override utente > dichiarazione dispositivo > default del tipo**. Le proprietà sovrascritte hanno un indicatore e un pulsante "Ripristina valore del dispositivo". |
| APP-DSH-05 | **Cambio di template**: un widget può essere trasformato in un altro tipo compatibile con la forma del valore (es. `line` ↔ `value` ↔ `gauge` ↔ `level` per numeri). È un override, non modifica il firmware.                                                                                                                                  |
| APP-DSH-06 | **Widget creati dall'utente**: dalla UI si può aggiungere un widget scegliendo un template dal catalogo e collegandolo a uno o più canali esistenti (elenco dei canali con ultimo valore visibile).                                                                                                                                            |
| APP-DSH-07 | Per ogni widget: schermo intero, esporta immagine PNG, esporta dati del widget in CSV, azzera statistiche.                                                                                                                                                                                                                                     |
| APP-DSH-08 | Esporta/importa l'intero profilo dashboard in un file `.serialdash.json` (per condividerlo o fare backup).                                                                                                                                                                                                                                     |
| APP-DSH-09 | Modalità "Blocca layout" per evitare spostamenti accidentali durante l'uso.                                                                                                                                                                                                                                                                    |

### 5.6 Registrazione e riproduzione

**Rimosso dallo scope del progetto** (deciso durante M6): nessuna registrazione sessione/replay è
prevista. L'export CSV per singolo widget (APP-DSH-07) copre l'esigenza di portare fuori i dati.
Numerazione delle sezioni successive lasciata invariata per non rompere i riferimenti incrociati
nel resto del documento.

### 5.7 Simulatore

| ID         | Requisito                                                                                                                                                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP-SIM-01 | `SimulatorTransport`: un dispositivo virtuale nel browser che parla il protocollo v1 esattamente come una scheda reale (handshake, `hi`, `w`, `d`, `ack`, eventi, reset).                                                                             |
| APP-SIM-02 | Scenari predefiniti: "Tutti i widget" (usa l'esempio dimostrativo di ogni descrittore), "Stazione meteo", "Controllo motore" (controlli bidirezionali con rifiuti e limiti), "Stress test" (1000 righe/s), "Errori di protocollo" (righe malformate). |
| APP-SIM-03 | Accessibile dalla schermata di connessione come "Prova senza hardware". È anche la base dei test e2e (§9).                                                                                                                                            |

### 5.8 Impostazioni

Pannello con: lingua, tema, auto-discovery, compatibilità Plotter, riconnessione automatica, timeout `ack`, capacità buffer, limite righe console, cancellazione di tutti i dati locali, informazioni (versione app e protocollo, link alla documentazione).

### 5.9 Requisiti non funzionali

| ID         | Requisito                                                                                                                                                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP-NFR-01 | Sostiene **1 000 righe/s** in ingresso (con 10 canali numerici e 10 widget visibili) senza perdere dati e mantenendo l'interfaccia reattiva (input < 100 ms), su un portatile di fascia media.                                                                         |
| APP-NFR-02 | Il parsing avviene in blocchi per frame; se il carico supera la capacità, i dati vanno comunque nel buffer e l'app segnala "sovraccarico" nella barra di stato invece di bloccarsi. Valutare un Web Worker per LineSplitter + Parser se il test di carico lo richiede. |
| APP-NFR-03 | Memoria stabile in una sessione di 8 ore con stress test (nessuna crescita oltre i buffer configurati).                                                                                                                                                                |
| APP-NFR-04 | Primo caricamento < 2 s su connessione 4G; avvio offline < 1 s.                                                                                                                                                                                                        |
| APP-NFR-05 | Nessuna richiesta di rete dopo il caricamento, salvo aggiornamento del service worker. Content Security Policy restrittiva, nessuno script di terze parti a runtime.                                                                                                   |
| APP-NFR-06 | Il contenuto ricevuto dalla seriale è **dati non fidati**: mai interpretato come HTML (niente `innerHTML` con testo del dispositivo), colori validati con regex prima dell'uso.                                                                                        |

---

## 6. Libreria Arduino / ESP32

### 6.1 Obiettivi e vincoli

| ID         | Requisito                                                                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LIB-GEN-01 | Nome libreria `SerialDash`, header unico da includere `#include <SerialDash.h>`. Classe principale `SerialDash`.                                                                                                              |
| LIB-GEN-02 | Conforme all'Arduino Library Manager (`library.properties`, `src/`, `examples/`, `keywords.txt`, supera `arduino-lint --library-manager submit`) e a PlatformIO (`library.json`).                                             |
| LIB-GEN-03 | Piattaforme supportate e testate in CI: AVR (Uno, Nano, Mega), ESP32 (classico, S2, S3, C3), ESP8266, RP2040 (core Earle Philhower e Mbed), SAMD. Architettura dichiarata `*`: deve compilare su qualsiasi core con `Stream`. |
| LIB-GEN-04 | Funziona su **qualsiasi `Stream`**: `Serial`, `Serial1`, `SoftwareSerial`, USB CDC nativo, `BluetoothSerial` su ESP32.                                                                                                        |
| LIB-GEN-05 | **Nessuna allocazione dinamica** (`malloc`/`new`/`String`) nel codice della libreria. Buffer statici dimensionati da macro.                                                                                                   |
| LIB-GEN-06 | **Nessuna dipendenza** esterna (niente ArduinoJson): scrittore JSON e parser minimale interni.                                                                                                                                |
| LIB-GEN-07 | Budget su Arduino Uno con l'esempio `02_FirstChart`: overhead ≤ 6 KB di flash e ≤ 150 byte di RAM **oltre** al buffer di ricezione. Verificato in CI (§9.3).                                                                  |
| LIB-GEN-08 | **Non bloccante**: nessuna funzione della libreria usa `delay()` o attende dati.                                                                                                                                              |
| LIB-GEN-09 | Tutte le funzioni che accettano stringhe costanti hanno l'overload `const __FlashStringHelper*` per usare `F("...")` e risparmiare RAM su AVR.                                                                                |
| LIB-GEN-10 | C++11, compila senza warning con `-Wall -Wextra` su tutti i core supportati.                                                                                                                                                  |

### 6.2 Opzioni di compilazione

Definibili prima dell'`#include` o come flag di build:

| Macro                         | Default AVR | Default altri | Significato                                                                   |
| ----------------------------- | ----------- | ------------- | ----------------------------------------------------------------------------- |
| `SERIALDASH_RX_BUFFER`        | 64          | 256           | Byte del buffer riga in ricezione. Annunciato all'app nel campo `rx` di `hi`. |
| `SERIALDASH_MAX_CONTROLS`     | 6           | 32            | Numero massimo di callback `onControl` registrabili.                          |
| `SERIALDASH_MAX_CHANNELS_ARG` | 8           | 8             | Numero massimo di canali passabili a `ch(...)`/`labels(...)`.                 |
| `SERIALDASH_THREAD_SAFE`      | 0           | 1 su ESP32    | Serializza le scritture con un mutex FreeRTOS (più task che inviano).         |
| `SERIALDASH_FLOAT_DECIMALS`   | 3           | 3             | Decimali di default per i float.                                              |

### 6.3 Ricezione e parser

| ID        | Requisito                                                                                                                                                                                                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LIB-RX-01 | `loop()` legge tutti i byte disponibili nel `Stream`, li accumula nel buffer riga e processa ogni riga completa.                                                                                                                                                                                                                            |
| LIB-RX-02 | Righe che iniziano con `@{` vengono interpretate con un **parser JSON minimale** che supporta: oggetto piatto, chiavi stringa, valori numero (intero e decimale, con segno ed esponente), booleano, `null`, stringa con escape JSON (inclusi `\uXXXX` → UTF-8). Oggetti/array annidati vengono saltati senza errore (compatibilità futura). |
| LIB-RX-03 | Il parser non dipende dall'ordine dei campi (anche se l'app rispetta PRT-40), costruisce il risultato in place nel buffer riga (le stringhe restano puntatori nel buffer), senza copie.                                                                                                                                                     |
| LIB-RX-04 | Riga più lunga del buffer: viene scartata fino al `\n` successivo e la libreria invia `@{"t":"e","lvl":"err","msg":"rx overflow","src":"dash"}`.                                                                                                                                                                                            |
| LIB-RX-05 | Righe che NON iniziano con `@{` vengono passate al callback `onText` (se registrato), così l'utente può continuare a gestire comandi testuali propri.                                                                                                                                                                                       |
| LIB-RX-06 | Gestione automatica: `hi` → risposta `hi` + chiamata di `onDeclare`; `ping` → `pong`; `c` → dispatch al callback del controllo (§6.5). Tipi sconosciuti ignorati.                                                                                                                                                                           |
| LIB-RX-07 | Comando `c` per un id senza callback: risponde `ack` con `ok:false`, `err:"unknown control"`.                                                                                                                                                                                                                                               |

### 6.4 API pubblica — trasmissione

Le firme sono normative nella forma; i nomi dei parametri sono indicativi. `Text` indica gli overload `const char*` e `const __FlashStringHelper*`.

**Ciclo di vita**

```cpp
SerialDash dash(Serial);                       // qualsiasi Stream&
void begin(Text name, Text fw = nullptr);      // invia hi e chiama onDeclare
void loop();                                   // da chiamare in ogni loop()
void onDeclare(void (*cb)());                  // qui l'utente dichiara i widget
bool appConnected() const;                     // true se l'app si è presentata (hi ricevuto)
                                               // e ha inviato un ping negli ultimi 5 s
```

`begin()` NON chiama `Serial.begin()`: l'utente inizializza lo Stream come sempre.

**Dichiarazione dei widget — builder a streaming**

Ogni metodo di dichiarazione restituisce un oggetto builder **temporaneo** che scrive direttamente sullo Stream man mano che i metodi vengono concatenati, e chiude la riga (`}` + `\n`) nel proprio distruttore, cioè alla fine dell'istruzione. Così una dichiarazione non occupa RAM.

```cpp
dash.line("temp", F("Temperatura")).ch("tin", "tout").labels(F("Interna"), F("Esterna"))
    .unit(F("°C")).range(-10, 45).group(F("Clima"));

dash.gauge("hum").ch("h").unit("%").range(0, 100)
    .zone(0, 30, "#e67e22").zone(30, 70, "#2ecc71").zone(70, 100, "#3498db");

dash.toggle("fan", F("Ventola")).value(fanOn);
dash.slider("pwm", F("Potenza")).range(0, 255).step(1).value(pwm);
dash.select("mode", F("Modalità")).option("auto").option("man").value("auto");
```

Requisiti del builder:

- **LIB-TX-01** Un metodo per ogni tipo di §4: `line`, `value`, `gauge`, `led`, `log`, `xy`, `bar`, `pie`, `level`, `table`, `heat`, `hist`, `polar`, `compass`, `attitude`, `button`, `toggle` (per `k:"switch"`, perché `switch` è parola riservata C++), `slider`, `number`, `select`, `text`, `color`. Più il generico `widget(id, kind)` per tipi futuri.
- **LIB-TX-02** Metodi comuni: `title`, `ch(...)` variadico, `labels(...)`, `colors(...)`, `group`, `order`, `size(w,h)`, `unit`, `decimals`, `range(min,max)`, `value(v)` (→ `val`), `disabled()`, `confirm(text)`.
- **LIB-TX-03** Metodi specifici con nomi leggibili che mappano alle proprietà brevi del protocollo (es. `window(s)` → `win`, `donut()`, `rows(r)`, `cols(c)`, `palette(p)`, `trail(n)`, `step(s)`, `hold()`).
- **LIB-TX-04** Proprietà array costruite con **chiamate consecutive** dello stesso metodo: `zone()`, `state(valore, etichetta, colore)`, `option()`. Il builder apre l'array alla prima chiamata e lo chiude quando si chiama un metodo diverso o alla fine.
- **LIB-TX-05** Metodo di fuga `prop(key, value)` (numero, bool, Text) per proprietà non ancora coperte da metodi dedicati.
- **LIB-TX-06** `dash.update(id)` restituisce un builder per il messaggio `u`; `dash.remove(id)` e `dash.removeAll()` inviano `x`.

**Invio dati**

```cpp
dash.send("tin", 22.8);                        // un canale: int, long, unsigned, float, double, bool, Text
dash.send("tin", 22.8, 1);                     // float con 1 decimale
dash.sendXY("pos", x, y);
dash.sendArray("ir", pixels, 64, 1);           // float*, int16_t*, uint8_t* + lunghezza (+ decimali)

dash.data().add("tin", tin).add("tout", tout).add("h", hum);   // più canali in una riga
dash.data().ts(millis()).add("ax", ax).add("ay", ay);          // con timestamp dispositivo
dash.data().map("cons").kv(F("Pompa"), 120).kv(F("Luci"), 45); // oggetto etichetta→valore
```

- **LIB-TX-10** `data()` segue lo stesso schema a streaming (riga chiusa nel distruttore). `map()` apre un oggetto chiuso dal primo metodo diverso da `kv` o dalla fine.
- **LIB-TX-11** Float `NaN`/`Inf` → `null` (PRT-09). Formattazione con `Print::print(double, decimali)`, zeri finali rimossi.
- **LIB-TX-12** Tutte le stringhe scritte vengono escapate secondo JSON (PRT-10), anche quelle da `F()`.

**Eventi**

```cpp
dash.debug(F("..."));  dash.info(F("..."));  dash.warn(F("..."), "h");  dash.error(F("..."));
```

Secondo parametro opzionale = `src`. Su piattaforme non-AVR sono disponibili anche le varianti printf `infof(fmt, ...)` ecc., con buffer da 128 byte sullo stack.

### 6.5 API pubblica — controlli

```cpp
dash.onControl("pwm", [](DashValue& v) -> bool {
  int p = constrain(v.toInt(), 0, 200);   // limito a 200
  analogWrite(PIN_PWM, p);
  v.set(p);                               // comunico il valore realmente applicato
  return true;                            // ok → ack + echo automatico
});

dash.onControl("reboot", [](DashValue& v) -> bool {
  if (motorRunning) return v.reject(F("Ferma prima il motore"));  // ack ok:false
  ESP.restart();
  return true;
});

dash.onAnyControl([](const char* id, DashValue& v) -> bool { ... });  // fallback per id non registrati
dash.onText([](const char* line) { ... });                            // righe di testo dall'app
```

| ID         | Requisito                                                                                                                                                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| LIB-CTL-01 | Callback come puntatori a funzione (lambda senza cattura compatibili su AVR). Su piattaforme con `<functional>` è accettato anche `std::function`.                                                                                                                                                                             |
| LIB-CTL-02 | `DashValue`: `type()` (`Number`, `Bool`, `String`, `Null`), `isNumber()`, `isBool()`, `isString()`, `toInt()`, `toLong()`, `toFloat()`, `toBool()`, `toString()` (puntatore valido **solo durante il callback**, documentarlo chiaramente), `equals(Text)`. Conversioni tolleranti: `toBool()` di un numero ≠ 0 è `true`, ecc. |
| LIB-CTL-03 | `v.set(x)` sostituisce il valore da rimandare nell'echo; `v.reject(msg)` imposta l'errore e restituisce `false`.                                                                                                                                                                                                               |
| LIB-CTL-04 | Dopo il callback, la libreria invia **automaticamente** `ack` con lo stesso `r`, e se l'esito è positivo, l'echo `d` con il valore (eventualmente modificato da `set`). Echo disattivabile globalmente con `dash.setAutoEcho(false)` per chi vuole gestirlo a mano.                                                            |
| LIB-CTL-05 | Per aggiornare lo stato di un controllo per cause esterne (pulsante fisico) basta `dash.send("fan", true)`.                                                                                                                                                                                                                    |

### 6.6 Esempi inclusi

Ogni esempio DEVE compilare per Uno ed ESP32 (salvo dove indicato), avere in testa un commento con: scopo, collegamenti hardware (o "nessun hardware richiesto"), cosa ci si aspetta di vedere nella dashboard.

| Esempio             | Contenuto                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `01_TextOnly`       | Solo `Serial.println`: dimostra la compatibilità con la console.                                   |
| `02_FirstChart`     | Un grafico a linea con un valore simulato (sinusoide). Il "ciao mondo".                            |
| `03_WeatherStation` | Dashboard completa con valori simulati: line, gauge, value, led, eventi. Nessun hardware.          |
| `04_Controls`       | LED integrato con toggle, PWM con slider, pulsante con conferma, rifiuto con `reject`.             |
| `05_AllWidgets`     | Ogni widget di §4 con dati simulati. Solo non-AVR (troppa flash per Uno).                          |
| `06_ESP32_Tasks`    | Due task FreeRTOS che inviano dati in parallelo (`SERIALDASH_THREAD_SAFE`). Solo ESP32.            |
| `07_TextCommands`   | Uso di `onText` per mantenere comandi testuali preesistenti accanto al protocollo.                 |
| `08_ThermalCamera`  | Heatmap 8x8 con sensore AMG8833 (dipendenza opzionale Adafruit, non compilata in CI obbligatoria). |

---

## 7. Artefatti del protocollo

| ID     | Requisito                                                                                                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRO-01 | `/protocol/schema/` contiene JSON Schema (draft 2020-12) per ogni messaggio in entrambe le direzioni e per le proprietà di ogni widget. È la **fonte di verità** (P7).                                        |
| PRO-02 | `tools/gen-types` genera `app/src/protocol/generated/*.ts` dagli schemi. I file generati sono committati e marcati "NON MODIFICARE A MANO". La CI fallisce se lo schema e i file generati non sono allineati. |
| PRO-03 | `/protocol/test-vectors/*.jsonl`: ogni riga è `{"name":…, "dir":"d2a"                                                                                                                                         | "a2d", "line":"@{…}", "valid":true | false, "expect":{…} | null, "error":"…"}`. Coprono: ogni tipo di messaggio, ogni widget, casi limite (unicode, escape, numeri estremi, `null`, campi sconosciuti, tipi sconosciuti, righe troncate, JSON malformato, id non validi). |
| PRO-04 | Gli stessi test vector sono eseguiti **sia** dai test dell'app (parser TS) **sia** dai test nativi della libreria (parser C++, solo direzione `a2d` più il round-trip dell'encoder).                          |
| PRO-05 | Ogni modifica del protocollo richiede: aggiornamento di §3 di questo documento, schema, test vector, voce nel `CHANGELOG` del protocollo e nuova versione se non retrocompatibile.                            |

---

## 8. Documentazione

La documentazione è parte del prodotto, non un'attività finale. Vale il principio **docs-as-code**: vive nel repository, si costruisce in CI, si pubblica insieme all'app, e **una funzionalità non è completa finché non è documentata** (Definition of Done, §9.5).

### 8.1 Pubblico e obiettivi

| Pubblico                                                               | Cosa deve riuscire a fare                                               |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Maker principiante                                                     | In 5 minuti: aprire l'app, caricare `02_FirstChart`, vedere il grafico. |
| Utente esperto                                                         | Trovare tutte le proprietà di un widget, i formati di valore, i limiti. |
| Chi implementa il protocollo senza la libreria (MicroPython, Rust, PC) | Implementarlo solo leggendo il riferimento del protocollo.              |
| Contributore (umano o AI)                                              | Capire l'architettura, aggiungere un widget, eseguire i test.           |

### 8.2 Struttura del sito (VitePress, in `/docs`, pubblicato su `/docs/`)

```
docs/
├── index.md                      # presentazione, GIF animata, pulsante "Apri l'app"
├── guide/
│   ├── quick-start.md            # 5 minuti: installa libreria → carica esempio → connetti
│   ├── connecting.md             # porte, baud, driver (CH340, CP210x), reset, riconnessione
│   ├── console.md
│   ├── dashboard.md              # layout, gruppi, override, cambio template, profili
│   ├── controls.md               # controlli bidirezionali, stati pendente/errore
│   ├── simulator.md
│   └── plotter-compat.md         # uso senza libreria con il formato del Plotter Arduino
├── widgets/                      # UNA PAGINA PER WIDGET — GENERATA (§8.3)
├── library/
│   ├── install.md                # Library Manager, PlatformIO, zip
│   ├── getting-started.md
│   ├── api.md                    # riferimento API — GENERATO da Doxygen (§8.4)
│   ├── options.md                # macro di compilazione
│   ├── memory.md                 # consumo RAM/flash per scheda, consigli per AVR
│   └── examples.md               # indice degli esempi, cosa aspettarsi nella dashboard
├── protocol/
│   ├── overview.md               # concetti: framing, canali vs widget, handshake
│   ├── messages.md               # riferimento messaggi — tabelle GENERATE dallo schema
│   ├── controls.md               # semantica bidirezionale, diagrammi di sequenza (Mermaid)
│   ├── implementing.md           # guida per implementazioni in altri linguaggi + test vector
│   └── changelog.md
├── troubleshooting.md            # FAQ: porta occupata, browser non supportato, caratteri strani (baud errato), ESP32 si resetta, ecc.
├── contributing/
│   ├── architecture.md           # riassunto di §2 con diagrammi
│   ├── adding-a-widget.md        # procedura passo-passo
│   ├── testing.md                # test automatici + checklist manuale con schede reali
│   └── adr/                      # Architecture Decision Records
└── compatibility.md              # matrice versioni app / libreria / protocollo, browser, schede
```

### 8.3 Contenuti generati (niente duplicazioni manuali)

| ID     | Requisito                                                                                                                                                                                                                                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC-01 | `tools/gen-docs` genera `docs/widgets/<kind>.md` dal descrittore del widget + schema: descrizione, screenshot, tabella proprietà (nome protocollo, metodo libreria corrispondente, tipo, default, descrizione), forme di valore accettate, esempio JSON, esempio Arduino, template compatibili per il cambio di tipo. |
| DOC-02 | Le tabelle dei campi in `protocol/messages.md` sono generate dagli schemi (sezioni delimitate da marcatori `<!-- generated:start -->` / `<!-- generated:end -->`, il resto della pagina è scritto a mano).                                                                                                            |
| DOC-03 | La CI esegue la generazione e fallisce se i file generati committati differiscono (documentazione sempre allineata).                                                                                                                                                                                                  |
| DOC-04 | Ogni esempio JSON e ogni esempio Arduino presente nella documentazione è **verificato automaticamente**: i JSON contro lo schema, gli snippet Arduino compilati in CI come mini-sketch.                                                                                                                               |

### 8.4 Documentazione della libreria

| ID     | Requisito                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC-10 | Ogni simbolo pubblico negli header ha un commento Doxygen: descrizione breve, parametri, valore restituito, note su memoria/validità dei puntatori, esempio minimo. |
| DOC-11 | Doxygen (output XML) + conversione in Markdown (es. moxygen) genera `docs/library/api.md`.                                                                          |
| DOC-12 | `lib/SerialDash/README.md` (mostrato da Library Manager e GitHub): cosa fa, GIF, installazione, esempio completo di 20 righe, link al sito. In inglese.             |
| DOC-13 | `keywords.txt` completo per l'evidenziazione nell'Arduino IDE.                                                                                                      |
| DOC-14 | La pagina `memory.md` riporta i numeri reali misurati in CI (§9.3), aggiornati automaticamente.                                                                     |

### 8.5 Screenshot e animazioni automatici

**Rimosso dallo scope del progetto** (deciso durante M7): nessuna infrastruttura di screenshot/GIF
automatici. Le pagine widget generate (§8.3) restano testuali (tabelle proprietà, esempi JSON e
Arduino), senza immagini. Numerazione delle sezioni successive lasciata invariata.

### 8.6 Aiuto dentro l'app

| ID     | Requisito                                                                                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC-30 | Nel pannello di configurazione di un widget, ogni proprietà ha un "?" che apre la pagina di documentazione del widget all'ancora di quella proprietà.                                     |
| DOC-31 | Stati vuoti con istruzioni: nessuna porta → come collegare; connesso ma nessun `hi` → "Stai usando la libreria? Ecco come iniziare" con link; dashboard vuota → suggerisce il simulatore. |
| DOC-32 | Tour introduttivo alla prima apertura (massimo 4 passi, saltabile, riapribile dal menu Aiuto).                                                                                            |
| DOC-33 | Pagina "Informazioni" con versioni, link a documentazione, changelog e segnalazione problemi.                                                                                             |
| DOC-34 | La documentazione è inclusa nella cache offline della PWA (consultabile senza rete).                                                                                                      |

### 8.7 Documentazione per sviluppatori

| ID     | Requisito                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC-40 | TSDoc su tutte le funzioni, classi e tipi esportati dei moduli `protocol`, `session`, `data`, `transport`, `widgets/registry`.                                                                                                                                                                                                                                                                                    |
| DOC-41 | ADR (Architecture Decision Records) in `docs/contributing/adr/`, formato breve (contesto, decisione, conseguenze). Da scrivere subito: ADR-001 Webapp con Web Serial; ADR-002 JSON in entrambe le direzioni con messaggi app→dispositivo piatti; ADR-003 Canali separati dai widget; ADR-004 Dispositivo come fonte di verità; ADR-005 Stack (React, uPlot, ECharts). Nuove decisioni architetturali → nuovo ADR. |
| DOC-42 | `CHANGELOG.md` separati per app, libreria e protocollo, formato Keep a Changelog, versionamento semantico indipendente.                                                                                                                                                                                                                                                                                           |
| DOC-43 | `CONTRIBUTING.md` alla radice: setup ambiente, comandi, convenzioni di commit (Conventional Commits), come aggiungere un widget.                                                                                                                                                                                                                                                                                  |

### 8.8 Lingue

Interfaccia dell'app: italiano e inglese. Documentazione: vedi decisione aperta D2 (§10).

---

## 9. Qualità, test e CI

### 9.1 Webapp

| ID    | Requisito                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QA-01 | Unit test (Vitest) per: LineSplitter (righe spezzate tra chunk, **caratteri UTF-8 multibyte spezzati tra chunk**, CRLF, righe troppo lunghe), parser (tutti i test vector), encoder, ChannelStore (ring buffer, offset `ts`, salto all'indietro), DeviceSession (handshake con tentativi, `ack`, timeout, fusione dei comandi pendenti, orfani), precedenza override, auto-discovery, parser formato Plotter. |
| QA-02 | Copertura minima 85% delle righe sui moduli `protocol`, `session`, `data`.                                                                                                                                                                                                                                                                                                                                    |
| QA-03 | Test e2e (Playwright) con `SimulatorTransport`: avvio, connessione al simulatore, comparsa dei widget, round-trip di ogni controllo P0, rifiuto, timeout, reset dispositivo, persistenza del profilo dopo ricarica, funzionamento offline.                                                                                                                                                                    |
| QA-04 | **Rimosso dallo scope del progetto** (deciso durante M6): nessun test di carico automatizzato. Lo scenario simulatore "Stress test" (APP-SIM-02) resta disponibile per un controllo manuale occasionale.                                                                                                                                                                                                      |
| QA-05 | ESLint + Prettier, TypeScript `strict`, nessun `any` esplicito fuori dai file generati.                                                                                                                                                                                                                                                                                                                       |

### 9.2 Libreria

| ID    | Requisito                                                                                                                                                                                                                                                              |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QA-10 | Test nativi su PC (PlatformIO ambiente `native` con uno `Stream` finto): parser su tutti i test vector `a2d`, output dei builder confrontato con righe attese ("golden"), escape, float speciali, overflow buffer, dispatch dei controlli, ack ed echo.                |
| QA-11 | Ogni riga prodotta dai test della libreria viene validata anche contro lo JSON Schema (script nella CI).                                                                                                                                                               |
| QA-12 | `arduino-cli compile` di tutti gli esempi per: `arduino:avr:uno`, `arduino:avr:mega`, `esp32:esp32:esp32`, `esp32:esp32:esp32s3`, `esp32:esp32:esp32c3`, `esp8266:esp8266:nodemcuv2`, `rp2040:rp2040:rpipico`, `arduino:samd:mkrzero` (esclusioni dichiarate in §6.6). |
| QA-13 | `arduino-lint` in modalità Library Manager; clang-format sul codice C++.                                                                                                                                                                                               |

### 9.3 Report di dimensione

La CI compila `02_FirstChart` per Uno con e senza la libreria, calcola l'overhead di flash e RAM e **fallisce se supera LIB-GEN-07**. I numeri vengono pubblicati in `docs/library/memory.md`.

### 9.4 Pipeline CI/CD (GitHub Actions)

- **Su ogni pull request**: lint, generazione (tipi + docs) con verifica di allineamento, unit test app, e2e, test nativi libreria, compilazione esempi, report dimensione, build del sito docs.
- **Su merge in `main`**: deploy di app + docs su GitHub Pages (ambiente "preview" o direttamente produzione, vedi D5).
- **Su tag `lib-vX.Y.Z`**: verifica che `library.properties` e `library.json` abbiano la stessa versione, crea la release GitHub (il Library Manager la rileva automaticamente).
- **Su tag `app-vX.Y.Z`**: deploy di produzione e changelog nella release.
- **Manuale**: checklist `docs/contributing/testing.md` con schede reali (Uno con CH340, ESP32 con CP2102, ESP32-S3 USB nativo, RP2040) da eseguire prima di ogni release.

### 9.5 Definition of Done (per ogni funzionalità)

1. Requisiti citati per ID nel commit o nella PR.
2. Test automatici scritti e verdi.
3. Documentazione utente aggiornata (e generata, se applicabile).
4. Stringhe UI in `it` ed `en`.
5. Se tocca il protocollo: §3, schema, test vector, changelog protocollo (PRO-05).
6. Se tocca un widget: descrittore completo con esempio dimostrativo.
7. Voce nel CHANGELOG del pacchetto.

---

## 10. Decisioni aperte e sviluppi futuri

Ogni decisione ha un **default**: si procede con quello finché non viene deciso diversamente.

| #   | Decisione                                                                                     | Default                                                                                                                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Nome definitivo del progetto (app, libreria, dominio).                                        | **Confermato**: "Serial Dash" come nome visualizzato (UI app, sito documentazione, PWA); "SerialDash" (senza spazio) resta il nome tecnico registrato nella Arduino Library Manager e il nome della classe C++/header, per coerenza con `#include <SerialDash.h>`. Repo reale: `github.com/takticodeX/serialdash`.                   |
| D2  | Lingue della documentazione.                                                                  | Inglese completo come riferimento (libreria e protocollo sono pubblici e internazionali) + guida utente in italiano (`/it/`).                                                                                                                                                                                                        |
| D3  | Controlli con valori multipli (joystick 2D, coordinate). Violerebbe l'oggetto piatto di §3.4. | Rinviato. Proposta: ammettere per `v` un array piatto di massimo 4 numeri, supportato dal parser minimale.                                                                                                                                                                                                                           |
| D4  | Licenza.                                                                                      | **Confermato**: MIT per app, libreria e protocollo. `LICENSE` alla radice e in `lib/SerialDash/` già presenti.                                                                                                                                                                                                                       |
| D5  | Hosting e dominio.                                                                            | **Confermato**: GitHub Pages, repo personale (non organizzazione), nessun dominio personalizzato per ora — sito pubblicato sotto `https://takticodex.github.io/serialdash/` (app alla radice del progetto, documentazione su `/serialdash/docs/`). Dominio personalizzato aggiungibile in futuro senza riscrivere la configurazione. |
| D6  | Web Worker per il parsing.                                                                    | Rinviato indefinitamente — nessun test di carico automatizzato lo richiederà (QA-04 rimosso, §9.1); da riconsiderare solo se emergono problemi di reattività osservati con dati reali (APP-NFR-02).                                                                                                                                  |
| D7  | Contatto maintainer pubblico (`library.properties`, `library.json`).                          | **Confermato**: nome progetto generico ("SerialDash contributors"), email `takticode@gmail.com`, account GitHub `takticodeX`.                                                                                                                                                                                                        |

Sviluppi futuri (fuori dalla v1, ma l'architettura non deve impedirli):

- **Trasporto WebSocket** per ESP32/ESP8266 via Wi-Fi (l'interfaccia `Transport` lo permette; la libreria accetta già qualsiasi `Stream`).
- **Bluetooth**: Web Serial supporta porte Bluetooth RFCOMM su alcune piattaforme; da verificare con `BluetoothSerial` dell'ESP32.
- **Modalità binaria** ad alta frequenza (es. oscilloscopio a 10 kHz) come estensione del protocollo, negoziata nel `hi`.
- Più dispositivi contemporaneamente in schede separate.
- Condivisione dashboard via link (layout codificato nell'URL).
- Soglie di allarme con notifiche di sistema e suono.
- Porting della libreria per MicroPython.

---

## 11. Piano di sviluppo (milestone)

Ogni milestone termina con tutti i criteri di accettazione verificati e la Definition of Done rispettata. **Non iniziare una milestone prima che la precedente sia completa.**

| #   | Milestone                   | Contenuto                                                                                                                                                                                                               | Criteri di accettazione                                                                                                           |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| M0  | Fondamenta                  | Monorepo, tooling, JSON Schema v1 completo, test vector, `gen-types`, scheletro VitePress, CI di base, ADR-001…005, `CONTRIBUTING.md`.                                                                                  | CI verde; tipi generati compilano; test vector validati contro lo schema.                                                         |
| M1  | Console seriale             | `WebSerialTransport`, §5.1 (tranne tour), §5.2, §5.3, §5.8 base, PWA offline, i18n.                                                                                                                                     | Sostituisce il monitor dell'Arduino IDE con uno sketch esistente; funziona offline; guida `connecting.md` e `console.md` scritte. |
| M2  | Protocollo e dashboard base | LineSplitter/Parser/Encoder, DeviceSession con handshake, ChannelStore, `SimulatorTransport`, widget P0 di visualizzazione, auto-discovery, griglia e gruppi, profili.                                                  | Scenario simulatore "Tutti i widget" (P0) funziona; test QA-01 per i moduli toccati; pagine widget generate.                      |
| M3  | Libreria — trasmissione     | §6.1, §6.2, §6.4, esempi 01–03 e 07 (parte testo), test nativi output, compilazione CI, report dimensione.                                                                                                              | `03_WeatherStation` su Uno ed ESP32 reali produce la dashboard attesa; budget LIB-GEN-07 rispettato.                              |
| M4  | Bidirezionale               | Controlli P0 nell'app, §3.6 completa, parser libreria §6.3, §6.5, esempio 04, ping/`appConnected`.                                                                                                                      | Round-trip, rifiuto, timeout e aggiornamento esterno funzionano su scheda reale e in e2e.                                         |
| M5  | Dashboard completa          | Override e precedenza, cambio template, widget creati dall'utente, export/import profili, widget e controlli P1.                                                                                                        | QA-03 completo per queste funzioni; docs `dashboard.md` e `controls.md`.                                                          |
| M6  | Compatibilità               | Formato Plotter (APP-DAT-04), scenari simulatore aggiuntivi (APP-SIM-02). Registrazione/replay (§5.6) e test di carico automatizzato (QA-04) rimossi dallo scope — decisione presa a milestone conclusa, non un rinvio. | Scenari simulatore funzionano; docs `plotter-compat.md` e `simulator.md` scritte.                                                 |
| M7  | Release 1.0                 | Tour, aiuto in-app (§8.6), documentazione completa, pubblicazione Library Manager. Checklist manuale su schede reali è l'**ultimo passo**, subito prima della pubblicazione — non blocca il resto di M7.                | Tutti i requisiti P0/P1 soddisfatti; checklist manuale superata su 4 schede; libreria pubblicata sul Library Manager.             |
| M8+ | Widget P2 e futuri          | `hist`, `polar`, `compass`, `attitude`, poi §10.                                                                                                                                                                        | —                                                                                                                                 |
