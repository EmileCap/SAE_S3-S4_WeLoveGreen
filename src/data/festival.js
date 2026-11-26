import { formatHours, toMinutes } from '@/utils/hours.js'

// Les horaires du festival, définis à un seul endroit.
// La fermeture est imposée : un prestataire choisit seulement son heure d'ouverture (entre l'ouverture
// et la fermeture du festival), et son bâtiment ferme en même temps que le festival.
// La fermeture à 02:00 tombe "le lendemain" : le festival dure de 11:00 à 02:00 du matin.
export const festival = { opens: '11:00', closes: '02:00' }

const isTime = (t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t ?? '')

// Minutes écoulées depuis l'ouverture du festival (02:00 -> 900, soit 15 h après 11:00)
const sinceOpening = (t) => (toMinutes(t) - toMinutes(festival.opens) + 1440) % 1440

// Les horaires d'un bâtiment à partir de son heure d'ouverture : "18:00" -> "18h00 – 02h00"
export const hoursFrom = (opens) => formatHours(opens, festival.closes)

// Premier problème d'une heure d'ouverture (texte à afficher), ou null si elle est valide
function opensProblem(opens) {
    if (!isTime(opens)) return "L'heure d'ouverture est invalide."
    if (sinceOpening(opens) >= sinceOpening(festival.closes)) {
        return `Le bâtiment doit ouvrir pendant le festival, entre ${festival.opens.replace(':', 'h')} et ${festival.closes.replace(':', 'h')}.`
    }
    return null
}

// Vérifie des horaires "18h00 – 02h00" : l'ouverture est dans le festival et la fermeture est celle du festival
export function hoursProblem(hours) {
    const m = /^(\d{2})h(\d{2}) – (\d{2})h(\d{2})$/.exec(hours ?? '')
    if (!m) return 'Les horaires sont invalides.'
    if (`${m[3]}:${m[4]}` !== festival.closes) return `La fermeture est celle du festival : ${festival.closes.replace(':', 'h')}.`
    return opensProblem(`${m[1]}:${m[2]}`)
}
