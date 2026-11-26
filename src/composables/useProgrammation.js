import { computed, reactive } from 'vue'
import { useBuildings } from './useBuildings.js'

// La programmation vue par le gestionnaire : les bâtiments rangés selon ce qu'il y a à en faire.
// Même contenu pour la page « Programmation » et pour le menu burger de la carte (ProgrammationPanel).
//
// - pending           : demandes à examiner
// - changesRequested  : il a demandé des corrections, le prestataire doit répondre
// - toPlace           : autorisés mais pas encore posés sur la carte
// - onMap             : autorisés et placés (ceux qu'on voit sur la carte)
// - refused           : demandes refusées

const { buildings, visibleBuildings } = useBuildings()

const pending = computed(() => buildings.value.filter((b) => b.status === 'en_attente'))
const changesRequested = computed(() => buildings.value.filter((b) => b.status === 'a_modifier'))
const toPlace = computed(() => buildings.value.filter((b) => b.status === 'autorise' && b.position === null))
const refused = computed(() => buildings.value.filter((b) => b.status === 'refuse'))

// Les listes de la page « Programmation » qu'on a repliées avec la flèche (true = repliée).
// Gardé ici et pas dans la page : en revenant d'une demande qu'on vient d'examiner, les listes restent comme on les a laissées.
const foldedSections = reactive({ pending: false, changes: false, 'to-place': false, 'on-map': false, refused: false })

export function useProgrammation() {
    return { pending, changesRequested, toPlace, onMap: visibleBuildings, refused, foldedSections }
}
