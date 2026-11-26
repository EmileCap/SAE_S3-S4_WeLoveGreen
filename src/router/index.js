import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const { currentRole } = useAuth()

const everyone = ['visiteur', 'client', 'prestataire', 'gestionnaire']

// Une route = une page. Dans "meta" :
//   title : titre de la page ET libellé de l'entrée dans la navbar
//   roles : qui a le droit d'y aller (et qui voit l'entrée dans la navbar)
//   order : place de l'entrée dans la navbar (1 = la plus à gauche) ; sans order, la page n'a pas d'entrée
//   parent : nom de la page "mère" dont l'entrée de la navbar reste soulignée sur cette sous-page
// "() => import(...)" charge la page seulement quand on y va : la 3D n'est chargée qu'avec la carte.
const routes = [
    {
        path: '/', name: 'carte',
        component: () => import('@/views/public/MapView.vue'),
        meta: { title: 'Carte', roles: everyone, order: 1 },
    },
    {
        path: '/programmation', name: 'programmation',
        component: () => import('@/views/public/PlaceholderView.vue'),
        meta: { title: 'Programmation', roles: ['visiteur', 'client'], order: 2 },
    },
    {
        // Le programme d'une scène, ouvert depuis le panneau de la carte
        path: '/programmation/:id', name: 'programme-scene', props: true,
        component: () => import('@/views/public/SceneProgrammeView.vue'),
        meta: { title: 'Programme de la scène', roles: everyone, parent: 'programmation' },
    },
    {
        path: '/ma-programmation', name: 'ma-programmation',
        component: () => import('@/views/prestataire/MaProgrammationView.vue'),
        meta: { title: 'Ma programmation', roles: ['prestataire'], order: 2 },
    },
    {
        path: '/ma-programmation/:id', name: 'modifier-batiment', props: true,
        component: () => import('@/views/prestataire/BuildingEditView.vue'),
        meta: { title: 'Modifier mon bâtiment', roles: ['prestataire'], parent: 'ma-programmation' },
    },
    {
        path: '/administration/:id', name: 'examiner-demande', props: true,
        component: () => import('@/views/admin/RequestReviewView.vue'),
        meta: { title: 'Examiner une demande', roles: ['gestionnaire'], parent: 'administration' },
    },
    {
        // "Programmation" du gestionnaire : il traite les demandes et place les bâtiments
        path: '/administration', name: 'administration',
        component: () => import('@/views/admin/AdministrationView.vue'),
        meta: { title: 'Programmation', roles: ['gestionnaire'], order: 2 },
    },
    {
        // Contact : discussions prestataire <-> gestionnaire sur des points précis (électricité, emplacement…)
        path: '/contact', name: 'contact',
        component: () => import('@/views/shared/ContactView.vue'),
        meta: { title: 'Contact', roles: ['prestataire', 'gestionnaire'], order: 3 },
    },
    {
        path: '/billetterie', name: 'billetterie',
        component: () => import('@/views/public/PlaceholderView.vue'),
        meta: { title: 'Billetterie', roles: ['visiteur', 'gestionnaire'], order: 4 },
    },
    {
        // Les créneaux que le client a mis en favori
        path: '/mon-programme', name: 'mon-programme',
        component: () => import('@/views/client/MonProgrammeView.vue'),
        meta: { title: 'Mon programme', roles: ['client'], order: 3 },
    },
    {
        path: '/mon-billet', name: 'mon-billet',
        component: () => import('@/views/public/PlaceholderView.vue'),
        meta: { title: 'Mon billet', roles: ['client'], order: 4 },
    },
    // Adresse inconnue : retour à la carte
    { path: '/:pathMatch(.*)*', redirect: { name: 'carte' } },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Garde : une page interdite à ce rôle renvoie à la carte.
// Attention : c'est de l'affichage. Le vrai contrôle des droits devra être fait par l'API.
router.beforeEach((to) => {
    if (to.meta.roles && !to.meta.roles.includes(currentRole.value)) return { name: 'carte' }
})

