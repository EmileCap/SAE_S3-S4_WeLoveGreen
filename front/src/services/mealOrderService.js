import database from '../../data/db.json'

const STORAGE_KEY = 'welovegreen-meal-orders'
const ORDER_STATUSES = ['en_attente', 'en_preparation', 'prete', 'recuperee', 'annulee']

function readOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(orders) ? orders : []
  } catch {
    return []
  }
}

function writeOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

function getRestaurantProviderIds() {
  const restaurantTypeIds = new Set(
    database.Type_Prestataire.filter((type) => /rest(?:aur|or)/i.test(type.libelle_Type_Prestataire))
      .map((type) => type.Id_type_prestataire),
  )

  return new Set(
    database.Prestataire.filter((provider) => restaurantTypeIds.has(provider.Id_type_prestataire))
      .map((provider) => provider.Id_Prestataire),
  )
}

function getProviderIdForUser(userId) {
  return database.prestatairesUtilisateurs.find((link) => link.Id_Utilisateur === userId)?.Id_Prestataire ?? null
}

export function isRestaurantProvider(user) {
  if (user?.role !== 'prestataire') return false
  const providerId = getProviderIdForUser(user.id)
  return providerId !== null && getRestaurantProviderIds().has(providerId)
}

function enrichOrder(order) {
  const meal = database.plats.find((item) => item.id === order.platId)
  const provider = database.Prestataire.find((item) => item.Id_Prestataire === order.prestataireId)
  const customer = database.Utilisateur.find((item) => item.Id_Utilisateur === order.clientId)

  return {
    ...order,
    plat: meal ? { id: meal.id, nom: meal.nom, prix: meal.prix } : null,
    prestataire: provider ? { id: provider.Id_Prestataire, nom: provider.Nom_Prestataire } : null,
    client: customer ? { id: customer.Id_Utilisateur, login: customer.Login_Utilisateur } : null,
  }
}

export function getRestaurantMenus() {
  const restaurantIds = getRestaurantProviderIds()

  return database.Prestataire.filter((provider) => restaurantIds.has(provider.Id_Prestataire))
    .map((provider) => {
      const meals = database.plats.filter(
        (meal) => meal.prestataireId === provider.Id_Prestataire && meal.disponible,
      )
      const categoryNames = [...new Set(meals.map((meal) => meal.categorie || 'Autres'))]

      return {
        id: provider.Id_Prestataire,
        nom: provider.Nom_Prestataire,
        categories: categoryNames.map((categorie) => ({
          nom: categorie,
          plats: meals
            .filter((meal) => (meal.categorie || 'Autres') === categorie)
            .map((meal) => ({ ...meal, prestataire: provider.Nom_Prestataire })),
        })),
      }
    })
    .filter((restaurant) => restaurant.categories.length)
}

export function getRestaurantMeals() {
  return getRestaurantMenus().flatMap((restaurant) =>
    restaurant.categories.flatMap((category) => category.plats),
  )
}

export function createMealOrder(mealId, client) {
  if (!client || client.role !== 'visiteur') throw new Error('Connectez-vous avec un compte client pour réserver.')

  const meal = database.plats.find((item) => item.id === Number(mealId) && item.disponible)
  if (!meal || !getRestaurantProviderIds().has(meal.prestataireId)) {
    throw new Error('Ce plat n’est pas disponible à la réservation.')
  }

  const orders = readOrders()
  const duplicate = orders.some(
    (order) => order.platId === meal.id && order.clientId === client.id && !['recuperee', 'annulee'].includes(order.statut),
  )
  if (duplicate) throw new Error('Vous avez déjà une commande active pour ce plat.')

  const order = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    platId: meal.id,
    prestataireId: meal.prestataireId,
    clientId: client.id,
    statut: 'en_attente',
    creeLe: new Date().toISOString(),
    modifieLe: new Date().toISOString(),
  }

  orders.push(order)
  writeOrders(orders)
  return enrichOrder(order)
}

export function getClientMealOrders(clientId) {
  const activeStatuses = new Set(['en_attente', 'en_preparation', 'prete'])
  const allOrders = readOrders()
  const orders = allOrders
    .filter((order) => order.clientId === clientId && activeStatuses.has(order.statut))
    .sort((first, second) => first.creeLe.localeCompare(second.creeLe))

  return orders.map((order) => {
    if (order.statut === 'prete') return { ...enrichOrder(order), position: null, enAttente: 0 }

    const queueBeforeOrder = allOrders.filter(
      (candidate) =>
        candidate.prestataireId === order.prestataireId &&
        ['en_attente', 'en_preparation'].includes(candidate.statut) &&
        candidate.creeLe.localeCompare(order.creeLe) < 0,
    ).length

    return {
      ...enrichOrder(order),
      position: queueBeforeOrder + 1,
      enAttente: queueBeforeOrder,
    }
  })
}

export function getProviderMealOrders(user) {
  if (user?.role !== 'prestataire') return []

  const providerId = getProviderIdForUser(user.id)
  if (!providerId || !getRestaurantProviderIds().has(providerId)) return []

  const orders = readOrders()
    .filter((order) => order.prestataireId === providerId && !['recuperee', 'annulee'].includes(order.statut))
    .sort((first, second) => first.creeLe.localeCompare(second.creeLe))

  return orders.map((order) => ({
    ...enrichOrder(order),
    position: orders
      .filter(
        (candidate) =>
          ['en_attente', 'en_preparation'].includes(candidate.statut) &&
          candidate.creeLe.localeCompare(order.creeLe) <= 0,
      )
      .length,
    peutAvancer: order.statut === 'en_attente' || order.statut === 'en_preparation',
    peutValiderRecuperation: order.statut === 'prete',
  }))
}

export function advanceMealOrder(orderId, user) {
  if (user?.role !== 'prestataire') throw new Error('Action réservée au prestataire.')

  const providerId = getProviderIdForUser(user.id)
  if (!providerId || !getRestaurantProviderIds().has(providerId)) throw new Error('Aucun restaurant associé à ce compte.')

  const orders = readOrders()
  const order = orders.find((item) => item.id === orderId && item.prestataireId === providerId)
  if (!order || !ORDER_STATUSES.includes(order.statut)) throw new Error('Commande introuvable pour votre restaurant.')

  if (order.statut === 'en_attente') order.statut = 'en_preparation'
  else if (order.statut === 'en_preparation') order.statut = 'prete'
  else throw new Error('Cette commande ne peut plus avancer.')

  order.modifieLe = new Date().toISOString()
  writeOrders(orders)
  return enrichOrder(order)
}

export function cancelMealOrder(orderId, client) {
  if (!client || client.role !== 'visiteur') throw new Error('Action réservée au client.')

  const orders = readOrders()
  const order = orders.find((item) => item.id === orderId && item.clientId === client.id)
  if (!order || !['en_attente', 'en_preparation'].includes(order.statut)) {
    throw new Error('Cette commande ne peut plus être annulée.')
  }

  order.statut = 'annulee'
  order.modifieLe = new Date().toISOString()
  writeOrders(orders)
  return enrichOrder(order)
}

export function validateMealOrderCollection(orderId, user) {
  if (user?.role !== 'prestataire') throw new Error('Action réservée au prestataire.')

  const providerId = getProviderIdForUser(user.id)
  if (!providerId || !getRestaurantProviderIds().has(providerId)) {
    throw new Error('Aucun restaurant associé à ce compte.')
  }

  const orders = readOrders()
  const order = orders.find((item) => item.id === orderId && item.prestataireId === providerId)
  if (!order || order.statut !== 'prete') {
    throw new Error('Cette commande n’est pas prête pour la validation de récupération.')
  }

  order.statut = 'recuperee'
  order.modifieLe = new Date().toISOString()
  writeOrders(orders)
  return enrichOrder(order)
}

export function getMealOrderStatusLabel(status) {
  return {
    en_attente: 'En attente',
    en_preparation: 'En préparation',
    prete: 'Prête à récupérer',
    recuperee: 'Récupérée',
    annulee: 'Annulée',
  }[status] ?? 'Statut inconnu'
}
