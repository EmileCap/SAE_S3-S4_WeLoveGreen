# Contrats d'API

---

## Conventions

1. **camelCase** pour tous les noms de champs (ex : `evenementId`, `creeLe`)
2. **Dates en ISO 8601** : `2027-06-04` pour un jour et `2027-06-04T19:00:00` pour un instant
3. **`null` et jamais `""`** pour une valeur absente
4. **Erreurs** toujours au format `{ "erreur": "message" }`
5. **Codes HTTP** : 200 lecture, 201 création, 400 requête invalide, 401 non connecté, 403 droits insuffisants, 404 ressource introuvable, 409 conflit
6. **Réponses prêtes à afficher** : le front ne fait pas un second appel pour afficher un nom
7. **Filtre** qui ne trouve rien renvoie `200` et `[]` jamais 404
8. **Types utilisés** : `int`, `number`, `string`, `boolean`, objet `{}` et tableau `[]`
9. **Authentification** : les routes qui ne sont pas `public` demandent l'en-tête `Authorization: Bearer <token>`
10. **Prestataire propriétaire** : l'organisateur a accès à toutes les ressources, un prestataire qui n'en est pas propriétaire reçoit `403`

## Messages d'erreur

| Code | Messages |
|---|---|
| 400 | `champ manquant : <nom>`, `valeur invalide : <nom>` |
| 401 | `non connecté`, `identifiants invalides` |
| 403 | `droits insuffisants` |
| 404 | `<ressource> introuvable` |
| 409 | `réservation déjà effectuée`, `vote déjà enregistré` |

---

## 1. POST /auth/login

**Rôle** : public · Service : authentification

**Requête**

| Champ | Type | Obligatoire |
|---|---|---|
| login | string | oui |
| motDePasse | string | oui |

**Succès : 200**

```json
{
  "token": string,
  "utilisateur": {
    "id": int,
    "login": string,
    "email": string,
    "role": string,                          // "client", "prestataire" ou "organisateur"
    "prestataire": { "id": int, "nom": string } | null   // null sauf pour un compte prestataire
  }
}
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "champ manquant : login" }` |
| 400 | `{ "erreur": "champ manquant : motDePasse" }` |
| 401 | `{ "erreur": "identifiants invalides" }` |

**Exemple**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9",
  "utilisateur": {
    "id": 6,
    "login": "mdubois",
    "email": "marie.dubois@example.com",
    "role": "client",
    "prestataire": null
  }
}
```

---

## 2. GET /prestataires

**Rôle** : public · Service : prestataires

**Requête** : pas de corps

| Paramètre | Type | Obligatoire |
|---|---|---|
| typePrestataireId | int | non |

**Succès : 200** (liste vide si aucun prestataire)

```json
[
  {
    "id": int,
    "nom": string,
    "typePrestataire": { "id": int, "libelle": string }
  }
]
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "valeur invalide : typePrestataireId" }` |

**Exemple** : `GET /prestataires`

```json
[
  { "id": 1, "nom": "Green Bowl", "typePrestataire": { "id": 1, "libelle": "Restauration" } },
  { "id": 2, "nom": "Zero Waste Alliance", "typePrestataire": { "id": 2, "libelle": "Association" } },
  { "id": 3, "nom": "Atelier Récup'Art", "typePrestataire": { "id": 3, "libelle": "Art" } }
]
```

---

## 3. GET /prestataires/:id

**Rôle** : public · Service : prestataires

**Requête** : pas de corps · Paramètre de chemin : `id` (int obligatoire)

**Succès : 200**

```json
{
  "id": int,
  "nom": string,
  "typePrestataire": { "id": int, "libelle": string, "description": string },
  "emplacements": [ 
    { "id": int, "nom": string, "zone": string, "surface": number }   // [] si aucun emplacement
  ]
}
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "valeur invalide : id" }` |
| 404 | `{ "erreur": "prestataire introuvable" }` |

**Exemple** : `GET /prestataires/2`

```json
{
  "id": 2,
  "nom": "Zero Waste Alliance",
  "typePrestataire": {
    "id": 2,
    "libelle": "Association",
    "description": "Associations et ONG du village écoresponsable"
  },
  "emplacements": [
    { "id": 3, "nom": "Village des assos – Stand 2", "zone": "assos", "surface": 18.0 },
    { "id": 5, "nom": "Espace conférences", "zone": "assos", "surface": 60.0 }
  ]
}
```

---

## 4. GET /emplacements

**Rôle** : public · Service : carte

**Requête** : pas de corps

| Paramètre | Type | Obligatoire |
|---|---|---|
| zone | string | non |

**Succès : 200** (liste vide si la zone n'existe pas)

```json
[
  {
    "id": int,
    "nom": string,
    "zone": string,
    "surface": number,
    "prestataire": { "id": int, "nom": string } | null   // null si l'emplacement n'est pas occupé
  }
]
```

**Erreurs** : aucune erreur prévue (une zone inconnue renvoie `[]`)

**Exemple** : `GET /emplacements?zone=foodcourt`

```json
[
  {
    "id": 2,
    "nom": "Food Court – Stand 4",
    "zone": "foodcourt",
    "surface": 24.5,
    "prestataire": { "id": 1, "nom": "Green Bowl" }
  }
]
```

---

## 5. GET /programme

**Rôle** : public · Service : programme

**Requête** : pas de corps · Paramètres d'URL tous optionnels et combinables :

| Paramètre | Type | Obligatoire |
|---|---|---|
| jour | string (`AAAA-MM-JJ`) | non |
| typeEvenementId | int | non |
| prestataireId | int | non |

**Succès : 200** (liste triée par `debut` croissant et vide si rien ne correspond)

```json
[
  {
    "id": int,
    "libelle": string,
    "debut": string,
    "fin": string,
    "typeEvenement": { "id": int, "libelle": string },
    "emplacement": { "id": int, "nom": string, "zone": string },
    "prestataire": { "id": int, "nom": string } | null   // null si l'emplacement n'est pas occupé
  }
]
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "valeur invalide : jour" }` |
| 400 | `{ "erreur": "valeur invalide : typeEvenementId" }` |
| 400 | `{ "erreur": "valeur invalide : prestataireId" }` |

**Exemple** : `GET /programme?jour=2027-06-04`

```json
[
  {
    "id": 2,
    "libelle": "Conférence : un festival zéro déchet",
    "debut": "2027-06-04T15:00:00",
    "fin": "2027-06-04T16:00:00",
    "typeEvenement": { "id": 2, "libelle": "Conférence" },
    "emplacement": { "id": 5, "nom": "Espace conférences", "zone": "assos" },
    "prestataire": { "id": 2, "nom": "Zero Waste Alliance" }
  },
  {
    "id": 1,
    "libelle": "Concert d'ouverture",
    "debut": "2027-06-04T19:00:00",
    "fin": "2027-06-04T20:30:00",
    "typeEvenement": { "id": 1, "libelle": "Concert" },
    "emplacement": { "id": 1, "nom": "Grande Scène", "zone": "scenes" },
    "prestataire": null
  }
]
```

---

## 6. GET /evenements/:id

**Rôle** : public · Service : programme

**Requête** : pas de corps · Paramètre de chemin : `id` (int obligatoire)

**Succès : 200**

```json
{
  "id": int,
  "libelle": string,
  "debut": string,
  "fin": string,
  "typeEvenement": { "id": int, "libelle": string },
  "emplacement": { "id": int, "nom": string, "zone": string },
  "prestataire": { "id": int, "nom": string } | null,
  "nombreReservations": int
}
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "valeur invalide : id" }` |
| 404 | `{ "erreur": "événement introuvable" }` |

**Exemple** : `GET /evenements/2`

```json
{
  "id": 2,
  "libelle": "Conférence : un festival zéro déchet",
  "debut": "2027-06-04T15:00:00",
  "fin": "2027-06-04T16:00:00",
  "typeEvenement": { "id": 2, "libelle": "Conférence" },
  "emplacement": { "id": 5, "nom": "Espace conférences", "zone": "assos" },
  "prestataire": { "id": 2, "nom": "Zero Waste Alliance" },
  "nombreReservations": 2
}
```

---

## 7. POST /evenements/:id/reservations

**Rôle** : client · Service : réservation

**Requête**

| Champ | Type | Obligatoire |
|---|---|---|
| utilisateurId | int | oui |

**Succès : 201**

```json
{ "id": int, "evenementId": int, "utilisateurId": int, "creeLe": string }
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "champ manquant : utilisateurId" }` |
| 400 | `{ "erreur": "valeur invalide : utilisateurId" }` |
| 401 | `{ "erreur": "non connecté" }` |
| 403 | `{ "erreur": "droits insuffisants" }` |
| 404 | `{ "erreur": "événement introuvable" }` |
| 409 | `{ "erreur": "réservation déjà effectuée" }` |

**Exemple**

```json
{ "id": 5, "evenementId": 2, "utilisateurId": 6, "creeLe": "2027-05-20T10:00:00" }
```

---

## 8. GET /evenements/:id/reservations

**Rôle** : prestataire propriétaire, organisateur · Service : réservation

**Requête** : pas de corps · Paramètre de chemin : `id` (int obligatoire)

**Succès : 200** (liste, vide si aucune réservation)

```json
[
  {
    "id": int,
    "creeLe": string,
    "utilisateur": { "id": int, "login": string }
  }
]
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "valeur invalide : id" }` |
| 401 | `{ "erreur": "non connecté" }` |
| 403 | `{ "erreur": "droits insuffisants" }` |
| 404 | `{ "erreur": "événement introuvable" }` |

**Exemple** : `GET /evenements/2/reservations`

```json
[
  { "id": 5, "creeLe": "2027-05-20T10:00:00", "utilisateur": { "id": 6, "login": "mdubois" } },
  { "id": 8, "creeLe": "2027-05-22T14:30:00", "utilisateur": { "id": 11, "login": "lmartin" } }
]
```

---

## 9. GET /prestataires/:id/oeuvres

**Rôle** : public · Service : fiches d'œuvres

**Requête** : pas de corps · Paramètre de chemin : `id` (int obligatoire)

**Succès : 200** (liste vide si le prestataire n'a pas d'œuvre)

```json
[
  {
    "id": int,
    "libelle": string,
    "auteur": string,
    "noteMoyenne": number | null,   // null tant qu'il n'y a aucun vote
    "nombreVotes": int
  }
]
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "valeur invalide : id" }` |
| 404 | `{ "erreur": "prestataire introuvable" }` |

**Exemple** : `GET /prestataires/3/oeuvres`

```json
[
  { "id": 1, "libelle": "Forêt de bouteilles", "auteur": "Camille Roux", "noteMoyenne": 4.5, "nombreVotes": 2 },
  { "id": 2, "libelle": "Le Grand Mobile", "auteur": "Collectif Récup'Art", "noteMoyenne": null, "nombreVotes": 0 }
]
```

---

## 10. POST /oeuvres/:id/votes

**Rôle** : client · Service : fiches d'œuvres

**Requête**

| Champ | Type | Obligatoire |
|---|---|---|
| utilisateurId | int | oui |
| note | int (de 1 à 5) | oui |
| commentaire | string | non |

**Succès : 201**

```json
{
  "id": int,
  "oeuvreId": int,
  "utilisateurId": int,
  "note": int,
  "commentaire": string | null,   // null si aucun commentaire envoyé
  "creeLe": string
}
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "champ manquant : utilisateurId" }` |
| 400 | `{ "erreur": "champ manquant : note" }` |
| 400 | `{ "erreur": "valeur invalide : note" }` |
| 401 | `{ "erreur": "non connecté" }` |
| 403 | `{ "erreur": "droits insuffisants" }` |
| 404 | `{ "erreur": "œuvre introuvable" }` |
| 409 | `{ "erreur": "vote déjà enregistré" }` |

**Exemple** : `POST /oeuvres/1/votes`

```json
{
  "id": 3,
  "oeuvreId": 1,
  "utilisateurId": 6,
  "note": 5,
  "commentaire": "Magnifique et très bien pensé",
  "creeLe": "2027-06-05T16:20:00"
}
```

---

## 11. GET /oeuvres/:id/votes

**Rôle** : prestataire propriétaire, organisateur · Service : fiches d'œuvres

**Requête** : pas de corps · Paramètre de chemin : `id` (int obligatoire)

**Succès : 200** (liste vide si aucun vote)

```json
[
  {
    "id": int,
    "utilisateurId": int,
    "note": int,
    "commentaire": string | null,
    "creeLe": string
  }
]
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "valeur invalide : id" }` |
| 401 | `{ "erreur": "non connecté" }` |
| 403 | `{ "erreur": "droits insuffisants" }` |
| 404 | `{ "erreur": "œuvre introuvable" }` |

**Exemple** : `GET /oeuvres/1/votes`

```json
[
  {
    "id": 3,
    "utilisateurId": 6,
    "note": 5,
    "commentaire": "Magnifique et très bien pensé",
    "creeLe": "2027-06-05T16:20:00"
  },
  { "id": 4, "utilisateurId": 11, "note": 4, "commentaire": null, "creeLe": "2027-06-05T17:05:00" }
]
```

---

## 12. GET /stats/reservations

**Rôle** : prestataire propriétaire, organisateur · Service : statistiques

**Requête** : pas de corps

| Paramètre | Type | Obligatoire |
|---|---|---|
| prestataireId | int | non |

Sans `prestataireId` : un prestataire obtient ses propres statistiques, un organisateur obtient celles de tout le festival.

**Succès : 200**

```json
{
  "prestataireId": int | null,     // null = statistiques de tout le festival
  "totalReservations": int,
  "evenements": [
    {
      "id": int,
      "libelle": string,
      "typeEvenement": { "id": int, "libelle": string },
      "nombreReservations": int
    }
  ]
}
```

**Erreurs**

| Code | Message |
|---|---|
| 400 | `{ "erreur": "valeur invalide : prestataireId" }` |
| 401 | `{ "erreur": "non connecté" }` |
| 403 | `{ "erreur": "droits insuffisants" }` |
| 404 | `{ "erreur": "prestataire introuvable" }` |

**Exemple** : `GET /stats/reservations?prestataireId=2`

```json
{
  "prestataireId": 2,
  "totalReservations": 3,
  "evenements": [
    {
      "id": 2,
      "libelle": "Conférence : un festival zéro déchet",
      "typeEvenement": { "id": 2, "libelle": "Conférence" },
      "nombreReservations": 2
    },
    {
      "id": 4,
      "libelle": "Atelier compostage collectif",
      "typeEvenement": { "id": 3, "libelle": "Atelier" },
      "nombreReservations": 1
    }
  ]
}
```

---

## 13. GET /types-evenements

**Rôle** : public · Service : programme

**Requête** : pas de corps et pas de paramètre

**Succès : 200**

```json
[
  { "id": int, "libelle": string }
]
```

**Erreurs** : aucune erreur prévue

**Exemple**

```json
[
  { "id": 1, "libelle": "Concert" },
  { "id": 2, "libelle": "Conférence" },
  { "id": 3, "libelle": "Atelier" }
]
```

---

## 14. GET /types-prestataires

**Rôle** : public · Service : prestataires

**Requête** : pas de corps et pas de paramètre

**Succès : 200**

```json
[
  { "id": int, "libelle": string, "description": string }
]
```

**Erreurs** : aucune erreur prévue

**Exemple**

```json
[
  { "id": 1, "libelle": "Restauration", "description": "Stands de nourriture et de boissons du food court" },
  { "id": 2, "libelle": "Association", "description": "Associations et ONG du village écoresponsable" },
  { "id": 3, "libelle": "Art", "description": "Installations et ateliers artistiques" }
]
```

---