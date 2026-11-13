import database from '../../data/db.json'

function mapApiEvent(event) {
  return {
    id: event.id,
    title: event.libelle,
    start: event.debut,
    end: event.fin,
    date: event.debut?.slice(0, 10) ?? '',
    type: event.typeEvenement?.libelle ?? 'Événement',
    location: event.emplacement?.nom ?? 'Lieu à confirmer',
    zone: event.emplacement?.zone ?? null,
    capacity: event.capacite ?? null,
    image: event.image ?? null,
  }
}

function mapLocalEvent(event) {
  const eventType = database.typesEvenements?.find(
    (type) => type.Id_type_evenement === event.Id_type_evenement,
  )
  const location = database.Emplacement?.find(
    (place) => place.Id_Emplacement === event.Id_Emplacement,
  )

  return {
    id: event.Id_evenement,
    title: event.libelle_evenement,
    start: event.debut_evenement,
    end: event.fin_evenement,
    date: event.debut_evenement?.slice(0, 10) ?? '',
    type: eventType?.libbele_type_evenement ?? 'Événement',
    location: location?.Nom_Emplacement ?? 'Lieu à confirmer',
    zone: location?.Zone_Emplacement ?? null,
    capacity: event.capacite_evenement ?? null,
    image: event.image_evenement ?? null,
  }
}

export function mapProgrammeEvent(event) {
  return 'Id_evenement' in event ? mapLocalEvent(event) : mapApiEvent(event)
}

export function getProgramme(events = database.evenements ?? []) {
  return events
    .map(mapProgrammeEvent)
    .filter((event) => event.title && event.start)
    .sort((first, second) => new Date(first.start) - new Date(second.start))
}

export function formatProgrammeDate(date) {
  if (!date) return 'Date à confirmer'

  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

export function formatProgrammeTime(dateTime) {
  if (!dateTime) return '--:--'

  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateTime))
}
