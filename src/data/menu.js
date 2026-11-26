import { photoProblem } from '@/utils/photo.js'

// Menu d'un restaurant : une liste de plats.
// Un plat = { id, name, category, price, description, diet, allergens, origin, photo }
//   category    : une clé de dishCategories
//   price       : en euros
//   diet        : null (aucun) ou une clé de diets
//   allergens   : clés de allergens présents dans le plat ([] = aucun déclaré)
//   origin      : provenance des produits (texte libre, peut être vide)
//   photo       : la photo du plat (texte « data:image/... », voir utils/photo.js) ; vide ou absente = pas de photo

// Les 14 allergènes à déclaration obligatoire (règlement européen n° 1169/2011)
export const allergens = {
    gluten: 'Gluten',
    crustaces: 'Crustacés',
    oeufs: 'Œufs',
    poissons: 'Poissons',
    arachides: 'Arachides',
    soja: 'Soja',
    lait: 'Lait',
    'fruits-a-coque': 'Fruits à coque',
    celeri: 'Céleri',
    moutarde: 'Moutarde',
    sesame: 'Sésame',
    sulfites: 'Sulfites',
    lupin: 'Lupin',
    mollusques: 'Mollusques',
}

// L'ordre des clés est l'ordre d'affichage du menu
export const dishCategories = {
    entree: 'Entrées',
    plat: 'Plats',
    dessert: 'Desserts',
    boisson: 'Boissons',
}

export const diets = {
    vegetarien: 'Végétarien',
    vegan: 'Vegan',
}

let dishCount = 0

// Un plat vide, prêt à être rempli dans le formulaire. Plus tard : le serveur créera l'id.
export function newDish() {
    dishCount += 1
    return {
        id: `plat-${Date.now().toString(36)}-${dishCount}`,
        name: '', category: 'plat', price: '', description: '', diet: null, allergens: [], origin: '', photo: '',
    }
}

// Copie indépendante (le formulaire modifie la copie, pas le bâtiment, tant qu'on n'a pas enregistré)
export const copyMenu = (menu) => menu.map((dish) => ({ ...dish, allergens: [...dish.allergens] }))

// Renvoie le premier problème d'un plat (texte à afficher), ou null s'il est valide
export function dishProblem(dish) {
    const name = dish.name?.trim()
    if (!name) return 'Chaque plat doit avoir un nom.'
    if (!(dish.category in dishCategories)) return `Catégorie invalide pour « ${name} ».`
    if (typeof dish.price !== 'number' || !Number.isFinite(dish.price) || dish.price < 0) return `Prix invalide pour « ${name} ».`
    if (dish.diet !== null && !(dish.diet in diets)) return `Régime invalide pour « ${name} ».`
    if (!dish.allergens.every((a) => a in allergens)) return `Allergène inconnu pour « ${name} ».`
    if (photoProblem(dish.photo)) return `Photo invalide pour « ${name} ».`
    return null
}
