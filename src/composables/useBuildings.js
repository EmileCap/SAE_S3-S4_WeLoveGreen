import { computed, ref } from 'vue'
import { buildingsData } from '@/data/buildings.js'
import { buildingTypes } from '@/data/buildingTypes.js'
import { extraFields, pointsOf } from '@/data/buildingFields.js'
import { copyMenu, dishProblem } from '@/data/menu.js'
import { copyProgramme, slotProblem } from '@/data/programme.js'
import { GROUND_SIZE } from '@/data/map.js'
import { hoursProblem } from '@/data/festival.js'
import { normalize } from '@/utils/text.js'
import { useAuth } from './useAuth.js'

// État partagé (hors de la fonction)
const buildings = ref([])
const loading = ref(false)
const error = ref(null)

// SEUL endroit à changer quand l'API sera prête : le remplacer par un fetch('/api/buildings')
// qui renvoie le tableau de bâtiments en JSON.
async function fetchBuildings() {
    await new Promise((resolve) => setTimeout(resolve, 300)) // simule le réseau
    return structuredClone(buildingsData) // copie profonde : modifier un bâtiment ne touche pas au fichier de données
}

async function loadBuildings() {
    loading.value = true
    error.value = null
    try {
        buildings.value = await fetchBuildings()
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

// Ce que voit le client : autorisés ET placés
const visibleBuildings = computed(() =>
    buildings.value.filter((b) => b.status === 'autorise' && b.position !== null),
)

// Les bâtiments du prestataire connecté (liste vide si ce n'est pas un prestataire)
const { userId, currentRole } = useAuth()
const myBuildings = computed(() =>
    userId.value ? buildings.value.filter((b) => b.ownerId === userId.value) : [],
)

// Compteurs des demandes de programmation (réserver / modifier un bâtiment), pour les pastilles de la navbar :
// - pendingCount : celles qui attendent une décision du gestionnaire
// - toCorrectCount : celles du prestataire connecté où le gestionnaire a demandé des corrections
const pendingCount = computed(() => buildings.value.filter((b) => b.status === 'en_attente').length)
const toCorrectCount = computed(() => myBuildings.value.filter((b) => b.status === 'a_modifier').length)

// Le bâtiment `b` peut-il être montré à la personne connectée ?
// Tout le monde voit les bâtiments autorisés et placés. Une demande qui n'est pas (encore) sur la carte
// n'est vue que par le gestionnaire et par le prestataire qui l'a faite : jamais par les autres prestataires.
// (Plus tard, c'est l'API qui renverra seulement ce que la personne a le droit de voir.)
const canView = (b) =>
    (b.status === 'autorise' && b.position !== null)
    || currentRole.value === 'gestionnaire'
    || (!!userId.value && b.ownerId === userId.value)

// "Crêperie du Lac" -> "creperie-du-lac"
const slugify = (s) => normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'batiment'

// Les rubriques que le prestataire renseigne pour un type : description, horaires, ce qu'il propose,
// puis les champs propres au type (style, besoins techniques…), le menu et le programme s'il y en a.
const contentKeys = (typeKey) => pointsOf(typeKey).map((p) => p.key)

// Les rubriques qui sont des listes (plats d'un menu, créneaux d'un programme) :
// chacune a sa façon de se copier et de vérifier un élément (renvoie un texte d'erreur ou null).
const listRubriques = {
    menu: { copy: copyMenu, problem: dishProblem },
    programme: { copy: copyProgramme, problem: slotProblem },
}

// Tous les noms de rubriques qui existent, tous types confondus
const ALL_CONTENT_KEYS = ['description', 'hours', 'sells', ...Object.keys(listRubriques), ...Object.keys(extraFields)]

// Lève une erreur si un élément de la liste est invalide ; sinon renvoie une copie de la liste
function checkedList(key, list) {
    const problem = list.map(listRubriques[key].problem).find(Boolean)
    if (problem) throw new Error(problem)
    return listRubriques[key].copy(list)
}

// Réservation d'un bâtiment par un prestataire : statut "en attente", pas encore placé.
// La taille vient du type, et seules les rubriques de ce type sont gardées.
// Plus tard : un envoi à l'API (le serveur créera l'id).
function addBuilding(data, ownerId) {
    const type = buildingTypes[data.type]
    if (!type?.reservable) throw new Error("Ce type de bâtiment n'est pas réservable.")
    if (!ownerId) throw new Error('Aucun prestataire connecté.')

    const problem = hoursProblem(data.hours)
    if (problem) throw new Error(problem)

    const content = {}
    for (const key of contentKeys(data.type)) {
        content[key] = key in listRubriques ? checkedList(key, data[key] ?? []) : (data[key] ?? '')
    }
    const building = {
        id: `${slugify(data.name)}-${Date.now().toString(36)}`,
        name: data.name,
        type: data.type,
        status: 'en_attente',
        organisation: false,
        ownerId,
        position: null,
        rotation: 0,
        size: [...type.size],
        contact: data.contact,
        ...content,
    }
    buildings.value.push(building)
    return building
}

const getById = (id) => buildings.value.find((b) => b.id === id)

// ---- Prestataire ----

// Le bâtiment `id`, à condition qu'il appartienne au prestataire connecté
// (plus tard, c'est l'API qui revérifiera).
function ownBuilding(id) {
    const b = getById(id)
    if (!b) throw new Error('Bâtiment introuvable.')
    if (!userId.value || b.ownerId !== userId.value) throw new Error('Vous ne pouvez modifier que vos propres bâtiments.')
    return b
}

// Le prestataire modifie les rubriques de son bâtiment, à tout moment, sans revalidation.
// Jamais le nom, le type, la taille ni l'emplacement : c'est le gestionnaire qui les décide.
function updateBuilding(id, changes) {
    const b = ownBuilding(id)
    if (b.status === 'refuse') throw new Error('Cette demande a été refusée : elle ne peut plus être modifiée.')
    const allowed = contentKeys(b.type)
    const keys = ALL_CONTENT_KEYS.filter((key) => key in changes)
    for (const key of keys) {
        if (!allowed.includes(key)) throw new Error(`Ce type de bâtiment n'a pas de rubrique « ${key} ».`)
    }
    if ('hours' in changes) {
        const problem = hoursProblem(changes.hours)
        if (problem) throw new Error(problem)
    }
    // Tout est vérifié avant de modifier quoi que ce soit : une liste invalide ne laisse pas un bâtiment à moitié modifié
    const values = Object.fromEntries(keys.map((key) => [key, key in listRubriques ? checkedList(key, changes[key]) : changes[key]]))
    Object.assign(b, values)
}

// Après une demande de modifications : le prestataire renvoie sa demande au gestionnaire.
// Le retour du gestionnaire reste affiché dans son dossier jusqu'à la prochaine décision.
function resubmitBuilding(id) {
    const b = ownBuilding(id)
    if (b.status !== 'a_modifier') throw new Error("Seule une demande dont des modifications ont été demandées peut être renvoyée.")
    b.status = 'en_attente'
}

// ---- Gestionnaire : décider d'une demande ----
// Trois décisions possibles, uniquement sur une demande "en attente" :
//   autoriser | demander des modifications (le prestataire corrige puis renvoie) | refuser (définitif, avec un motif).
// Un retour = { message, remarks } : un message général et des remarques par rubrique ({ description: '…' }).

function pendingRequest(id) {
    if (currentRole.value !== 'gestionnaire') throw new Error('Seul le gestionnaire peut traiter une demande.')
    const b = getById(id)
    if (!b) throw new Error('Bâtiment introuvable.')
    if (b.status !== 'en_attente') throw new Error('Seule une demande en attente peut être traitée.')
    return b
}

// Retour nettoyé : textes rognés, remarques vides retirées, rubriques vérifiées
function cleanFeedback(b, feedback) {
    const points = contentKeys(b.type)
    const remarks = {}
    for (const [key, text] of Object.entries(feedback?.remarks ?? {})) {
        const remark = (text ?? '').trim()
        if (!remark) continue
        if (!points.includes(key)) throw new Error(`Rubrique inconnue pour ce type de bâtiment : « ${key} ».`)
        remarks[key] = remark
    }
    return { message: (feedback?.message ?? '').trim(), remarks }
}

function authorizeBuilding(id) {
    const b = pendingRequest(id)
    b.status = 'autorise'
    b.feedback = null
}

function requestChanges(id, feedback) {
    const b = pendingRequest(id)
    const cleaned = cleanFeedback(b, feedback)
    if (!cleaned.message && Object.keys(cleaned.remarks).length === 0) {
        throw new Error('Écrivez un message ou une remarque sur au moins un point.')
    }
    b.status = 'a_modifier'
    b.feedback = cleaned
}

function refuseBuilding(id, feedback) {
    const b = pendingRequest(id)
    const cleaned = cleanFeedback(b, feedback)
    if (!cleaned.message) throw new Error("Un refus doit s'accompagner d'un motif.")
    b.status = 'refuse'
    b.feedback = cleaned
}

// Emprise au sol [largeur, profondeur] d'un bâtiment de taille `size` ([largeur, hauteur, profondeur]) tourné de `turns` quarts de tour :
// un quart de tour échange la largeur et la profondeur.
const footprintOf = (size, turns = 0) => (turns % 2 === 0 ? [size[0], size[2]] : [size[2], size[0]])

// Deux rectangles au sol (centre + [largeur, profondeur]) se chevauchent-ils ? Se toucher par un bord est permis.
function footprintsOverlap(posA, fpA, posB, fpB) {
    return Math.abs(posA[0] - posB[0]) < (fpA[0] + fpB[0]) / 2
        && Math.abs(posA[2] - posB[2]) < (fpA[1] + fpB[1]) / 2
}

// Le bâtiment `id` peut-il être posé en `position` ([x, y, z]), tourné de `rotation` quarts de tour (0 à 3 ;
// sans précision, sa rotation actuelle) ? Il faut qu'il tienne dans le terrain et ne chevauche aucun
// bâtiment déjà sur la carte. Le bâtiment lui-même est ignoré (utile pour le déplacer).
function isFree(id, position, rotation) {
    const b = getById(id)
    const turns = rotation ?? b?.rotation ?? 0
    if (!b || position.length !== 3 || !position.every(Number.isFinite) || !Number.isInteger(turns) || turns < 0 || turns > 3) return false
    const half = GROUND_SIZE / 2
    const fp = footprintOf(b.size, turns)
    if (Math.abs(position[0]) + fp[0] / 2 > half) return false
    if (Math.abs(position[2]) + fp[1] / 2 > half) return false
    return !visibleBuildings.value.some(
        (other) => other.id !== id && footprintsOverlap(position, fp, other.position, footprintOf(other.size, other.rotation ?? 0)),
    )
}

// Pose (ou déplace) un bâtiment autorisé, éventuellement tourné (quarts de tour ; sans précision, il garde sa rotation).
// Plus tard : un envoi à l'API, qui revérifiera tout.
function placeBuilding(id, position, rotation) {
    const b = getById(id)
    if (!b) throw new Error('Bâtiment introuvable.')
    if (b.status !== 'autorise') throw new Error('Seul un bâtiment autorisé peut être placé.')
    const turns = rotation ?? b.rotation ?? 0
    if (!isFree(id, position, turns)) throw new Error('Emplacement occupé ou hors du terrain.')
    b.position = [position[0], 0, position[2]]
    b.rotation = turns
}

export function useBuildings() {
    return {
        buildings, visibleBuildings, myBuildings, pendingCount, toCorrectCount, canView,
        loading, error, loadBuildings, getById,
        addBuilding, updateBuilding, resubmitBuilding,
        authorizeBuilding, requestChanges, refuseBuilding, isFree, placeBuilding,
    }
}
