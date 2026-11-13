import database from '../../data/db.json'

const API_ROLE_BY_LOCAL_ROLE = {
  visiteur: 'client',
  prestataire: 'prestataire',
  organisateur: 'organisateur',
}

export function authenticate(login, password) {
  const user = database.Utilisateur.find(
    (entry) =>
      entry.Login_Utilisateur.toLowerCase() === login.trim().toLowerCase() &&
      entry.Passwoard_Utilisateur === password,
  )

  if (!user) return null

  const userType = database.typesUtilisateurs.find(
    (type) => type.Id_Type_Utilisateur === user.Id_Type_Utilisateur,
  )
  const role = API_ROLE_BY_LOCAL_ROLE[userType?.libelle_Type_Utilisateur]

  if (!role) return null

  return {
    token: crypto.randomUUID(),
    utilisateur: {
      id: user.Id_Utilisateur,
      login: user.Login_Utilisateur,
      email: user.Email_Utilisateur,
      role,
      prestataire: null,
    },
  }
}
