import database from '../../data/db.json'

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

  return {
    id: user.Id_Utilisateur,
    login: user.Login_Utilisateur,
    email: user.Email_Utilisateur,
    role: userType?.libelle_Type_Utilisateur ?? null,
  }
}
