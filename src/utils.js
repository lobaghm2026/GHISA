export function formatDataIt(ts) {
  const d = new Date(ts)
  const giorni = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
  const mesi = [
    'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
    'lug', 'ago', 'set', 'ott', 'nov', 'dic',
  ]
  const giorno = giorni[d.getDay()]
  const num = d.getDate()
  const mese = mesi[d.getMonth()]
  const anno = d.getFullYear()
  const ore = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${giorno} ${num} ${mese} ${anno}, ${ore}:${min}`
}
