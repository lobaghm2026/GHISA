import { useState } from 'react'

function serieVuota(id) {
  return { id, peso: '', reps: '' }
}

export default function AllenamentoScreen({ scheda, giorno, onTermina, onAnnulla, createId }) {
  const [serieByEsercizio, setSerieByEsercizio] = useState(() => {
    const initial = {}
    for (const es of giorno.esercizi) {
      initial[es.id] = [serieVuota(createId())]
    }
    return initial
  })
  const [confirmAnnulla, setConfirmAnnulla] = useState(false)
  const nSettimane = scheda.settimane ?? 1
  const [settimana, setSettimana] = useState(1)

  function updateSerie(esercizioId, serieId, field, value) {
    setSerieByEsercizio((prev) => ({
      ...prev,
      [esercizioId]: prev[esercizioId].map((s) =>
        s.id === serieId ? { ...s, [field]: value } : s,
      ),
    }))
  }

  function addSerie(esercizioId) {
    setSerieByEsercizio((prev) => ({
      ...prev,
      [esercizioId]: [...prev[esercizioId], serieVuota(createId())],
    }))
  }

  function removeSerie(esercizioId, serieId) {
    setSerieByEsercizio((prev) => ({
      ...prev,
      [esercizioId]: prev[esercizioId].filter((s) => s.id !== serieId),
    }))
  }

  function handleTermina() {
    const esercizi = giorno.esercizi
      .map((es) => {
        const serie = (serieByEsercizio[es.id] || [])
          .filter((s) => s.peso !== '' || s.reps !== '')
          .map((s) => ({
            peso: s.peso === '' ? null : parseFloat(s.peso),
            reps: s.reps === '' ? null : parseInt(s.reps, 10),
          }))
        return { nome: es.nome, serie }
      })
      .filter((es) => es.serie.length > 0)

    if (esercizi.length === 0) {
      setConfirmAnnulla(false)
      onAnnulla()
      return
    }

    onTermina({
      id: createId(),
      schedaId: scheda.id,
      schedaNome: scheda.nome,
      giornoNome: giorno.nome,
      data: Date.now(),
      esercizi,
    })
  }

  return (
    <div>
      <div className="session-header">
        <div className="page-title" style={{ marginBottom: 2 }}>
          {giorno.nome}
        </div>
        <p className="card-meta" style={{ margin: 0 }}>{scheda.nome} · Allenamento in corso</p>
      </div>

      {nSettimane > 1 && (
        <div className="week-selector">
          {Array.from({ length: nSettimane }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`week-chip${settimana === n ? ' active' : ''}`}
              onClick={() => setSettimana(n)}
            >
              Sett. {n}
            </button>
          ))}
        </div>
      )}

      {giorno.esercizi.map((es) => {
        const target = es.targets?.[settimana - 1]
        return (
        <div className="exercise-block" key={es.id}>
          <p className="exercise-block-title">{es.nome}</p>
          {target && (target.serie != null || target.reps != null) && (
            <p className="card-meta" style={{ marginTop: -6 }}>
              Target: {target.serie ?? '—'} × {target.reps ?? '—'}
            </p>
          )}
          {(serieByEsercizio[es.id] || []).map((serie, idx) => (
            <div className="set-row" key={serie.id}>
              <span className="set-index">{idx + 1}</span>
              <input
                className="set-input"
                type="number"
                inputMode="decimal"
                step="0.5"
                placeholder="peso"
                value={serie.peso}
                onChange={(e) => updateSerie(es.id, serie.id, 'peso', e.target.value)}
              />
              <span className="set-unit">kg</span>
              <input
                className="set-input"
                type="number"
                inputMode="numeric"
                step="1"
                placeholder="reps"
                value={serie.reps}
                onChange={(e) => updateSerie(es.id, serie.id, 'reps', e.target.value)}
              />
              <button
                className="icon-btn"
                onClick={() => removeSerie(es.id, serie.id)}
                aria-label="Rimuovi serie"
              >
                ×
              </button>
            </div>
          ))}
          <button className="add-set-btn" onClick={() => addSerie(es.id)}>
            + Aggiungi serie
          </button>
        </div>
        )
      })}

      <div className="session-footer">
        <button className="btn btn-accent btn-block" onClick={handleTermina}>
          Termina allenamento
        </button>
        <button className="btn btn-secondary btn-block" onClick={() => setConfirmAnnulla(true)}>
          Annulla allenamento
        </button>

        {confirmAnnulla && (
          <div className="confirm-box">
            <p>Uscire senza salvare questo allenamento?</p>
            <div className="confirm-actions">
              <button className="btn btn-danger btn-sm" onClick={onAnnulla}>
                Sì, esci
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setConfirmAnnulla(false)}>
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
