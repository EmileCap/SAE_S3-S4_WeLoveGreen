<script setup>
import { computed, ref } from 'vue'
import PublicNavbar from '../components/PublicNavbar.vue'
import { formatProgrammeDate, formatProgrammeTime, getProgramme } from '../services/programmeService'

const events = ref(getProgramme())
const selectedDate = ref('all')
const selectedEvent = ref(null)
const dates = computed(() => [...new Set(events.value.map((event) => event.date))])
const filteredEvents = computed(() =>
  selectedDate.value === 'all'
    ? events.value
    : events.value.filter((event) => event.date === selectedDate.value),
)
const groupedEvents = computed(() =>
  dates.value
    .filter((date) => selectedDate.value === 'all' || selectedDate.value === date)
    .map((date) => ({
      date,
      label: formatProgrammeDate(date),
      events: filteredEvents.value.filter((event) => event.date === date),
    })),
)

function openEvent(event) {
  selectedEvent.value = event
}

function closeEvent() {
  selectedEvent.value = null
}
</script>

<template>
  <main class="programme-page">
    <PublicNavbar active-page="Programme" />

    <section class="programme-hero">
      <p class="eyebrow">10 — 12 JUILLET 2026 · PARIS</p>
      <h1>LE PROGRAMME<span>.</span></h1>
      <p class="hero-copy">Trois jours de musique, de rencontres et d’idées pour demain.</p>
    </section>

    <section class="schedule" aria-label="Programmation du festival">
      <div class="schedule-toolbar">
        <p>{{ filteredEvents.length }} RENDEZ-VOUS</p>
        <div class="date-filters" aria-label="Filtrer par jour">
          <button
            class="filter-button"
            :class="{ selected: selectedDate === 'all' }"
            type="button"
            @click="selectedDate = 'all'"
          >
            Tout
          </button>
          <button
            v-for="date in dates"
            :key="date"
            class="filter-button"
            :class="{ selected: selectedDate === date }"
            type="button"
            @click="selectedDate = date"
          >
            {{ new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) }}
          </button>
        </div>
      </div>

      <section v-for="group in groupedEvents" :key="group.date" class="day-group">
        <div class="day-heading">
          <h2>{{ group.label }}</h2>
          <span>{{ group.events.length }} ÉVÉNEMENTS</span>
        </div>

        <div class="event-grid">
          <button
            v-for="(event, index) in group.events"
            :key="event.id"
            class="event-card"
            :class="`event-card-${(index % 4) + 1}`"
            type="button"
            :aria-label="`Détails : ${event.title}`"
            @click="openEvent(event)"
          >
            <div class="card-art" :class="`event-color-${(event.id % 5) + 1}`">
              <span class="art-index">{{ String(event.id).padStart(2, '0') }}</span>
              <span class="art-type">{{ event.type }}</span>
              <span class="card-arrow" aria-hidden="true">↗</span>
            </div>
            <div class="card-info">
              <p class="card-time">{{ formatProgrammeTime(event.start) }} — {{ formatProgrammeTime(event.end) }}</p>
              <h3>{{ event.title }}</h3>
              <p class="card-location">{{ event.location }}</p>
            </div>
          </button>
        </div>
      </section>

      <p v-if="!filteredEvents.length" class="empty-state">Aucun événement prévu pour cette date.</p>
    </section>

    <div v-if="selectedEvent" class="modal-backdrop" @click.self="closeEvent" @keydown.esc="closeEvent">
        <section
          class="event-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`event-title-${selectedEvent.id}`"
        >
          <button class="modal-close" type="button" aria-label="Fermer les détails" @click="closeEvent">×</button>
          <div class="modal-image" :class="`event-color-${(selectedEvent.id % 5) + 1}`">
            <span class="art-type">{{ selectedEvent.type }}</span>
          </div>
          <div class="modal-content">
            <p class="eyebrow">
              {{ formatProgrammeDate(selectedEvent.date) }} · {{ formatProgrammeTime(selectedEvent.start) }} —
              {{ formatProgrammeTime(selectedEvent.end) }}
            </p>
            <h2 :id="`event-title-${selectedEvent.id}`">{{ selectedEvent.title }}</h2>
            <dl class="event-details">
              <div>
                <dt>LIEU</dt>
                <dd>
                  {{ selectedEvent.location }}<span v-if="selectedEvent.zone"> · {{ selectedEvent.zone }}</span>
                </dd>
              </div>
              <div v-if="selectedEvent.capacity">
                <dt>CAPACITÉ</dt>
                <dd>{{ selectedEvent.capacity }} personnes</dd>
              </div>
            </dl>
            <p class="modal-description">
              Retrouvez cet événement au festival We Love Green. Consultez le programme et préparez votre venue.
            </p>
          </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.programme-page {
  min-height: 100vh;
  padding: 0 clamp(20px, 5vw, 76px) 90px;
  color: #fff;
  background: #000;
}

.programme-hero {
  display: flex;
  min-height: 330px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  border-bottom: 1px solid #333;
}

.eyebrow,
.schedule-toolbar,
.day-heading span,
.card-time,
.art-index,
.art-type,
.event-details dt {
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  text-transform: uppercase;
}

.eyebrow {
  margin: 0;
  color: #c0fe04;
  font-size: 11px;
  letter-spacing: 0.13em;
}

.programme-hero h1 {
  margin: 20px 0 12px;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(48px, 10vw, 126px);
  font-weight: 600;
  letter-spacing: -0.055em;
  line-height: 0.9;
}

.programme-hero h1 span {
  color: #c0fe04;
}

.hero-copy {
  margin: 0;
  color: #aaa;
  font-size: 14px;
}

.schedule {
  max-width: 1500px;
  margin: 0 auto;
}

.schedule-toolbar {
  display: flex;
  min-height: 78px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #333;
  color: #999;
  font-size: 10px;
  letter-spacing: 0.08em;
}

.schedule-toolbar > p {
  margin: 0;
}

.date-filters {
  display: flex;
  gap: 8px;
}

.filter-button {
  min-width: 48px;
  border: 1px solid #444;
  padding: 9px 12px;
  color: #aaa;
  background: transparent;
  cursor: pointer;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 10px;
}

.filter-button.selected,
.filter-button:hover {
  border-color: #c0fe04;
  color: #c0fe04;
}

.day-group {
  padding-top: 31px;
}

.day-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18px;
}

.day-heading h2 {
  margin: 0;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(21px, 3vw, 30px);
  font-weight: 600;
  text-transform: capitalize;
}

.day-heading span {
  color: #777;
  font-size: 9px;
  letter-spacing: 0.08em;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.event-card {
  min-width: 0;
  border: 0;
  padding: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.card-art,
.modal-image {
  position: relative;
  display: flex;
  min-height: 250px;
  align-items: flex-end;
  overflow: hidden;
  padding: 16px;
  background: #587338;
}

.event-color-1 {
  background: #c0fe04;
}

.event-color-2 {
  background: #60e2c2;
}

.event-color-3 {
  background: #ff6947;
}

.event-color-4 {
  background: #7775e8;
}

.event-color-5 {
  background: #e6bd54;
}

.art-index,
.art-type,
.card-arrow {
  position: relative;
  z-index: 1;
}

.art-index {
  align-self: flex-start;
  margin-right: auto;
  color: rgb(255 255 255 / 75%);
  font-size: 10px;
}

.art-type {
  border: 1px solid rgb(255 255 255 / 58%);
  padding: 6px 8px;
  color: #fff;
  font-size: 9px;
}

.card-arrow {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  margin-left: 8px;
  color: #000;
  background: #c0fe04;
}

.card-info {
  border-bottom: 1px solid #333;
  padding: 14px 2px 17px;
}

.card-time {
  margin: 0 0 9px;
  color: #c0fe04;
  font-size: 9px;
}

.card-info h3 {
  min-height: 44px;
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.card-location {
  margin: 0;
  color: #888;
  font-size: 11px;
}

.empty-state {
  padding: 60px 0;
  color: #aaa;
  text-align: center;
}

.modal-backdrop {
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 24px;
  background: rgb(0 0 0 / 82%);
}

.event-modal {
  position: relative;
  display: grid;
  width: min(100%, 900px);
  max-height: calc(100vh - 48px);
  grid-template-columns: 0.9fr 1.1fr;
  overflow: auto;
  border: 1px solid #444;
  background: #111;
}

.modal-close {
  position: absolute;
  z-index: 2;
  top: 12px;
  right: 12px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 55%);
  color: #fff;
  background: #000;
  cursor: pointer;
  font-size: 24px;
}

.modal-image {
  min-height: 430px;
}

.modal-content {
  align-self: center;
  padding: clamp(24px, 5vw, 54px);
}

.modal-content h2 {
  margin: 17px 0 30px;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 600;
  line-height: 1;
}

.event-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  border-top: 1px solid #444;
  border-bottom: 1px solid #444;
  padding: 19px 0;
}

.event-details div {
  min-width: 0;
}

.event-details dt {
  margin-bottom: 9px;
  color: #888;
  font-size: 9px;
}

.event-details dd {
  margin: 0;
  font-size: 13px;
}

.modal-description {
  margin: 22px 0 0;
  color: #aaa;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .event-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 12px;
  }

  .card-art {
    min-height: 280px;
  }
}

@media (max-width: 560px) {
  .programme-page {
    padding: 0 18px 60px;
  }

  .programme-page :deep(.site-header) {
    min-height: 70px;
  }

  .programme-hero {
    min-height: 260px;
  }

  .hero-copy {
    max-width: 300px;
    font-size: 12px;
    line-height: 1.6;
  }

  .schedule-toolbar {
    min-height: 68px;
  }

  .date-filters {
    gap: 5px;
  }

  .filter-button {
    min-width: auto;
    padding: 8px;
    font-size: 9px;
  }

  .card-art {
    min-height: 190px;
    padding: 10px;
  }

  .card-info h3 {
    font-size: 13px;
  }

  .card-time {
    font-size: 8px;
  }

  .event-modal {
    grid-template-columns: 1fr;
  }

  .modal-image {
    min-height: 220px;
  }

  .modal-content {
    padding: 25px 20px;
  }
}
</style>
