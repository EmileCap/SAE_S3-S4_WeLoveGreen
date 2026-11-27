import { createRouter, createWebHistory } from 'vue-router'
import ClientDashboardView from '../views/ClientDashboardView.vue'
import DashboardView from '../views/DashboardView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import MealOrderClientView from '../views/MealOrderClientView.vue'
import MealOrdersView from '../views/MealOrdersView.vue'
import MyReservationsView from '../views/MyReservationsView.vue'
import PassPaymentView from '../views/PassPaymentView.vue'
import PassPurchaseView from '../views/PassPurchaseView.vue'
import ProgrammeView from '../views/ProgrammeView.vue'
import PurchaseSuccessView from '../views/PurchaseSuccessView.vue'
import { isRestaurantProvider } from '../services/mealOrderService'
import { getPassPurchase } from '../services/passService'
import { getSession } from '../services/sessionService'

const festivalRoutes = [
  {
    path: '/carte',
    name: 'carte',
    component: () => import('../views/public/MapView.vue'),
    meta: { title: 'Carte', roles: ['visiteur', 'client', 'prestataire', 'gestionnaire'], order: 1, festival: true },
  },
  {
    path: '/carte/programmation/:id',
    name: 'programme-scene',
    component: () => import('../views/public/SceneProgrammeView.vue'),
    props: true,
    meta: { title: 'Programme de la scène', roles: ['visiteur', 'client', 'prestataire', 'gestionnaire'], parent: 'carte', festival: true },
  },
  {
    path: '/festival/ma-programmation',
    name: 'ma-programmation',
    component: () => import('../views/prestataire/MaProgrammationView.vue'),
    meta: { title: 'Ma programmation', roles: ['prestataire'], order: 4, festival: true },
  },
  {
    path: '/festival/ma-programmation/:id',
    name: 'modifier-batiment',
    component: () => import('../views/prestataire/BuildingEditView.vue'),
    props: true,
    meta: { title: 'Modifier mon bâtiment', roles: ['prestataire'], parent: 'ma-programmation', festival: true },
  },
  {
    path: '/festival/organisateur/programmation',
    name: 'administration',
    component: () => import('../views/admin/AdministrationView.vue'),
    meta: { title: 'Programmation', roles: ['gestionnaire'], order: 3, festival: true },
  },
  {
    path: '/festival/organisateur/programmation/:id',
    name: 'examiner-demande',
    component: () => import('../views/admin/RequestReviewView.vue'),
    props: true,
    meta: { title: 'Examiner une demande', roles: ['gestionnaire'], parent: 'administration', festival: true },
  },
  {
    path: '/festival/contact',
    name: 'contact',
    component: () => import('../views/shared/ContactView.vue'),
    meta: { title: 'Contact festival', roles: ['prestataire', 'gestionnaire'], order: 5, festival: true },
  },
  {
    path: '/festival/plan/programmation',
    name: 'festival-public-programmation',
    component: () => import('../views/public/PlaceholderView.vue'),
    meta: { title: 'Programmation', roles: ['visiteur', 'client'], order: 2, festival: true },
  },
  {
    path: '/festival/programmation/:id',
    name: 'festival-programme-scene',
    component: () => import('../views/public/SceneProgrammeView.vue'),
    props: true,
    meta: { title: 'Programme de la scène', roles: ['visiteur', 'client', 'prestataire', 'gestionnaire'], parent: 'festival-public-programmation', festival: true },
  },
  {
    path: '/festival/mon-programme',
    name: 'mon-programme',
    component: () => import('../views/client/MonProgrammeView.vue'),
    meta: { title: 'Mon programme du festival', roles: ['client'], order: 4, festival: true },
  },
  {
    path: '/festival/placeholders/billetterie',
    name: 'billetterie',
    component: () => import('../views/public/PlaceholderView.vue'),
    meta: { title: 'Billetterie', roles: ['visiteur', 'gestionnaire'], order: 4, festival: true },
  },
  {
    path: '/festival/placeholders/mon-billet',
    name: 'mon-billet',
    component: () => import('../views/public/PlaceholderView.vue'),
    meta: { title: 'Mon billet', roles: ['client'], order: 5, festival: true },
  },
  {
    path: '/festival/carte/:pathMatch(.*)*',
    redirect: { name: 'carte' },
  },
  {
    path: '/carte/:pathMatch(.*)*',
    redirect: { name: 'carte' },
  },
  {
    path: '/programme-scene/:id',
    redirect: (to) => ({ name: 'programme-scene', params: to.params }),
  },
]


export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...festivalRoutes,
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/programme',
      name: 'programme',
      component: ProgrammeView,
    },
    {
      path: '/client/programme',
      name: 'client-dashboard',
      component: ClientDashboardView,
      beforeEnter: () => {
        const role = getSession()?.role
        return role === 'visiteur' || role === 'client'
          ? true
          : { name: 'login', query: { redirect: 'mon-programme' } }
      },
    },
    {
      path: '/pass',
      name: 'pass-purchase',
      component: PassPurchaseView,
      beforeEnter: (to) => {
        const session = getSession()
        if (session?.role === 'visiteur' || session?.role === 'client') return true
        return { name: 'login', query: { redirect: 'achat-pass', redirectTo: to.fullPath } }
      },
    },
    {
      path: '/achat/paiement',
      name: 'pass-payment',
      component: PassPaymentView,
      beforeEnter: () => {
        const role = getSession()?.role
        return role === 'visiteur' || role === 'client' ? true : { name: 'login' }
      },
    },
    {
      path: '/achat/confirmation/:id',
      name: 'purchase-success',
      component: PurchaseSuccessView,
      beforeEnter: (to) =>
        getSession()?.role === 'visiteur' && getPassPurchase(to.params.id)
          ? true
          : { name: 'my-reservations' },
    },
    {
      path: '/mes-reservations',
      name: 'my-reservations',
      component: MyReservationsView,
      beforeEnter: () => {
        const role = getSession()?.role
        return role === 'visiteur' || role === 'client' ? true : { name: 'login' }
      },
    },
    {
      path: '/client/commandes',
      name: 'client-meals',
      component: MealOrderClientView,
      beforeEnter: () =>
        getSession()?.role === 'visiteur' ? true : { name: 'login', query: { redirect: 'commandes' } },
    },
    {
      path: '/prestataire/commandes',
      name: 'provider-meals',
      component: MealOrdersView,
      beforeEnter: () => {
        const user = getSession()
        if (!user) return { name: 'login' }
        return user.role === 'prestataire' && isRestaurantProvider(user) ? true : { name: 'dashboard' }
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: () => (getSession() ? true : { name: 'login' }),
    },
  ],
})

router.beforeEach((to) => {
  const sessionRole = getSession()?.role
  const role = sessionRole === 'organisateur' ? 'gestionnaire' : sessionRole === 'visiteur' ? 'client' : sessionRole ?? 'visiteur'
  if (to.meta.roles && !to.meta.roles.includes(role)) {
    return !sessionRole ? { name: 'login' } : { name: 'dashboard' }
  }
  return true
})

export default router
