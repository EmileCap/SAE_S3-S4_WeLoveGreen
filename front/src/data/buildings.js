// Fausses données, au format qu'on imagine recevoir de l'API.
// status   : 'en_attente' | 'a_modifier' (le gestionnaire demande des corrections) | 'autorise' | 'refuse'
// position : null tant que le gestionnaire n'a pas placé le bâtiment
// rotation : quarts de tour (0 à 3) autour de l'axe vertical ; absent = 0 (le gestionnaire tourne un bâtiment en le plaçant, touche R)
// organisation : true = bâtiment de l'organisation, déjà sur la carte (pas de ownerId : aucun prestataire ne l'a réservé).
//                Il est fixe : le gestionnaire ne peut pas le déplacer.
// hours    : horaires d'ouverture (pour un prestataire, la fermeture est celle du festival, voir data/festival.js) | sells : ce qui est vendu ou proposé
// contact  : visible uniquement par le gestionnaire
// menu     : seulement pour les types qui ont un menu (restaurant), voir data/menu.js
// style, needs : champs des scènes (style proposé ; besoins techniques, jamais montrés au public)
// programme : seulement pour les scènes, la liste des créneaux, voir data/programme.js (Think Talk : avec des intervenants invités par créneau)
// feedback : retour du gestionnaire { message, remarks: { rubrique: texte } } ; absent = aucun retour
import database from '../../data/db.json'

const MENU_CATEGORY_BY_LABEL = {
    'Entrées': 'entree',
    Plats: 'plat',
    'Plats du jour': 'plat',
    'Plats végétariens': 'plat',
    Desserts: 'dessert',
    Boissons: 'boisson',
}

const menuForProvider = (providerId) => database.plats
    .filter((dish) => dish.prestataireId === providerId && dish.disponible)
    .map((dish) => ({
        id: String(dish.id),
        name: dish.nom,
        category: MENU_CATEGORY_BY_LABEL[dish.categorie] ?? 'plat',
        price: dish.prix,
        description: dish.description ?? '',
        diet: null,
        allergens: [],
        origin: '',
        photo: '',
    }))

export const buildingsData = [
    {
        id: 'scene-principale', name: 'La Grande Clairière', type: 'scene-musique',
        status: 'autorise', organisation: false, ownerId: 'presta-demo-1', position: [0, 0, -16], size: [16, 8, 8],
        description: "Têtes d'affiche, concerts de 18h à 2h.",
        hours: '18h00 – 02h00', sells: 'Concerts, merchandising des artistes',
        style: 'Pop, rock, électro', needs: 'Son et lumière, 3 prises 32 A, loge pour 12 personnes',
        programme: [
            { id: 'sp-1', title: 'Aube', day: '2027-06-04', start: '18:00', end: '19:30', description: "DJ set électro pour ouvrir le festival." },
            { id: 'sp-2', title: 'Les Cigales Électriques', day: '2027-06-04', start: '20:00', end: '21:15', description: 'Pop-rock, un premier album à découvrir.' },
            { id: 'sp-3', title: 'Nova Lune', day: '2027-06-04', start: '22:00', end: '23:30', description: "Tête d'affiche : électro-pop et lumières." },
            { id: 'sp-4', title: 'DJ Minuit', day: '2027-06-04', start: '23:45', end: '02:00', description: 'Fin de soirée, house et techno.' },
            { id: 'sp-5', title: "Orchestre du Lac", day: '2027-06-05', start: '18:00', end: '19:15', description: 'Cuivres et percussions, reprises revisitées.' },
            { id: 'sp-6', title: 'Maya Keita', day: '2027-06-05', start: '21:00', end: '22:30', description: 'Soul et rythmes ouest-africains.' },
        ],
        contact: { email: 'scene-principale@example.com', phone: '06 00 00 00 01' },
    },
    {
        id: 'scene-think-talk', name: "L'Agora Verte", type: 'scene-thinktalk',
        status: 'autorise', organisation: false, ownerId: 'presta-2', position: [-20, 0, -6], size: [9, 4, 7],
        description: 'Conférences et débats sur la transition écologique.',
        hours: '11h00 – 02h00', sells: 'Entrée libre, livres des intervenants',
        style: 'Conférences et débats', needs: 'Micros sans fil, vidéoprojecteur',
        programme: [
            { id: 'tt-1', title: "L'eau et le climat : et maintenant ?", day: '2027-06-04', start: '11:00', end: '12:00', description: 'Conférence suivie de questions du public.',
              guests: [{ id: 'tt-1-1', name: 'Claire Mercier', role: 'Hydrologue, CNRS' }, { id: 'tt-1-2', name: 'Omar Benali', role: "Ingénieur, Agence de l'eau" }] },
            { id: 'tt-2', title: 'Se nourrir demain', day: '2027-06-04', start: '14:30', end: '15:45', description: 'Débat entre agriculteurs, chefs et chercheurs.',
              guests: [{ id: 'tt-2-1', name: 'Julie Faure', role: 'Agricultrice bio' }, { id: 'tt-2-2', name: 'Marc Lenoir', role: 'Chef cuisinier' }, { id: 'tt-2-3', name: 'Inès Roche', role: 'Chercheuse en agronomie' }] },
            { id: 'tt-3', title: 'Mobilités douces en ville', day: '2027-06-05', start: '11:30', end: '12:30', description: 'Retours d\'expérience de trois villes.',
              guests: [{ id: 'tt-3-1', name: 'Hugo Lambert', role: 'Urbaniste' }] },
        ],
        contact: { email: 'think-talk@example.com', phone: '06 00 00 00 02' },
    },
    {
        id: 'scene-art', name: 'La Serre Créative', type: 'scene-art',
        status: 'autorise', organisation: false, ownerId: 'presta-3', position: [20, 0, -6], size: [9, 4, 7],
        description: 'Performances, danse et installations.',
        hours: '14h00 – 02h00', sells: "Entrée libre, affiches et œuvres d'artistes",
        style: 'Danse contemporaine, installations', needs: 'Plancher de danse, éclairage de scène',
        programme: [
            { id: 'sa-1', title: 'Racines', day: '2027-06-04', start: '15:00', end: '15:50', description: 'Danse contemporaine pour six interprètes.' },
            { id: 'sa-2', title: 'Lumière sur le lac', day: '2027-06-05', start: '17:00', end: '23:00', description: 'Installation lumineuse en accès libre.' },
        ],
        contact: { email: 'scene-art@example.com', phone: '06 00 00 00 03' },
    },
    {
        id: 'scene-humour', name: 'Le Terrier des Rires', type: 'scene-humour',
        status: 'autorise', organisation: false, ownerId: 'presta-4', position: [-18, 0, 10], size: [9, 4, 7],
        description: 'Stand-up et improvisation.',
        hours: '17h00 – 02h00', sells: 'Spectacles, boissons à la buvette',
        style: 'Stand-up, improvisation', needs: 'Deux micros, un projecteur',
        programme: [
            { id: 'sh-1', title: "Match d'improvisation", day: '2027-06-04', start: '17:30', end: '18:30', description: 'Deux équipes, un arbitre, le public vote.' },
            { id: 'sh-2', title: 'Stand-up : Camille R.', day: '2027-06-05', start: '20:00', end: '21:00', description: 'Un spectacle sur la vie à la campagne.' },
            { id: 'sh-3', title: 'Plateau découverte', day: '2027-06-06', start: '19:00', end: '20:30', description: 'Cinq humoristes, dix minutes chacun.' },
        ],
        contact: { email: 'scene-humour@example.com', phone: '06 00 00 00 04' },
    },
    {
        id: 'restaurant-central', name: 'CrocHouse', type: 'restaurant',
        status: 'autorise', organisation: false, ownerId: 'presta-3', position: [8, 0, 10], size: [12, 3, 7],
        description: 'Restaurant de cuisine végétale et locale.',
        hours: '11h30 – 02h00', sells: 'Burgers végétaux, plats du marché, desserts et boissons',
        contact: { email: 'crochouse@example.com', phone: '06 00 00 00 05' },
        menu: menuForProvider(3),
    },
    {
        id: 'restaurant-crous-belfort', name: 'Crous Belfort', type: 'restaurant',
        status: 'autorise', organisation: false, ownerId: 'presta-4', position: [35, 0, -15], size: [8, 3, 6],
        description: 'Restaurant universitaire proposant des repas à prix accessibles.',
        hours: '11h30 – 14h00', sells: 'Menus étudiants, plats chauds, desserts et boissons',
        contact: { email: 'crous-belfort@example.com', phone: '03 84 00 00 00' },
        menu: menuForProvider(4),
    },
    // Bâtiments de l'organisation : déjà sur la carte, fixes, sans prestataire
    {
        id: 'grande-roue', name: 'La Roue des Cimes', type: 'grande-roue',
        status: 'autorise', organisation: true, ownerId: null, position: [24, 0, 12], size: [8, 16, 3],
        description: "Vue sur tout le festival, ouverte jusqu'à minuit.",
        hours: '12h00 – 00h00', sells: 'Tours de grande roue', contact: null,
    },
    {
        id: 'toilettes-1', name: 'Sanitaires du Bosquet', type: 'toilettes',
        status: 'autorise', organisation: true, ownerId: null, position: [-4, 0, 10], size: [5, 3, 3],
        description: 'Sanitaires accessibles PMR.',
        hours: '10h00 – 03h00', sells: null, contact: null,
    },
    // Ces deux-là ne doivent PAS s'afficher sur la carte :
    {
        id: 'restaurant-2', name: 'Crêperie du Lac', type: 'restaurant',
        status: 'en_attente', organisation: false, ownerId: 'presta-1', position: null, size: [6, 3, 5],
        description: 'Galettes et crêpes bretonnes.',
        hours: '12h00 – 02h00', sells: 'Crêpes sucrées et salées, cidre',
        contact: { email: 'creperie@example.com', phone: '06 00 00 00 08' },
        menu: [
            {
                id: 'galette-complete', name: 'Galette complète', category: 'plat', price: 9.5,
                description: 'Jambon, œuf, fromage.', diet: null,
                allergens: ['gluten', 'oeufs', 'lait'], origin: 'Sarrasin de Bretagne',
            },
            {
                id: 'crepe-sucre', name: 'Crêpe au sucre', category: 'dessert', price: 3.5,
                description: '', diet: 'vegetarien',
                allergens: ['gluten', 'oeufs', 'lait'], origin: 'Œufs et lait de Bretagne',
            },
            {
                id: 'cidre', name: 'Cidre brut', category: 'boisson', price: 3.5,
                description: '', diet: 'vegan',
                allergens: ['sulfites'], origin: 'Pommes de Bretagne',
            },
        ],
    },
    {
        id: 'restaurant-3', name: 'Le Comptoir Vert', type: 'restaurant',
        status: 'refuse', organisation: false, ownerId: 'presta-2', position: [10, 0, -2], size: [6, 3, 5],
        description: 'Burgers maison et frites.',
        hours: '12h00 – 02h00', sells: 'Burgers, frites',
        feedback: { message: "L'emplacement prévu pour la restauration rapide est complet cette année.", remarks: {} },
        contact: { email: 'burgers@example.com', phone: '06 00 00 00 09' },
        menu: [],
    },
]
