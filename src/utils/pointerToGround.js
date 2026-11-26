import { Plane, Raycaster, Vector2, Vector3 } from 'three'

// Objets réutilisés à chaque appel (le pointeur bouge souvent : on évite d'en recréer)
const raycaster = new Raycaster()
const ground = new Plane(new Vector3(0, 1, 0), 0) // le plan y = 0
const ndc = new Vector2()
const hit = new Vector3()

// Où le rayon "caméra -> pointeur" touche-t-il le sol ? Renvoie [x, z], ou null
// (par exemple quand le pointeur vise le ciel, au-dessus de l'horizon).
// rect = getBoundingClientRect() du canvas ; clientX/Y = position du pointeur dans la page.
export function pointerToGround(clientX, clientY, rect, camera) {
    // Coordonnées normalisées : -1 à +1 sur chaque axe (y vers le haut)
    ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    return raycaster.ray.intersectPlane(ground, hit) ? [hit.x, hit.z] : null
}
