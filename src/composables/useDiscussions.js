import { computed, ref } from 'vue'
import { discussionsData, topics } from '@/data/discussions.js'
import { useAuth } from './useAuth.js'
import { useBuildings } from './useBuildings.js'

// Les discussions : discussions entre un prestataire et le gestionnaire sur un point précis (voir data/discussions.js).
// Un prestataire ne voit que les siennes ; le gestionnaire les voit toutes ; les autres rôles n'en voient aucune.
// Les messages sont gardés en mémoire seulement (perdus au rechargement). Plus tard : l'API.

const { currentRole, userId } = useAuth()
const { myBuildings } = useBuildings()

const discussions = ref(structuredClone(discussionsData))
let counter = 0

const MAX_TEXT = 1000

const lastMessage = (d) => d.messages.at(-1)

// Les discussions que la personne connectée a le droit de voir, la plus récemment active en premier
const visibleDiscussions = computed(() => {
    let list = []
    if (currentRole.value === 'gestionnaire') list = discussions.value
    else if (currentRole.value === 'prestataire' && userId.value) list = discussions.value.filter((d) => d.ownerId === userId.value)
    return [...list].sort((a, b) => lastMessage(b).at.localeCompare(lastMessage(a).at))
})

// 'cloturee' | 'ouverte' (le gestionnaire doit répondre) | 'repondue'
export function statusOf(d) {
    if (d.closed) return 'cloturee'
    return lastMessage(d).from === 'prestataire' ? 'ouverte' : 'repondue'
}

// La discussion a-t-elle des messages de l'autre côté que la personne connectée n'a pas encore lus ?
const isUnread = (d) => {
    const me = currentRole.value
    return d.messages.slice(d.seen[me] ?? 0).some((m) => m.from !== me)
}
const unreadCount = computed(() => visibleDiscussions.value.filter(isUnread).length)

// Contact ouvertes qui attendent une réponse du gestionnaire
const awaitingReplyCount = computed(() => discussions.value.filter((d) => statusOf(d) === 'ouverte').length)

const getDiscussion = (id) => visibleDiscussions.value.find((d) => d.id === id) ?? null

// La discussion `id`, si la personne connectée a le droit d'agir dessus
function ownDiscussion(id) {
    const d = getDiscussion(id)
    if (!d) throw new Error('Demande introuvable.')
    return d
}

function checkedText(text) {
    const clean = (text ?? '').trim()
    if (!clean) throw new Error('Écrivez un message.')
    if (clean.length > MAX_TEXT) throw new Error(`Le message est trop long (${MAX_TEXT} caractères maximum).`)
    return clean
}

function newMessage(from, text) {
    counter += 1
    return { id: `m-${Date.now().toString(36)}-${counter}`, from, text, at: new Date().toISOString() }
}

// Un prestataire ouvre une discussion : renvoie son id
function createDiscussion({ topic, subject, buildingId = null, text }) {
    if (currentRole.value !== 'prestataire' || !userId.value) throw new Error('Seul un prestataire peut ouvrir une discussion.')
    if (!(topic in topics)) throw new Error('Choisissez un sujet.')
    const title = (subject ?? '').trim()
    if (!title) throw new Error('Donnez un titre à la discussion.')
    if (title.length > 80) throw new Error('Le titre est trop long (80 caractères maximum).')
    const body = checkedText(text)
    if (buildingId && !myBuildings.value.some((b) => b.id === buildingId)) throw new Error("Ce bâtiment n'est pas le vôtre.")

    counter += 1
    const discussion = {
        id: `discussion-${Date.now().toString(36)}-${counter}`,
        ownerId: userId.value, topic, subject: title, buildingId: buildingId || null,
        closed: false, seen: { prestataire: 1, gestionnaire: 0 },
        messages: [newMessage('prestataire', body)],
    }
    discussions.value.push(discussion)
    return discussion.id
}

// Le prestataire ou le gestionnaire répond dans la discussion
function sendMessage(id, text) {
    const d = ownDiscussion(id)
    if (d.closed) throw new Error('Cette discussion est clôturée.')
    const body = checkedText(text)
    d.messages.push(newMessage(currentRole.value, body))
    d.seen[currentRole.value] = d.messages.length // on a lu ce qu'on vient d'écrire (et ce qui précède)
}

const closeDiscussion = (id) => { ownDiscussion(id).closed = true }
const reopenDiscussion = (id) => { ownDiscussion(id).closed = false }

// Marque tous les messages comme lus par la personne connectée
function markRead(id) {
    const d = ownDiscussion(id)
    d.seen[currentRole.value] = d.messages.length
}

export function useDiscussions() {
    return {
        discussions: visibleDiscussions, unreadCount, awaitingReplyCount,
        getDiscussion, isUnread, createDiscussion, sendMessage, closeDiscussion, reopenDiscussion, markRead,
    }
}
