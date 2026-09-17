import { useState } from 'react'

export default function SchedeScreen({ schede, onNuova, onModifica, onElimina, onInizia }) {
  const [confirmId, setConfirmId] = useState(null)

  return (
    <div>
      <div className="top-bar">
        <div>
          <h1 className="wordmark">Ghisa</h1>
          <div className="page-title" style={{ margin: 0, fontSize: 16, color: 'var(--text-muted)', fontWeight: 500 }}>
            Le tue schede
          </div>
        </div>
        <button className="btn btn-accent" onClick={onNuova}>
          + Nuova
        </button>
      </div>

      {schede.length === 0 && (
        <div className="empty-state">
          Non hai ancora nessuna scheda. Creane una per iniziare a registrare i tuoi allenamenti.
        </div>
      )}

      {schede.map((scheda) => (
        <div className="card" key={scheda.id}>
          <p className="card-title">{scheda.nome}</p>
          <p className="card-meta">
            {scheda.giorni.length} {scheda.giorni.length === 1 ? 'allenamento' : 'allenamenti'}
            {scheda.settimane > 1 ? ` · ${scheda.settimane} settimane` : ''}
          </p>
          <div className="card-actions">
            <button className="btn btn-accent btn-sm" onClick={() => onInizia(scheda)}>
              Inizia
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onModifica(scheda)}>
              Modifica
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setConfirmId(scheda.id)}
            >
              Elimina
            </button>
          </div>

          {confirmId === scheda.id && (
            <div className="confirm-box">
              <p>Eliminare questa scheda?</p>
              <div className="confirm-actions">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    onElimina(scheda.id)
                    setConfirmId(null)
                  }}
                >
                  Sì, elimina
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setConfirmId(null)}>
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
