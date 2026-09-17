# GHISA — Specifica per implementazione

Web app mobile-first per registrare gli allenamenti in palestra: schede composte da uno o più allenamenti (giorni), ciascuno con la propria lista di esercizi, target di serie/ripetizioni (anche variabili di settimana in settimana), pesi/ripetizioni usati per ogni serie realmente fatta, e storico completo delle sessioni fatte. Uso personale, single-user, nessun login.

Questo documento è pensato per essere passato a Claude Code (o altro agente/dev) per implementare l'app da zero come progetto standalone (non più come artifact "Design").

## 1. Obiettivo e contesto d'uso

- L'utente usa l'app dal telefono, in palestra, per segnare in tempo reale i pesi e le ripetizioni fatte durante l'allenamento.
- Deve poter rivedere lo storico degli allenamenti passati per confrontare i progressi (es. "quanto ho fatto la volta scorsa su panca piana?").
- Un programma di allenamento ("scheda") è tipicamente diviso in più giornate diverse (es. "Giorno 1 — Petto e tricipiti", "Giorno 2 — Schiena e bicipiti") che si ripetono a rotazione, e il volume di lavoro (serie/ripetizioni target) può cambiare di settimana in settimana anche restando sullo stesso esercizio (es. settimana 1: 3×10, settimana 2: 4×8).
- Nessun account, nessun backend richiesto: è uno strumento personale.
- Priorità: velocità d'uso con una mano, touch target grandi, poco testo da digitare durante l'allenamento.

## 2. Funzionalità principali

### 2.1 Gestione Schede
Una **scheda** è un programma di allenamento con un nome (es. "Scheda A") e contiene uno o più **allenamenti** (giorni), ognuno con la propria lista di esercizi.

- Creare una nuova scheda:
  - nome scheda
  - numero di settimane della scheda (1–8): definisce quante varianti di target serie/reps può avere ogni esercizio, per gestire la progressione o le variazioni di volume nel tempo.
  - uno o più **allenamenti** (giorni), ciascuno con:
    - nome libero (es. "Giorno 1 — Petto e tricipiti")
    - lista di esercizi (nome libero per ciascuno)
    - per ogni esercizio, un target opzionale di serie × ripetizioni **per ciascuna settimana** della scheda (es. se la scheda ha 3 settimane, l'esercizio ha 3 target indipendenti, uno per settimana).
- Modificare una scheda esistente (rinominarla, cambiare numero di settimane, aggiungere/rimuovere allenamenti ed esercizi, modificare i target).
- Eliminare una scheda (con conferma, perché azione distruttiva). Eliminare una scheda **non** deve modificare le sessioni già registrate nello storico (i dati storici sono indipendenti/denormalizzati).
- Validazione minima per poter salvare: nome scheda non vuoto, almeno 1 allenamento con nome non vuoto e almeno 1 esercizio al suo interno. I target di serie/reps sono sempre opzionali.
- Stato vuoto: se non ci sono schede, mostrare un messaggio invece di una lista vuota.

### 2.2 Avvio e sessione di allenamento
Avviata scegliendo una scheda esistente ("Inizia").

- Se la scheda ha un solo allenamento (giorno), la sessione parte direttamente su quello.
- Se la scheda ha più allenamenti, l'utente sceglie prima quale allenamento fare da una schermata dedicata.
- Se la scheda ha più di una settimana, durante l'allenamento è visibile un selettore (chip "Sett. 1", "Sett. 2", ...) per scegliere manualmente la settimana corrente; il target serie×reps mostrato per ogni esercizio si aggiorna in base alla settimana selezionata, come semplice riferimento (non vincolante).
- Per ogni esercizio dell'allenamento scelto, l'utente aggiunge una o più **serie**; ogni serie ha:
  - peso usato (kg, numerico, decimali ammessi es. 0.5)
  - ripetizioni fatte (numero intero)
- Deve essere possibile aggiungere più serie per esercizio e rimuovere una serie inserita per errore.
- "Termina allenamento": salva la sessione nello storico con data/ora corrente. Le serie lasciate completamente vuote (senza peso né reps) vengono scartate automaticamente; se dopo lo scarto non resta nulla da salvare, la sessione non viene salvata (si torna semplicemente alla home senza creare una voce nello storico).
- "Annulla allenamento": esce senza salvare, con una conferma intermedia per evitare perdite accidentali.

### 2.3 Storico allenamenti
- Lista delle sessioni passate, più recente in alto, con: nome scheda + nome allenamento (giorno) usato, data/ora, riepilogo (numero esercizi e numero serie totali).
- Stato vuoto se non ci sono ancora allenamenti registrati.
- Dettaglio sessione: aprendo una sessione dallo storico si vede, per ogni esercizio, l'elenco delle serie fatte con peso e ripetizioni.

## 3. Modello dati

```ts
type TargetSettimana = {
  serie: number | null;
  reps: number | null;
};

type Esercizio = {
  id: string;
  nome: string;
  targets: TargetSettimana[];  // un elemento per ciascuna settimana della scheda, tutti opzionali
};

type Allenamento = {
  id: string;
  nome: string;        // es. "Giorno 1 — Petto e tricipiti"
  esercizi: Esercizio[];
};

type Scheda = {
  id: string;
  nome: string;
  settimane: number;   // 1-8, numero di varianti di target per esercizio
  giorni: Allenamento[];
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
  schedaId: string;     // riferimento informativo, la scheda potrebbe essere stata eliminata dopo
  schedaNome: string;    // copiato al momento della sessione
  giornoNome: string;    // nome dell'allenamento (giorno) svolto, copiato al momento della sessione
  data: number;          // timestamp ms
  esercizi: EsercizioStorico[];
};
```

Persistenza consigliata per la v1: `localStorage`, con un'unica chiave (es. `ghisa_data_v1`) contenente `{ schede: Scheda[], history: SessioneStorico[] }`. Nessun backend richiesto in questa fase; se in futuro si vorrà sincronizzare tra dispositivi, andrà introdotto uno storage remoto (fuori scope per questa v1).

Compatibilità: dati salvati con versioni precedenti del modello (esercizi con `serieTarget`/`repsTarget` singoli, o schede senza `giorni`) vengono migrati automaticamente alla lettura, incapsulando gli esercizi in un unico allenamento e convertendo il target singolo in un array `targets` di lunghezza 1, senza perdita di dati.

## 4. Flussi di navigazione

```
Schede (home)
 ├─ + Nuova scheda -> Form scheda (crea: nome, settimane, allenamenti+esercizi+target) -> Salva -> torna a Schede
 ├─ Modifica (su una scheda) -> Form scheda (edit) -> Salva -> torna a Schede
 ├─ Elimina (su una scheda) -> conferma inline -> torna a Schede
 └─ Inizia (su una scheda)
      ├─ se 1 solo allenamento -> Allenamento (diretto)
      └─ se più allenamenti -> Scelta allenamento -> Allenamento
           Allenamento
            ├─ selettore settimana (solo se scheda multi-settimana)
            ├─ Aggiungi serie per esercizio (ripetibile)
            ├─ Rimuovi serie
            ├─ Annulla allenamento -> conferma -> torna a Schede
            └─ Termina allenamento -> salva in storico -> torna a Schede

Storico
 └─ tap su una sessione -> Dettaglio sessione -> torna a Storico
```

Navigazione principale a due sezioni: **Schede** e **Storico**, raggiungibili da una bottom nav sempre visibile eccetto durante una sessione di allenamento attiva, la scelta dell'allenamento, o mentre si compila il form di una scheda (schermate "a fuoco" senza distrazioni).

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

- [x] Posso creare, modificare ed eliminare una scheda, definendo uno o più allenamenti (giorni) al suo interno, ciascuno con la propria lista di esercizi.
- [x] Posso impostare per ogni esercizio un target opzionale di serie × ripetizioni, e — se la scheda ha più settimane — un target diverso per ciascuna settimana.
- [x] Se una scheda ha più allenamenti, avviandola scelgo prima quale allenamento fare; se ne ha uno solo, parte direttamente.
- [x] Durante l'allenamento posso registrare peso + ripetizioni per più serie su ogni esercizio, e se la scheda è multi-settimana posso selezionare la settimana corrente per vedere il target di riferimento.
- [x] Le serie vuote non vengono salvate; se un allenamento risulta completamente vuoto, non genera una voce nello storico.
- [x] Ogni allenamento concluso appare nello storico con data, scheda e allenamento (giorno) usato, e dettaglio serie/pesi/reps.
- [x] Eliminare una scheda non altera le sessioni già presenti nello storico.
- [x] I dati persistono tra chiusure e riaperture dell'app sullo stesso dispositivo/browser.
- [x] Le schede salvate con versioni precedenti del modello dati vengono migrate automaticamente senza perdita di dati.
- [x] L'interfaccia è usabile comodamente da telefono, con una mano, in un ambiente come una palestra (bottoni grandi, poco testo da digitare).
- [x] L'app è installabile come PWA sulla home del telefono.

## 8. Fuori scope per questa versione

- Login/autenticazione multi-utente.
- Sincronizzazione dati tra più dispositivi.
- Statistiche/grafici di progressione nel tempo (potenziale iterazione futura).
- Timer di riposo tra le serie (potenziale iterazione futura).
- Calcolo/suggerimento automatico della settimana corrente in base allo storico (per ora la selezione della settimana durante l'allenamento è sempre manuale).
