<script setup>
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class="app-layout">
    <RouterView />
    <AppFooter />
  </div>
</template>

<style>
@font-face {
  font-family: 'Marathon Shapiro';
  src: url('https://marathonthegame.com/_next/static/media/MarathonShapiro_Wide65.p.0uo6g-jbcaayv.woff2') format('woff2');
  font-style: normal;
  font-display: swap;
  font-weight: 600 800;
}

@font-face {
  font-family: Shapiro;
  src: url('https://marathonthegame.com/_next/static/media/Shapiro_55Middle.p.08xlx1kbeyxx-.woff2') format('woff2');
  font-display: swap;
  font-style: normal;
  font-weight: 600;
}

@font-face {
  font-family: 'PP Fraktion Mono';
  src: url('https://marathonthegame.com/_next/static/media/PPFraktionMono_Regular.p.0gi45hm-j.zo2.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
}

@font-face {
  font-family: 'PP Fraktion Mono';
  src: url('https://marathonthegame.com/_next/static/media/PPFraktionMono_Medium.p.15.nuyyv33u13.woff2') format('woff2');
  font-display: swap;
  font-weight: 500;
}

:root {
  font-family: Shapiro, Arial, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input {
  font: inherit;
}
</style>
