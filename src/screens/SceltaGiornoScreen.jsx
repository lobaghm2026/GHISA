export default function SceltaGiornoScreen({ scheda, onScegli, onIndietro }) {
  return (
    <div>
      <div className="top-bar">
        <div>
          <div className="page-title" style={{ marginBottom: 2 }}>
            {scheda.nome}
          </div>
          <p className="card-meta" style={{ margin: 0 }}>Scegli l'allenamento da iniziare</p>
        </div>
      </div>

      {scheda.giorni.map((giorno) => (
        <div className="card" key={giorno.id}>
          <p className="card-title">{giorno.nome}</p>
          <p className="card-meta">
            {giorno.esercizi.length} {giorno.esercizi.length === 1 ? 'esercizio' : 'esercizi'}
          </p>
          <div className="card-actions">
            <button className="btn btn-accent btn-sm" onClick={() => onScegli(giorno)}>
              Inizia
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-secondary btn-block" style={{ marginTop: 16 }} onClick={onIndietro}>
        Indietro
      </button>
    </div>
  )
}
