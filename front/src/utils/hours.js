// Les horaires sont stockés en texte ("18h00 – 02h00"), les formulaires utilisent des champs "time" ("18:00").

// "18:30" -> 1110 (minutes depuis minuit)
export const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
}

// "18:00" -> "18h00"
const formatTime = (t) => t.replace(':', 'h')

export const formatHours = (opens, closes) => `${formatTime(opens)} – ${formatTime(closes)}`

// Un bâtiment aux horaires "18h00 – 02h00" est-il ouvert à l'heure `hour` (un nombre : 19 = 19h00) ?
// Une fermeture qui n'est pas après l'ouverture tombe le lendemain (02h00 après 18h00).
export function isOpenAt(hours, hour) {
    const { opens, closes } = parseHours(hours)
    if (!opens) return false
    const start = toMinutes(opens)
    let end = toMinutes(closes)
    if (end <= start) end += 1440
    const t = hour * 60
    return (t >= start && t < end) || (t + 1440 >= start && t + 1440 < end)
}

// "18h00 – 02h00" -> { opens: '18:00', closes: '02:00' } (champs vides si le texte n'a pas ce format)
export function parseHours(hours) {
    const m = /^(\d{2})h(\d{2}) – (\d{2})h(\d{2})$/.exec(hours ?? '')
    return m ? { opens: `${m[1]}:${m[2]}`, closes: `${m[3]}:${m[4]}` } : { opens: '', closes: '' }
}
