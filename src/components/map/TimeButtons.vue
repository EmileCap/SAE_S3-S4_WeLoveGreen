<script setup>
import { useTimeOfDay } from '@/composables/useTimeOfDay.js'

const { hour } = useTimeOfDay()

const presets = [
  { hour: 10, label: '10h' },
  { hour: 19, label: '19h' },
  { hour: 22, label: '22h' },
]

function setHour(h) {
  hour.value = h
}
</script>

<template>
  <div class="time">
    <button
        v-for="p in presets"
        :key="p.hour"
        class="btn btn-outline-dark btn-sm rounded-pill"
        :class="{ active: hour === p.hour }"
        @click="setHour(p.hour)"
    >
      {{ p.label }}
    </button>
  </div>
</template>

<style scoped>
.time
{
  position: absolute; /* dans la scène (MapView) : centré sur la carte, pas sur la fenêtre */
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
  font-family: system-ui, sans-serif;
}

.btn
{
  min-width: 56px;
}
</style>