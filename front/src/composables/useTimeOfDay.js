import { computed, ref } from 'vue'

// Heure affichée : 10, 19 ou 22 (les trois boutons de TimeButtons.vue)
const hour = ref(10)

// Ciel et lumières de chaque heure.
// background = ciel | ambient = lumière douce partout | sun = soleil (ou lune la nuit)
// sunPosition = [x, y, z] : x négatif = est (matin), x positif = ouest (soir)
const skies = {
    10: {
        background: '#96d0ef',
        ambientColor: '#ffffff', ambientIntensity: 0.725,
        sunColor: '#fff5e1', sunIntensity: 1.775,
        sunPosition: [-26.77, 29.01, 12],
    },
    19: {
        background: '#e29b8c',
        ambientColor: '#ffd5b8', ambientIntensity: 0.54,
        sunColor: '#ffa980', sunIntensity: 1.14,
        sunPosition: [36.54, 17.24, 12],
    },
    22: {
        background: '#19193d',
        ambientColor: '#6e74b0', ambientIntensity: 0.27,
        sunColor: '#8fa6ff', sunIntensity: 0.43,
        sunPosition: [-37.59, 14.97, 12],
    },
}

const sky = computed(() => skies[hour.value])

export function useTimeOfDay() {
    return { hour, sky }
}
