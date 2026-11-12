<script setup>
import PublicNavbar from '../components/PublicNavbar.vue'
</script>

<template>
  <main class="home">
    <PublicNavbar active-page="Accueil" />

    <section class="home-hero">
      <p class="eyebrow">10 — 12 JUILLET 2026 · PARIS</p>
      <h1>WE LOVE<br /><span>GREEN.</span></h1>
      <RouterLink class="programme-link" to="/programme">Découvrir le programme <span>↗</span></RouterLink>
    </section>
  </main>
</template>

<style scoped>
.home {
  min-height: 100vh;
  padding: 0 clamp(20px, 5vw, 76px);
  color: #fff;
  background: #000;
}

.home-hero {
  display: flex;
  min-height: min(720px, calc(100vh - 85px));
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.eyebrow {
  margin: 0 0 24px;
  color: #c0fe04;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
}

.home-hero h1 {
  margin: 0;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(76px, 16vw, 210px);
  font-weight: 600;
  letter-spacing: -0.07em;
  line-height: 0.78;
}

.home-hero h1 span {
  color: #c0fe04;
}

.programme-link {
  display: flex;
  min-width: 260px;
  align-items: center;
  justify-content: space-between;
  margin-top: 44px;
  border-bottom: 1px solid #c0fe04;
  padding: 0 0 14px;
  color: #fff;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 12px;
  text-decoration: none;
}

.programme-link span {
  color: #c0fe04;
  font-size: 18px;
}

@media (max-width: 480px) {
  .home {
    padding: 0 18px;
  }
}
</style>
