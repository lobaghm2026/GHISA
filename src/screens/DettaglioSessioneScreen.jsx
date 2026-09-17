import { formatDataIt } from '../utils'

export default function DettaglioSessioneScreen({ sessione, onIndietro }) {
  return (
    <div>
      <div className="top-bar">
        <div>
          <div className="page-title" style={{ marginBottom: 2 }}>
            {sessione.giornoNome ? `${sessione.schedaNome} — ${sessione.giornoNome}` : sessione.schedaNome}
          </div>
          <p className="card-meta" style={{ margin: 0 }}>{formatDataIt(sessione.data)}</p>
        </div>
      </div>

      {sessione.esercizi.map((es, i) => (
        <div className="exercise-block" key={i}>
          <p className="exercise-block-title">{es.nome}</p>
          <div className="detail-set-list">
            {es.serie.map((s, idx) => (
              <span className="detail-set-chip" key={idx}>
                {idx + 1}. {s.peso ?? '—'} kg × {s.reps ?? '—'}
              </span>
            ))}
          </div>
        </div>
      ))}

      <button className="btn btn-secondary btn-block" onClick={onIndietro}>
        Torna allo storico
      </button>
    </div>
  )
}
