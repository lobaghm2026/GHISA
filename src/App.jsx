import { useState, useEffect, useCallback } from 'react'
import { loadSchede, loadHistory, saveScheda, deleteScheda, saveSessione, createId } from './storage'
import SchedeScreen from './screens/SchedeScreen'
import FormSchedaScreen from './screens/FormSchedaScreen'
import SceltaGiornoScreen from './screens/SceltaGiornoScreen'
import AllenamentoScreen from './screens/AllenamentoScreen'
import StoricoScreen from './screens/StoricoScreen'
import DettaglioSessioneScreen from './screens/DettaglioSessioneScreen'
import BottomNav from './components/BottomNav'

export default function App() {
  const [schede, setSchede] = useState([])
  const [history, setHistory] = useState([])
  const [view, setView] = useState({ name: 'schede' })

  useEffect(() => {
    setSchede(loadSchede())
    setHistory(loadHistory())
  }, [])

  const handleSaveScheda = useCallback((scheda) => {
    const updated = saveScheda(scheda)
    setSchede(updated)
    setView({ name: 'schede' })
  }, [])

  const handleDeleteScheda = useCallback((id) => {
    const updated = deleteScheda(id)
    setSchede(updated)
  }, [])

  const handleSaveSessione = useCallback((sessione) => {
    const updated = saveSessione(sessione)
    setHistory(updated)
    setView({ name: 'schede' })
  }, [])

  const showNav = view.name === 'schede' || view.name === 'storico'

  let content = null
  if (view.name === 'schede') {
    content = (
      <SchedeScreen
        schede={schede}
        onNuova={() => setView({ name: 'formScheda', scheda: null })}
        onModifica={(scheda) => setView({ name: 'formScheda', scheda })}
        onElimina={handleDeleteScheda}
        onInizia={(scheda) =>
          scheda.giorni.length === 1
            ? setView({ name: 'allenamento', scheda, giorno: scheda.giorni[0] })
            : setView({ name: 'sceltaGiorno', scheda })
        }
      />
    )
  } else if (view.name === 'sceltaGiorno') {
    content = (
      <SceltaGiornoScreen
        scheda={view.scheda}
        onScegli={(giorno) => setView({ name: 'allenamento', scheda: view.scheda, giorno })}
        onIndietro={() => setView({ name: 'schede' })}
      />
    )
  } else if (view.name === 'formScheda') {
    content = (
      <FormSchedaScreen
        scheda={view.scheda}
        onSalva={handleSaveScheda}
        onAnnulla={() => setView({ name: 'schede' })}
      />
    )
  } else if (view.name === 'allenamento') {
    content = (
      <AllenamentoScreen
        scheda={view.scheda}
        giorno={view.giorno}
        onTermina={handleSaveSessione}
        onAnnulla={() => setView({ name: 'schede' })}
        createId={createId}
      />
    )
  } else if (view.name === 'storico') {
    content = (
      <StoricoScreen
        history={history}
        onApri={(sessione) => setView({ name: 'dettaglioSessione', sessione })}
      />
    )
  } else if (view.name === 'dettaglioSessione') {
    content = (
      <DettaglioSessioneScreen
        sessione={view.sessione}
        onIndietro={() => setView({ name: 'storico' })}
      />
    )
  }

  return (
    <div className="app">
      <div className={`screen${showNav ? ' with-nav' : ''}`}>{content}</div>
      {showNav && (
        <BottomNav
          active={view.name}
          onSchede={() => setView({ name: 'schede' })}
          onStorico={() => setView({ name: 'storico' })}
        />
      )}
    </div>
  )
}
