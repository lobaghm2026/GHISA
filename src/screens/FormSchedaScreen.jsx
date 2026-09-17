import { useState } from 'react'

const MAX_SETTIMANE = 8

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function targetVuoto() {
  return { serie: '', reps: '' }
}

function esercizioVuoto(nSettimane) {
  return {
    id: uid(),
    nome: '',
    targets: Array.from({ length: nSettimane }, () => targetVuoto()),
  }
}

function giornoVuoto(nSettimane) {
  return { id: uid(), nome: '', esercizi: [esercizioVuoto(nSettimane)] }
}

function esercizioDaScheda(e, nSettimane) {
  const targets = e.targets?.length
    ? e.targets.map((t) => ({
        serie: t.serie != null ? String(t.serie) : '',
        reps: t.reps != null ? String(t.reps) : '',
      }))
    : [targetVuoto()]
  while (targets.length < nSettimane) targets.push(targetVuoto())
  return { id: e.id, nome: e.nome, targets: targets.slice(0, nSettimane) }
}

function giornoDaScheda(g, nSettimane) {
  return {
    id: g.id,
    nome: g.nome,
    esercizi: g.esercizi?.length
      ? g.esercizi.map((e) => esercizioDaScheda(e, nSettimane))
      : [esercizioVuoto(nSettimane)],
  }
}

export default function FormSchedaScreen({ scheda, onSalva, onAnnulla }) {
  const isEdit = !!scheda
  const [nome, setNome] = useState(scheda?.nome ?? '')
  const [settimane, setSettimane] = useState(scheda?.settimane ?? 1)
  const [giorni, setGiorni] = useState(
    scheda?.giorni?.length
      ? scheda.giorni.map((g) => giornoDaScheda(g, scheda.settimane ?? 1))
      : [giornoVuoto(1)],
  )
  const [touched, setTouched] = useState(false)

  const giorniValidi = giorni
    .map((g) => ({ ...g, esercizi: g.esercizi.filter((e) => e.nome.trim() !== '') }))
    .filter((g) => g.nome.trim() !== '' && g.esercizi.length > 0)
  const isValid = nome.trim() !== '' && giorniValidi.length > 0

  function updateGiornoNome(giornoId, value) {
    setGiorni((prev) => prev.map((g) => (g.id === giornoId ? { ...g, nome: value } : g)))
  }

  function addGiorno() {
    setGiorni((prev) => [...prev, giornoVuoto(settimane)])
  }

  function removeGiorno(giornoId) {
    setGiorni((prev) => prev.filter((g) => g.id !== giornoId))
  }

  function updateEsercizioNome(giornoId, esId, value) {
    setGiorni((prev) =>
      prev.map((g) =>
        g.id === giornoId
          ? { ...g, esercizi: g.esercizi.map((e) => (e.id === esId ? { ...e, nome: value } : e)) }
          : g,
      ),
    )
  }

  function updateTarget(giornoId, esId, weekIdx, field, value) {
    setGiorni((prev) =>
      prev.map((g) =>
        g.id === giornoId
          ? {
              ...g,
              esercizi: g.esercizi.map((e) =>
                e.id === esId
                  ? {
                      ...e,
                      targets: e.targets.map((t, i) =>
                        i === weekIdx ? { ...t, [field]: value } : t,
                      ),
                    }
                  : e,
              ),
            }
          : g,
      ),
    )
  }

  function addEsercizio(giornoId) {
    setGiorni((prev) =>
      prev.map((g) =>
        g.id === giornoId ? { ...g, esercizi: [...g.esercizi, esercizioVuoto(settimane)] } : g,
      ),
    )
  }

  function removeEsercizio(giornoId, esId) {
    setGiorni((prev) =>
      prev.map((g) =>
        g.id === giornoId ? { ...g, esercizi: g.esercizi.filter((e) => e.id !== esId) } : g,
      ),
    )
  }

  function addSettimana() {
    if (settimane >= MAX_SETTIMANE) return
    setSettimane((n) => n + 1)
    setGiorni((prev) =>
      prev.map((g) => ({
        ...g,
        esercizi: g.esercizi.map((e) => ({ ...e, targets: [...e.targets, targetVuoto()] })),
      })),
    )
  }

  function removeSettimana() {
    if (settimane <= 1) return
    setSettimane((n) => n - 1)
    setGiorni((prev) =>
      prev.map((g) => ({
        ...g,
        esercizi: g.esercizi.map((e) => ({ ...e, targets: e.targets.slice(0, -1) })),
      })),
    )
  }

  function handleSalva() {
    setTouched(true)
    if (!isValid) return
    onSalva({
      id: scheda?.id ?? uid(),
      nome: nome.trim(),
      settimane,
      giorni: giorniValidi.map((g) => ({
        id: g.id,
        nome: g.nome.trim(),
        esercizi: g.esercizi.map((e) => ({
          id: e.id,
          nome: e.nome.trim(),
          targets: e.targets.map((t) => ({
            serie: t.serie.trim() === '' ? null : parseInt(t.serie, 10),
            reps: t.reps.trim() === '' ? null : parseInt(t.reps, 10),
          })),
        })),
      })),
    })
  }

  return (
    <div>
      <div className="top-bar">
        <div className="page-title">{isEdit ? 'Modifica scheda' : 'Nuova scheda'}</div>
      </div>

      <div className="field">
        <label htmlFor="nome-scheda">Nome scheda</label>
        <input
          id="nome-scheda"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="es. Scheda A"
        />
        {touched && nome.trim() === '' && (
          <p style={{ color: 'var(--danger-text)', fontSize: 13, marginTop: 6 }}>
            Il nome della scheda non può essere vuoto.
          </p>
        )}
      </div>

      <div className="field">
        <label>Settimane della scheda</label>
        <div className="week-stepper">
          <button
            className="icon-btn"
            onClick={removeSettimana}
            disabled={settimane <= 1}
            aria-label="Rimuovi settimana"
          >
            −
          </button>
          <span className="week-stepper-value">
            {settimane} {settimane === 1 ? 'settimana' : 'settimane'}
          </span>
          <button
            className="icon-btn"
            onClick={addSettimana}
            disabled={settimane >= MAX_SETTIMANE}
            aria-label="Aggiungi settimana"
          >
            +
          </button>
        </div>
        <p className="card-meta" style={{ marginTop: 6, marginBottom: 0 }}>
          Se serie/reps variano di settimana in settimana, aggiungi più settimane e imposta un
          target diverso per ciascuna.
        </p>
      </div>

      <div className="field">
        <label>Allenamenti della scheda</label>
        {giorni.map((giorno) => (
          <div className="card giorno-card" key={giorno.id}>
            <div className="exercise-row">
              <input
                type="text"
                value={giorno.nome}
                onChange={(e) => updateGiornoNome(giorno.id, e.target.value)}
                placeholder="es. Giorno 1 — Petto e tricipiti"
              />
              <button
                className="icon-btn"
                onClick={() => removeGiorno(giorno.id)}
                aria-label="Rimuovi allenamento"
              >
                ×
              </button>
            </div>

            {giorno.esercizi.map((es) => (
              <div className="exercise-group" key={es.id}>
                <div className="exercise-row">
                  <input
                    type="text"
                    value={es.nome}
                    onChange={(e) => updateEsercizioNome(giorno.id, es.id, e.target.value)}
                    placeholder="Nome esercizio"
                  />
                  <button
                    className="icon-btn"
                    onClick={() => removeEsercizio(giorno.id, es.id)}
                    aria-label="Rimuovi esercizio"
                  >
                    ×
                  </button>
                </div>
                {es.targets.map((t, weekIdx) => (
                  <div className="exercise-target-row" key={weekIdx}>
                    {settimane > 1 && (
                      <span className="exercise-target-week">Sett. {weekIdx + 1}</span>
                    )}
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={t.serie}
                      onChange={(e) =>
                        updateTarget(giorno.id, es.id, weekIdx, 'serie', e.target.value)
                      }
                      placeholder="serie"
                    />
                    <span className="exercise-target-x">×</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={t.reps}
                      onChange={(e) =>
                        updateTarget(giorno.id, es.id, weekIdx, 'reps', e.target.value)
                      }
                      placeholder="reps"
                    />
                    {settimane === 1 && (
                      <span className="exercise-target-hint">target (opzionale)</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <button className="add-set-btn" onClick={() => addEsercizio(giorno.id)}>
              + Aggiungi esercizio
            </button>
          </div>
        ))}
        <button className="add-set-btn" onClick={addGiorno} style={{ marginTop: 4 }}>
          + Aggiungi allenamento
        </button>
        {touched && giorniValidi.length === 0 && (
          <p style={{ color: 'var(--danger-text)', fontSize: 13, marginTop: 6 }}>
            Aggiungi almeno un allenamento con nome e almeno un esercizio.
          </p>
        )}
      </div>

      <div className="session-footer">
        <button className="btn btn-accent btn-block" onClick={handleSalva}>
          Salva
        </button>
        <button className="btn btn-secondary btn-block" onClick={onAnnulla}>
          Annulla
        </button>
      </div>
    </div>
  )
}
