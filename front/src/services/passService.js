import database from '../../data/db.json'
import { getSession } from './sessionService'

let purchases = [...(database.achatsPass ?? [])]

export const FESTIVAL_DAYS = [
  { date: '2026-07-10', label: 'Vendredi 10 juillet' },
  { date: '2026-07-11', label: 'Samedi 11 juillet' },
  { date: '2026-07-12', label: 'Dimanche 12 juillet' },
]

export function getPassTypes() {
  return database.passFestival
}

export function getUserPasses(userId = getSession()?.id) {
  if (!userId) return []
  return purchases
    .filter((purchase) => purchase.userId === userId)
    .sort((first, second) => new Date(second.purchasedAt) - new Date(first.purchasedAt))
}

export function getPassPurchase(purchaseId, userId = getSession()?.id) {
  return getUserPasses(userId).find((purchase) => purchase.id === purchaseId) ?? null
}

export function createPassPurchase({ passId, dates }) {
  const user = getSession()
  const pass = database.passFestival.find((entry) => entry.id === passId)
  const uniqueDates = [...new Set(dates)].sort()

  if (!user || user.role !== 'visiteur') throw new Error('Connectez-vous avec un compte client pour acheter un pass.')
  if (!pass) throw new Error('Le pass sélectionné est introuvable.')
  if (uniqueDates.length !== pass.days || uniqueDates.some((date) => !FESTIVAL_DAYS.some((day) => day.date === date))) {
    throw new Error('La sélection des jours ne correspond pas au pass choisi.')
  }

  const purchase = {
    id: crypto.randomUUID(),
    code: crypto.randomUUID(),
    userId: user.id,
    passId: pass.id,
    passName: pass.name,
    dates: uniqueDates,
    price: pass.price,
    purchasedAt: new Date().toISOString(),
    status: 'validé',
  }

  purchases.push(purchase)
  return purchase
}
