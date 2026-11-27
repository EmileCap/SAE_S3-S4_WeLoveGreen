import { buildingTypes } from './buildingTypes.js'

// Champs propres à certains types de bâtiment (la liste de chaque type est buildingTypes[type].fields).
// multiline : zone de texte | public : false = visible seulement par le gestionnaire et le prestataire
// propriétaire, jamais dans le panneau d'infos vu par le public.
export const extraFields = {
    style: { label: 'Style / genre', placeholder: 'ex. Électro, stand-up, exposition…', multiline: false, public: true },
    needs: { label: 'Besoins techniques', placeholder: 'ex. Son et lumière, 2 prises 16 A…', multiline: true, public: false },
}

// Les rubriques d'un bâtiment selon son type, dans l'ordre d'affichage. Ce sont aussi les "points"
// sur lesquels le gestionnaire peut faire une remarque. (Le nom ne s'y trouve pas : le prestataire ne le modifie pas.)
export function pointsOf(typeKey) {
    const type = buildingTypes[typeKey]
    return [
        { key: 'description', label: 'Description' },
        { key: 'hours', label: 'Horaires' },
        { key: 'sells', label: type.proposeLabel },
        ...(type.fields ?? []).map((key) => ({ key, label: extraFields[key].label })),
        ...(type.hasMenu ? [{ key: 'menu', label: 'Menu' }] : []),
        ...(type.hasProgramme ? [{ key: 'programme', label: 'Programme' }] : []),
    ]
}
