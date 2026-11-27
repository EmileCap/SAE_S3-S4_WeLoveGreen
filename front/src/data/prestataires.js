// Les prestataires (fausses données : l'API les donnera plus tard) : leur nom, montré au gestionnaire
// à la place de l'identifiant ('presta-1'...) qui sert à relier un prestataire à ses bâtiments,
// et leur photo de profil (« data:image/... » ou adresse ; null = pas de photo, la page Contact montre une silhouette).
const prestataires = {
    'presta-1': { name: 'Demondice', photo: null },
    'presta-2': { name: 'musclor', photo: null },
    'presta-3': { name: 'CrocHouse', photo: null },
    'presta-4': { name: 'Crous Belfort', photo: null },
    'presta-demo-1': { name: 'Les Saveurs & Co', photo: null },
}

// Le nom d'un prestataire, ou son identifiant si on ne le connaît pas
export const prestataireName = (id) => prestataires[id]?.name ?? id

// La photo d'un prestataire, ou null s'il n'en a pas
export const prestatairePhoto = (id) => prestataires[id]?.photo ?? null
