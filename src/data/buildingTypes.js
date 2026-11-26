// Un type = un libellé, une couleur et une taille IMPOSÉE [largeur, hauteur, profondeur] en mètres,
// plus ce que le prestataire doit renseigner pour ce type de bâtiment.
// reservable : false = bâtiment de l'organisation (déjà sur la carte), un prestataire ne peut pas le réserver.
// proposeLabel, proposePlaceholder : libellé et exemple du champ "ce que vous proposez" (champ sells du bâtiment).
// fields     : champs propres au type, en plus de description, horaires et sells (voir data/buildingFields.js).
// hasMenu    : true = le bâtiment a un menu (plats, prix, allergènes…), voir data/menu.js.
// hasProgramme : true = le bâtiment a un programme (créneaux : artiste, jour, heures…), voir data/programme.js.
// hasGuests  : true = chaque créneau du programme peut avoir des intervenants invités (nom + fonction), comme à Think Talk.
// Ce que partagent les 4 scènes
const scene = { reservable: true, proposeLabel: 'Ce que vous programmez', fields: ['style', 'needs'], hasProgramme: true }

export const buildingTypes = {
    'scene-musique': { ...scene, label: 'Scène musique', color: '#c0392b', size: [16, 8, 8], proposePlaceholder: 'ex. Concerts, DJ sets' },
    'scene-thinktalk': { ...scene, hasGuests: true, label: 'Scène Think Talk', color: '#2980b9', size: [9, 4, 7], proposePlaceholder: 'ex. Conférences, débats' },
    'scene-art': { ...scene, label: 'Scène Art', color: '#8e44ad', size: [9, 4, 7], proposePlaceholder: 'ex. Expositions, performances' },
    'scene-humour': { ...scene, label: 'Scène Humour', color: '#f39c12', size: [9, 4, 7], proposePlaceholder: 'ex. Spectacles, stand-up' },
    'restaurant': {
        label: 'Restaurant', color: '#27ae60', size: [6, 3, 5], reservable: true,
        proposeLabel: 'Ce que vous vendez', proposePlaceholder: 'ex. Crêpes, boissons', hasMenu: true,
    },
    'grande-roue':     { label: 'Grande roue',      color: '#e91e63', size: [8, 16, 3], reservable: false },
    'toilettes':       { label: 'Toilettes',        color: '#7f8c8d', size: [5, 3, 3],  reservable: false },
}
