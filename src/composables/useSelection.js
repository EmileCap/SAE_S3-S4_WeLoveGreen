import { ref } from 'vue'

// Déclaré EN DEHORS de la fonction : tous les composants qui appellent
// useSelection() partagent les mêmes variables (c'est un "état global" minimal).
const selectedId = ref(null) // le bâtiment mis en évidence sur la carte
const dialogOpen = ref(false) // la fenêtre d'infos (au centre de l'écran) est-elle ouverte ?

export function useSelection()
{
    // Un clic sur un bâtiment, un élément de la liste, « Voir les informations » : met en évidence ET ouvre la fenêtre d'infos
    const select = (id) => { selectedId.value = id; dialogOpen.value = true }
    // Met en évidence sans ouvrir la fenêtre : après un placement, ou « Voir sur la carte »
    const highlight = (id) => { selectedId.value = id; dialogOpen.value = false }
    // Ferme seulement la fenêtre (changement de page) : le bâtiment reste en évidence
    const closeDialog = () => { dialogOpen.value = false }
    // Ferme la fenêtre et retire la mise en évidence
    const clear = () => { selectedId.value = null; dialogOpen.value = false }
    return { selectedId, dialogOpen, select, highlight, closeDialog, clear }
}
