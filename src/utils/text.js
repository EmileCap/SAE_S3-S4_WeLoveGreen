// Retire majuscules et accents : "scène" doit être trouvé en tapant "scene"
export const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
