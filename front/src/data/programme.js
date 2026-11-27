import { formatHours } from '@/utils/hours.js'
import { photoProblem } from '@/utils/photo.js'

// Programme d'une scène : une liste de créneaux.
// Un créneau = { id, title, day, start, end, description }
//   title       : l'artiste, le spectacle ou la conférence
//   day         : le jour, "AAAA-MM-JJ" (la valeur d'un champ <input type="date">)
//   start, end  : les heures, "HH:MM" (la valeur d'un champ <input type="time">) ;
//                 end plus petit que start = le créneau finit après minuit
//   description : une ligne de présentation (peut être vide)
//   guests      : seulement pour les scènes qui ont des intervenants invités (Think Talk) :
//                 une liste de { id, name, role, photo } (role = fonction ou organisation, peut être vide ;
//                 photo = « data:image/... » voir utils/photo.js, vide ou absente = pas de photo)

let slotCount = 0
let guestCount = 0

// Un intervenant invité vide, prêt à être rempli dans le formulaire
export function newGuest() {
    guestCount += 1
    return { id: `invite-${Date.now().toString(36)}-${guestCount}`, name: '', role: '', photo: '' }
}

// Un créneau vide, prêt à être rempli dans le formulaire. Plus tard : le serveur créera l'id.
export function newSlot() {
    slotCount += 1
    return { id: `creneau-${Date.now().toString(36)}-${slotCount}`, title: '', day: '', start: '', end: '', description: '', guests: [] }
}

// Copie indépendante (le formulaire modifie la copie, pas le bâtiment, tant qu'on n'a pas enregistré)
export const copyProgramme = (programme) => programme.map((slot) => ({
    ...slot,
    ...(slot.guests ? { guests: slot.guests.map((guest) => ({ ...guest })) } : {}),
}))

// Les invités d'un créneau tels qu'on les enregistre : textes rognés, lignes sans nom retirées
export const cleanGuests = (guests = []) =>
    guests.map((g) => ({ ...g, name: g.name.trim(), role: g.role.trim() })).filter((g) => g.name)

// "Claire Mercier" + "Hydrologue" -> "Claire Mercier (Hydrologue)"
export const guestLabel = (guest) => (guest.role ? `${guest.name} (${guest.role})` : guest.name)

const isTime = (t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t ?? '')

// "2027-02-31" n'existe pas : on vérifie que la date lue est bien celle écrite
function isDay(day) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day ?? '')) return false
    const date = new Date(`${day}T00:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === day
}

// Renvoie le premier problème d'un créneau (texte à afficher), ou null s'il est valide
export function slotProblem(slot) {
    const title = slot.title?.trim()
    if (!title) return 'Chaque créneau doit avoir un titre.'
    if (!isDay(slot.day)) return `Jour invalide pour « ${title} ».`
    if (!isTime(slot.start) || !isTime(slot.end)) return `Horaire invalide pour « ${title} ».`
    if (slot.start === slot.end) return `Le début et la fin de « ${title} » sont identiques.`
    if (slot.guests?.some((g) => !g.name?.trim())) return `Un intervenant invité de « ${title} » n'a pas de nom.`
    if (slot.guests?.some((g) => photoProblem(g.photo))) return `Photo invalide pour un intervenant de « ${title} ».`
    return null
}

// "2027-06-04" -> "Vendredi 4 juin" (midi : évite tout décalage dû au fuseau horaire)
function formatDay(day) {
    const text = new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    return text.charAt(0).toUpperCase() + text.slice(1)
}

// "20:00" + "21:30" -> "20h00 – 21h30"
export const formatSlotTime = (slot) => formatHours(slot.start, slot.end)

// Le programme regroupé par jour, dans l'ordre : [{ day, label, slots }]
export function programmeByDay(programme) {
    const sorted = [...programme].sort((a, b) => a.day.localeCompare(b.day) || a.start.localeCompare(b.start))
    const days = []
    for (const slot of sorted) {
        let group = days.at(-1)
        if (group?.day !== slot.day) {
            group = { day: slot.day, label: formatDay(slot.day), slots: [] }
            days.push(group)
        }
        group.slots.push(slot)
    }
    return days
}
