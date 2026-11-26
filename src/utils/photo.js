// Les photos envoyées par le prestataire (un plat, un intervenant invité).
// Pas d'API pour l'instant : la photo est réduite dans le navigateur (640 pixels au plus, JPEG) puis gardée
// dans la donnée sous forme de texte « data:image/jpeg;base64,... » (comme le reste, perdue au rechargement).
// Plus tard : on enverra le fichier à l'API, qui rendra l'adresse de l'image ; seul readPhoto changera.

const PHOTO_MAX_SIDE = 640
const MAX_FILE_BYTES = 10 * 1024 * 1024 // le fichier choisi (avant réduction)
const MAX_PHOTO_CHARS = 400_000 // la photo réduite fait quelques dizaines de Ko ; au-delà, ce n'est pas une de nos photos

// Une photo valide est un texte « data:image/... » de taille raisonnable
const isPhoto = (value) =>
    typeof value === 'string' && value.length <= MAX_PHOTO_CHARS && /^data:image\/(jpeg|png|webp);base64,/.test(value)

// Renvoie un texte d'erreur si la photo est invalide ; vide ou absente = pas de photo = valide
export const photoProblem = (photo) => (!photo || isPhoto(photo) ? null : 'Photo invalide.')

// Taille d'arrivée : le plus grand côté ne dépasse pas `max` (une petite image n'est jamais agrandie)
function fitSize(width, height, max = PHOTO_MAX_SIDE) {
    const ratio = Math.min(1, max / Math.max(width, height))
    return [Math.max(1, Math.round(width * ratio)), Math.max(1, Math.round(height * ratio))]
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error("Impossible de lire cette image."))
        img.src = url
    })
}

// Lit le fichier choisi et renvoie la photo réduite (texte data:image/jpeg). Lève une erreur lisible sinon.
export async function readPhoto(file) {
    if (!file?.type?.startsWith('image/')) throw new Error("Ce fichier n'est pas une image.")
    if (file.size > MAX_FILE_BYTES) throw new Error('Image trop lourde (10 Mo maximum).')

    const url = URL.createObjectURL(file)
    try {
        const img = await loadImage(url)
        const [width, height] = fitSize(img.naturalWidth, img.naturalHeight)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff' // une image transparente (PNG) devient blanche en JPEG, pas noire
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        return canvas.toDataURL('image/jpeg', 0.82)
    } finally {
        URL.revokeObjectURL(url)
    }
}
