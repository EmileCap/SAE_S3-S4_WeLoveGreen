import { buildingTypes } from '@/data/buildingTypes.js'
import { copyMenu } from '@/data/menu.js'
import { cleanGuests, copyProgramme } from '@/data/programme.js'
import { hoursFrom } from '@/data/festival.js'
import { parseHours } from './hours.js'

// Le "brouillon" d'un bâtiment : ce que remplissent les formulaires (réservation, modification).
// Il contient les champs de tous les types ; changesFrom ne garde que ceux du type choisi.

export const emptyDraft = () => ({ description: '', opens: '', sells: '', style: '', needs: '', menu: [], programme: [] })

// Brouillon prérempli avec un bâtiment existant (copie : le bâtiment ne change pas avant l'enregistrement)
export const draftFrom = (b) => ({
    description: b.description ?? '',
    opens: parseHours(b.hours).opens, // la fermeture est celle du festival : elle ne se modifie pas
    sells: b.sells ?? '',
    style: b.style ?? '',
    needs: b.needs ?? '',
    menu: copyMenu(b.menu ?? []),
    programme: copyProgramme(b.programme ?? []),
})

// Ce qu'on envoie à addBuilding / updateBuilding : textes rognés, horaires assemblés, seulement les champs du type
export function changesFrom(draft, typeKey) {
    const type = buildingTypes[typeKey]
    const changes = {
        description: draft.description.trim(),
        hours: hoursFrom(draft.opens),
        sells: draft.sells.trim(),
    }
    for (const key of type.fields ?? []) changes[key] = draft[key].trim()
    if (type.hasMenu) {
        changes.menu = draft.menu.map((d) => ({ ...d, name: d.name.trim(), description: d.description.trim(), origin: d.origin.trim() }))
    }
    if (type.hasProgramme) {
        changes.programme = draft.programme.map(({ guests, ...s }) => ({
            ...s,
            title: s.title.trim(),
            description: s.description.trim(),
            ...(type.hasGuests ? { guests: cleanGuests(guests) } : {}), // les invités n'existent que pour les scènes qui en ont
        }))
    }
    return changes
}
