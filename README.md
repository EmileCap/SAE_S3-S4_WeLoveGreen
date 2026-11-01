# We Love Green

Application web de gestion d'un festival écoresponsable (SAÉ S3-S4).

---

## Travailler avec Git

### Les branches

- `main` : la version **stable**. On n'y touche presque jamais (fusion de `dev` en fin de sprint).
- `dev` : la version **de travail commune**. Tout le monde y fusionne son travail terminé.
- `feature/...` : **chaque branche personnelle** pour chaque carte trello.

```
main     ───────────────────────────●──────   (fin de sprint)
                                   /
dev      ──●────────●─────────●───●──────
            \      / \       /
feature/x    ●──●─●    ●──●─●                (une branche par tâche)
```

**On ne code jamais directement sur `main` ni sur `dev`.** Toujours sur une branche `feature/...`.
Ça évite d'écraser le travail des autres et permet de relire avant de fusionner.

### Le cycle pour une tâche

**1. Partir d'un `dev` à jour** (à faire à chaque début de tâche)
```bash
git checkout dev
git pull
```

**2. Créer sa branche**
```bash
git checkout -b feature/XXXX
```
Nom : `feature/` + le nom de la carte Trello, en minuscules avec des tirets.
Pour savoir où on est : `git branch` (l'étoile `*` marque la branche active).

**3. Sauvegarder avec des commits**
```bash
git status                       # voir ce qui a changé
git add .                        # préparer les changements
git commit -m "feat(front): ajout du composant EvenementCard"
```
Un commit = une petite chose terminée. Le journal de bord s'appuie sur ces messages, ils doivent être clairs.

**4. Envoyer sa branche sur GitHub**
```bash
git push -u origin feature/affiche-programme     # la 1re fois
git push                                         # les fois suivantes
```
Pousser à la fin de chaque session de travail pour sauvegarder.

**5. Ouvrir une Pull Request (PR)**
1. Sur GitHub : *Pull requests* > *New pull request*.
2. **base : `dev`**, comparer : sa branche `feature/...`. Ne pas choisir `main`.
3. Titre clair + une phrase sur ce qui a été fait.

**6. Relecture et fusion (optionnel)**
Un autre membre relit, teste si possible, puis clique sur *Merge*. Penser à bouger sa carte Trello quand une tache est finie.

**7. Nettoyer et recommencer**
```bash
git checkout dev
git pull
git branch -d feature/XXXX
```

### Si `dev` a avancé pendant alors qu'on a avancé :
Récupèrer les changements dans ta branche avant d'ouvrir ta PR :
```bash
git checkout dev
git pull
git checkout feature/affiche-programme
git merge dev
```

### En cas de conflit
Un conflit arrive quand deux personnes ont modifié les mêmes lignes. Git marque le fichier ainsi :
```
<<<<<<< HEAD
ta version
=======
la version de dev
>>>>>>> dev
```
1. Ouvrir le fichier, garder (ou combiner) les bonnes versions, et **supprimer les lignes `<<<<<<<`, `=======` et `>>>>>>>`**.
2. `git add fichier` puis `git commit`.
3. En cas de doute, demander à l'auteur de l'autre version.

### Les règles à retenir
1. Toujours `git pull` sur `dev` avant de créer une branche.
2. Une tâche = une branche = une PR.
3. Jamais de commit direct sur `main` ou `dev`.
4. Commits petits, messages précis. (pour le journal de bord)

### Pense-bête
| Ce qu'on fait | Commande |
|---|---|
| savoir sur quelle branche je suis | `git branch` |
| voir ce qui a changé | `git status` |
| changer de branche | `git checkout nom-branche` |
| récupérer le travail des autres | `git pull` |
| annuler mes modifications d'un fichier (non commité) | `git restore fichier` |
| voir l'historique | `git log --oneline` |
