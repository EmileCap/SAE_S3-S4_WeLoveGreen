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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      beforeEnter: () =>
        getSession()?.role === 'visiteur'
          ? true
          : { name: 'login', query: { redirect: 'mon-programme' } },
    },
    {
      path: '/pass',
      name: 'pass-purchase',
      component: PassPurchaseView,
      beforeEnter: (to) => {
        const session = getSession()
        if (session?.role === 'visiteur') return true
        return { name: 'login', query: { redirect: 'achat-pass', redirectTo: to.fullPath } }
      },
    },
    {
      path: '/achat/paiement',
      name: 'pass-payment',
      component: PassPaymentView,
      beforeEnter: () => (getSession()?.role === 'visiteur' ? true : { name: 'login' }),
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
      beforeEnter: () => (getSession()?.role === 'visiteur' ? true : { name: 'login' }),
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

export default router
