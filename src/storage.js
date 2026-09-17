const KEY = 'ghisa_data_v1'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function migrateEsercizio(e) {
  if (e.targets) return e
  const target = {
    serie: e.serieTarget ?? null,
    reps: e.repsTarget ?? null,
  }
  return { id: e.id, nome: e.nome, targets: [target] }
}

function migrateScheda(scheda) {
  const settimane = scheda.settimane ?? 1
  if (scheda.giorni) {
    return { id: scheda.id, nome: scheda.nome, settimane, giorni: scheda.giorni }
  }
  const esercizi = (scheda.esercizi || []).map(migrateEsercizio)
  return {
    id: scheda.id,
    nome: scheda.nome,
    settimane,
    giorni: [{ id: uid(), nome: 'Allenamento', esercizi }],
  }
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { schede: [], history: [] }
    const parsed = JSON.parse(raw)
    return {
      schede: Array.isArray(parsed.schede) ? parsed.schede.map(migrateScheda) : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    }
  } catch {
    return { schede: [], history: [] }
  }
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function loadSchede() {
  return readAll().schede
}

export function loadHistory() {
  return readAll().history
}

export function saveScheda(scheda) {
  const data = readAll()
  const idx = data.schede.findIndex((s) => s.id === scheda.id)
  if (idx >= 0) {
    data.schede[idx] = scheda
  } else {
    data.schede.push(scheda)
  }
  writeAll(data)
  return data.schede
}

export function deleteScheda(id) {
  const data = readAll()
  data.schede = data.schede.filter((s) => s.id !== id)
  writeAll(data)
  return data.schede
}

export function saveSessione(sessione) {
  const data = readAll()
  data.history.unshift(sessione)
  writeAll(data)
  return data.history
}

export function createId() {
  return uid()
}
