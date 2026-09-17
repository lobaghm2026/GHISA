import { formatDataIt } from '../utils'

export default function StoricoScreen({ history, onApri }) {
  return (
    <div>
      <div className="top-bar">
        <div className="page-title">Storico</div>
      </div>

      {history.length === 0 && (
        <div className="empty-state">Non hai ancora registrato nessun allenamento.</div>
      )}

      {history.map((sessione) => {
        const numEsercizi = sessione.esercizi.length
        const numSerie = sessione.esercizi.reduce((acc, e) => acc + e.serie.length, 0)
        return (
          <button
            key={sessione.id}
            className="card"
            style={{
              width: '100%',
              textAlign: 'left',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
            }}
            onClick={() => onApri(sessione)}
          >
            <p className="card-title">
              {sessione.giornoNome ? `${sessione.schedaNome} — ${sessione.giornoNome}` : sessione.schedaNome}
            </p>
            <p className="card-meta" style={{ marginBottom: 0 }}>
              {formatDataIt(sessione.data)}
              <br />
              {numEsercizi} {numEsercizi === 1 ? 'esercizio' : 'esercizi'} · {numSerie}{' '}
              {numSerie === 1 ? 'serie' : 'serie'}
            </p>
          </button>
        )
      })}
    </div>
  )
}
