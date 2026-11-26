import { ref } from 'vue'

// Le bâtiment survolé par la souris sur la carte : la petite carte du survol (HoverCard) affiche son nom.
// Quand la souris quitte le bâtiment, la carte reste un court instant : le temps d'aller cliquer
// sur son bouton « Déplacer » (le gestionnaire). Elle reste tant que la souris est dessus.
//
// Piège : la scène 3D transmet « la souris quitte le bâtiment » avec une image de retard, donc APRÈS
// l'événement du navigateur « la souris entre sur la carte ». On retient donc que la souris est sur la carte
// (overCard) : un départ du bâtiment reçu en retard ne relance pas le délai.

const HOVER_GRACE_MS = 350

const hoveredId = ref(null)
let timer = null
let overCard = false

function cancelTimer() {
    if (timer !== null) {
        clearTimeout(timer)
        timer = null
    }
}

function startTimer() {
    cancelTimer()
    timer = setTimeout(() => { hoveredId.value = null; timer = null }, HOVER_GRACE_MS)
}

export function useHover() {
    // La souris entre sur un bâtiment
    const hoverEnter = (id) => { cancelTimer(); overCard = false; hoveredId.value = id }
    // La souris quitte le bâtiment : on attend un peu avant de retirer la carte (sauf si elle est déjà sur la carte)
    const hoverLeave = () => { if (!overCard) startTimer() }
    // La souris entre sur la carte du survol : on la garde
    const hoverKeep = () => { overCard = true; cancelTimer() }
    // La souris quitte la carte du survol : même délai que pour un bâtiment
    const hoverRelease = () => { overCard = false; startTimer() }
    // Retire tout de suite (clic, placement…)
    const hoverClear = () => { cancelTimer(); overCard = false; hoveredId.value = null }
    return { hoveredId, hoverEnter, hoverLeave, hoverKeep, hoverRelease, hoverClear }
}
