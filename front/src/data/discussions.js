// Les « discussions » de la page Contact : des échanges entre un prestataire et le gestionnaire sur un point précis
// (électricité, emplacement, matériel…). À ne pas confondre avec la « demande de programmation » (réserver ou modifier
// un bâtiment et son menu), qui se fait dans « Ma programmation » (voir buildings.js).
// Fausses données, au format qu'on imagine recevoir de l'API.
//
// Une discussion = { id, ownerId, topic, subject, buildingId, closed, seen, messages }
//   ownerId    : le prestataire qui l'a ouverte
//   topic      : une clé de topics
//   subject    : le titre de la discussion
//   buildingId : le bâtiment concerné (null = aucun en particulier)
//   closed     : true = clôturée (plus de message possible)
//   seen       : { prestataire, gestionnaire } = nombre de messages déjà lus par chacun (sert aux « non lus »)
//   messages   : [{ id, from: 'prestataire' | 'gestionnaire', text, at }] ; at = date ISO

// Les sujets proposés quand on ouvre une discussion
export const topics = {
    electricite: 'Électricité',
    emplacement: 'Emplacement',
    materiel: 'Matériel',
    horaires: 'Horaires',
    autre: 'Autre',
}

// État d'une discussion : clôturée, ou ouverte (le dernier message vient du prestataire : le gestionnaire doit répondre),
// ou répondue (le dernier message vient du gestionnaire)
export const discussionStatuses = {
    ouverte: 'Ouverte',
    repondue: 'Répondue',
    cloturee: 'Clôturée',
}

export const discussionsData = [
    {
        id: 'discussion-1', ownerId: 'presta-1', topic: 'electricite', subject: 'Prises 32 A pour La Halle Gourmande',
        buildingId: 'restaurant-central', closed: false, seen: { prestataire: 1, gestionnaire: 2 },
        messages: [
            { id: 'd1-1', from: 'prestataire', at: '2026-11-23T14:02:00', text: 'Bonjour, il me faudrait 2 prises 32 A pour les cuisines de La Halle Gourmande.' },
            { id: 'd1-2', from: 'gestionnaire', at: '2026-11-23T14:20:00', text: 'Bonjour, c’est prévu. Le raccordement sera fait la veille de l’ouverture.' },
        ],
    },
    {
        id: 'discussion-2', ownerId: 'presta-3', topic: 'emplacement', subject: 'Un emplacement plus grand pour La Serre Créative ?',
        buildingId: 'scene-art', closed: false, seen: { prestataire: 1, gestionnaire: 0 },
        messages: [
            { id: 'd2-1', from: 'prestataire', at: '2026-11-24T09:15:00', text: 'Peut-on avoir un peu plus d’espace autour de la scène pour accueillir le public des performances ?' },
        ],
    },
    {
        id: 'discussion-3', ownerId: 'presta-1', topic: 'horaires', subject: 'Horaires du samedi',
        buildingId: 'scene-principale', closed: true, seen: { prestataire: 2, gestionnaire: 2 },
        messages: [
            { id: 'd3-1', from: 'prestataire', at: '2026-11-20T10:00:00', text: 'Le concert de clôture peut-il commencer à 23h au lieu de 22h30 ?' },
            { id: 'd3-2', from: 'gestionnaire', at: '2026-11-20T11:30:00', text: 'Oui, c’est accepté : début à 23h, fin avant 02h00.' },
        ],
    },
]
