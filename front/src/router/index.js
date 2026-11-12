import { createRouter, createWebHistory } from 'vue-router'
import ClientDashboardView from '../views/ClientDashboardView.vue'
import DashboardView from '../views/DashboardView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProgrammeView from '../views/ProgrammeView.vue'
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
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: () => (getSession() ? true : { name: 'login' }),
    },
  ],
})

export default router
