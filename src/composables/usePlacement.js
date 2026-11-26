import { computed, ref } from 'vue'
import { useAuth } from './useAuth.js'
import { useBuildings } from './useBuildings.js'
import { useSelection } from './useSelection.js'
import { router } from '@/router/index.js'

// Mode "placement" : le gestionnaire pose (ou déplace) un bâtiment sur le terrain.
// État partagé entre la scène 3D (aperçu), la barre d'info et la page Programmation du gestionnaire.

const STEP = 0.5 // la position est arrondie au demi-mètre (données propres)
const snap = (v) => Math.round(v / STEP) * STEP + 0 // "+ 0" évite le -0

const { getById, isFree, placeBuilding } = useBuildings()
const { currentRole } = useAuth()
const { highlight, clear } = useSelection()

const placingId = ref(null) // id du bâtiment en cours de placement (null = mode inactif)
const cursor = ref(null) // [x, z] du sol sous la souris (null = la souris n'est pas sur le terrain)
const rotation = ref(0) // quarts de tour du bâtiment qu'on place (touche R)

const placingBuilding = computed(() => (placingId.value ? getById(placingId.value) ?? null : null))

// Vert si l'emplacement est libre, rouge sinon
const canPlace = computed(
    () => !!placingBuilding.value && !!cursor.value
        && isFree(placingId.value, [cursor.value[0], 0, cursor.value[1]], rotation.value),
)

// Le gestionnaire peut déplacer les bâtiments des prestataires. Ceux de l'organisation (grande roue,
// toilettes...) sont fixes : ils ne sont pas réservés par un prestataire, on ne les déplace pas.
const canMove = (b) => currentRole.value === 'gestionnaire' && !!b && b.status === 'autorise' && !b.organisation

function startPlacing(id) {
    const b = getById(id)
    if (!b || b.status !== 'autorise') throw new Error('Ce bâtiment ne peut pas être placé.')
    if (b.organisation) throw new Error("Ce bâtiment de l'organisation est fixe : il ne se déplace pas.")
    clear() // ferme la fenêtre d'infos
    placingId.value = id
    cursor.value = null
    rotation.value = b.rotation ?? 0 // on part de la rotation actuelle du bâtiment
    router.push({ name: 'carte' }) // la scène est sur la page Carte
}

// Arrête le mode (annulation, pose terminée ou changement de rôle) : on reste sur la page où l'on est
function stopPlacing() {
    placingId.value = null
    cursor.value = null
    rotation.value = 0
}

// Tourne le bâtiment d'un quart de tour (sans effet hors du mode placement)
function rotate() {
    if (placingId.value) rotation.value = (rotation.value + 1) % 4
}

function moveCursor(x, z) { cursor.value = [snap(x), snap(z)] }
function clearCursor() { cursor.value = null }

// Instant du clic (événement du navigateur) qui vient de poser un bâtiment.
// La scène 3D reçoit ce même clic une image plus tard : sans cette précaution, elle le prendrait
// pour un clic dans le vide (ou sur un autre bâtiment) et changerait la sélection.
let placedAt = null
const isPlacementClick = (event) => placedAt !== null && event.nativeEvent?.timeStamp === placedAt

// Clic sur le terrain : pose le bâtiment si l'emplacement est libre.
// On reste sur la carte, avec le bâtiment posé mis en évidence (sans ouvrir sa fenêtre d'infos).
// clickEvent = l'événement du navigateur du clic (pour isPlacementClick).
function confirmPlacing(clickEvent) {
    if (!canPlace.value) return false
    const id = placingId.value
    placeBuilding(id, [cursor.value[0], 0, cursor.value[1]], rotation.value)
    stopPlacing()
    highlight(id)
    placedAt = clickEvent?.timeStamp ?? null
    return true
}

export function usePlacement() {
    return {
        placingId, placingBuilding, cursor, rotation, canPlace, canMove,
        startPlacing, stopPlacing, rotate, moveCursor, clearCursor, confirmPlacing, isPlacementClick,
    }
}
