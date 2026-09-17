# GHISA — Specifica per implementazione

Web app mobile-first per registrare gli allenamenti in palestra: schede di esercizi, pesi/ripetizioni usati per ogni serie, e storico completo delle sessioni fatte. Uso personale, single-user, nessun login.

Questo documento è pensato per essere passato a Claude Code (o altro agente/dev) per implementare l'app da zero come progetto standalone (non più come artifact "Design").

## 1. Obiettivo e contesto d'uso

- L'utente usa l'app dal telefono, in palestra, per segnare in tempo reale i pesi e le ripetizioni fatte durante l'allenamento.
- Deve poter rivedere lo storico degli allenamenti passati per confrontare i progressi (es. "quanto ho fatto la volta scorsa su panca piana?").
- Nessun account, nessun backend richiesto: è uno strumento personale.
- Priorità: velocità d'uso con una mano, touch target grandi, poco testo da digitare durante l'allenamento.

## 2. Funzionalità principali

### 2.1 Gestione Schede
Una "scheda" è un programma di allenamento con un nome e una lista di esercizi (es. "Scheda A — Petto e tricipiti").

- Creare una nuova scheda: nome + lista esercizi (nome libero per ciascun esercizio).
- Modificare una scheda esistente (rinominarla, aggiungere/rimuovere esercizi).
- Eliminare una scheda (con conferma, perché azione distruttiva). Eliminare una scheda **non** deve modificare le sessioni già registrate nello storico (i dati storici sono indipendenti/denormalizzati).
- Validazione minima: nome scheda non vuoto, almeno 1 esercizio, per poter salvare.
- Stato vuoto: se non ci sono schede, mostrare un messaggio invece di una lista vuota.

### 2.2 Sessione di allenamento
Avviata scegliendo una scheda esistente ("Inizia").

- Per ogni esercizio della scheda, l'utente aggiunge una o più **serie**; ogni serie ha:
  - peso usato (kg, numerico, decimali ammessi es. 0.5)
  - ripetizioni fatte (numero intero)
- Deve essere possibile aggiungere più serie per esercizio e rimuovere una serie inserita per errore.
- "Termina allenamento": salva la sessione nello storico con data/ora corrente. Le serie lasciate completamente vuote (senza peso né reps) vengono scartate automaticamente; se dopo lo scarto non resta nulla da salvare, la sessione non viene salvata.
- "Annulla allenamento": esce senza salvare, con una conferma intermedia per evitare perdite accidentali.

### 2.3 Storico allenamenti
- Lista delle sessioni passate, più recente in alto, con: nome scheda usata, data/ora, riepilogo (numero esercizi e numero serie totali).
- Stato vuoto se non ci sono ancora allenamenti registrati.
- Dettaglio sessione: aprendo una sessione dallo storico si vede, per ogni esercizio, l'elenco delle serie fatte con peso e ripetizioni.

## 3. Modello dati

```ts
type Esercizio = {
  id: string;
  nome: string;
};

type Scheda = {
  id: string;
  nome: string;
  esercizi: Esercizio[];
};

type SerieStorico = {
  peso: number | null;
  reps: number | null;
};

type EsercizioStorico = {
  nome: string;        // copiato al momento della sessione, non un riferimento
  serie: SerieStorico[];
};

type SessioneStorico = {
  id: string;
  schedaId: string;    // riferimento informativo, la scheda potrebbe essere stata eliminata dopo
  schedaNome: string;   // copiato al momento della sessione
  data: number;         // timestamp ms
  esercizi: EsercizioStorico[];
};
```

Persistenza consigliata per la v1: `localStorage`, con un'unica chiave (es. `ghisa_data_v1`) contenente `{ schede: Scheda[], history: SessioneStorico[] }`. Nessun backend richiesto in questa fase; se in futuro si vorrà sincronizzare tra dispositivi, andrà introdotto uno storage remoto (fuori scope per questa v1).

## 4. Flussi di navigazione

```
Schede (home)
 ├─ + Nuova scheda -> Form scheda (crea) -> Salva -> torna a Schede
 ├─ Modifica (su una scheda) -> Form scheda (edit) -> Salva -> torna a Schede
 ├─ Elimina (su una scheda) -> conferma inline -> torna a Schede
 └─ Inizia (su una scheda) -> Allenamento
      ├─ Aggiungi serie per esercizio (ripetibile)
      ├─ Rimuovi serie
      ├─ Annulla allenamento -> conferma -> torna a Schede
      └─ Termina allenamento -> salva in storico -> torna a Schede

Storico
 └─ tap su una sessione -> Dettaglio sessione -> torna a Storico
```

Navigazione principale a due sezioni: **Schede** e **Storico**, raggiungibili da una bottom nav sempre visibile eccetto durante una sessione di allenamento attiva o mentre si compila il form di una scheda (schermate "a fuoco" senza distrazioni).

## 5. Stile e UI (già definiti in un prototipo precedente — mantenere coerenza)

- Nome app: **GHISA**.
- Mobile-first: contenuto a colonna singola, larghezza di riferimento ~390px, ma responsive.
- Tema scuro:
  - sfondo: `#15130f`
  - superfici/card: `#1f1c16`
  - bordi: `#2c2820`
  - testo primario: `#f5f3ee`
  - testo secondario/muted: `#a39c8f`
  - colore accento (azioni primarie, evidenziazioni): `#d7ff4c` (lime), testo scuro `#15130f` sopra i bottoni accento
  - colore per azioni distruttive/delete: `#ff9d8c` per il testo, `#ff6b57` per il bottone di conferma eliminazione
- Tipografia: titolo/wordmark in un font display condensato in maiuscolo (es. "Bebas Neue" da Google Fonts) per il logo "GHISA"; testo e componenti UI in un font sans distintivo (es. "Space Grotesk" da Google Fonts). Evitare font generici come Inter/Roboto/Arial.
- Target di tocco minimo 44px in altezza per bottoni e input (uso con una mano, spesso mentre si è impegnati fisicamente).
- Niente elementi decorativi superflui (niente emoji nell'interfaccia, niente card con bordo colorato a sinistra, niente gradient washes).
- Conferme inline (non `window.confirm`/alert nativi del browser) per le azioni distruttive: eliminare una scheda, uscire da un allenamento senza salvare.
- Microcopy in italiano, tono diretto. Esempi già usati nel prototipo:
  - Titolo sezione schede: "Le tue schede"
  - Bottone crea: "+ Nuova"
  - Stato vuoto schede: "Non hai ancora nessuna scheda. Creane una per iniziare a registrare i tuoi allenamenti."
  - Bottoni scheda: "Inizia" / "Modifica" / "Elimina"
  - Conferma eliminazione: "Eliminare questa scheda?" con bottoni "Sì, elimina" / "Annulla"
  - Storico vuoto: "Non hai ancora registrato nessun allenamento."
  - Bottone fine allenamento: "Termina allenamento"
  - Conferma uscita: "Uscire senza salvare questo allenamento?" con bottoni "Sì, esci" / "No"

## 6. Requisiti tecnici suggeriti

- Stack libero (va bene una SPA con Vite + React, oppure vanilla JS/HTML/CSS): non ci sono vincoli di framework, ma preferire qualcosa di leggero visto che è un'app personale senza backend.
- Deve funzionare come **PWA installabile** (manifest + icona) per poterla aggiungere alla home del telefono e usarla come un'app nativa in palestra, anche perché verrà riaperta di frequente.
- Deve funzionare offline (dato che si basa solo su `localStorage`, non richiede rete dopo il primo caricamento — attenzione solo al caricamento dei font Google, che va gestito con un fallback di sistema se offline).
- Nessuna dipendenza da servizi esterni per la persistenza dati in questa v1.
- Formattazione data in italiano (es. "mar 17 set 2026, 18:32").

## 7. Criteri di accettazione

- [ ] Posso creare, modificare ed eliminare una scheda con lista di esercizi.
- [ ] Posso avviare un allenamento da una scheda e registrare peso + ripetizioni per più serie su ogni esercizio.
- [ ] Le serie vuote non vengono salvate; se un allenamento risulta completamente vuoto, non genera una voce nello storico.
- [ ] Ogni allenamento concluso appare nello storico con data, scheda usata e dettaglio serie/pesi/reps.
- [ ] Eliminare una scheda non altera le sessioni già presenti nello storico.
- [ ] I dati persistono tra chiusure e riaperture dell'app sullo stesso dispositivo/browser.
- [ ] L'interfaccia è usabile comodamente da telefono, con una mano, in un ambiente come una palestra (bottoni grandi, poco testo da digitare).
- [ ] L'app è installabile come PWA sulla home del telefono.

## 8. Fuori scope per questa versione

- Login/autenticazione multi-utente.
- Sincronizzazione dati tra più dispositivi.
- Statistiche/grafici di progressione nel tempo (potenziale iterazione futura).
- Timer di riposo tra le serie (potenziale iterazione futura).
