<template>
  <footer class="site-footer">
    <div class="footer-main">
      <div class="footer-brand">
        <span class="brand">WE LOVE GREEN</span>
        <p>
          Données de démonstration conservées en session dans votre navigateur ; aucune transmission
          au serveur.
        </p>
      </div>

      <section class="footer-section" aria-labelledby="contact-title">
        <h2 id="contact-title">Nous contacter</h2>
        <a href="#">contact@welovegreen.example</a>
        <a href="#">+33 1 99 00 00 00</a>
      </section>

      <section class="footer-section" aria-labelledby="social-title">
        <h2 id="social-title">Réseaux sociaux</h2>
        <a href="#">Instagram</a>
        <a href="#">Facebook</a>
        <a href="#">TikTok</a>
      </section>

      <nav class="footer-section legal-links" aria-label="Informations légales">
        <h2>Informations</h2>
        <a href="#">Conditions d’utilisation</a>
        <a href="#">Politique de confidentialité</a>
        <a href="#">Politique de vente</a>
      </nav>
    </div>

    <div class="footer-bottom">
      <span>© WE LOVE GREEN</span>
      <span>CONTACTS ET LIENS FICTIFS — DÉMONSTRATION</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid #333;
  padding: 30px clamp(20px, 5vw, 76px) 18px;
  color: #999;
  background: #000;
  font-family: 'PP Fraktion Mono', 'Courier New', monospace;
  font-size: 11px;
}

.footer-main {
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) repeat(3, minmax(145px, 1fr));
  gap: 30px;
  padding-bottom: 28px;
}

.footer-brand {
  max-width: 340px;
}

.brand {
  color: #c0fe04;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.footer-brand p {
  margin: 16px 0 0;
  line-height: 1.7;
}

.footer-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.footer-section h2 {
  margin: 0 0 5px;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.footer-section a {
  color: #999;
  text-decoration: none;
  transition: color 150ms ease;
}

.footer-section a:hover,
.footer-section a:focus-visible {
  color: #c0fe04;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #333;
  padding-top: 14px;
  color: #717171;
  font-size: 9px;
  letter-spacing: 0.08em;
}

@media (max-width: 800px) {
  .footer-main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .footer-bottom {
    flex-direction: column;
    font-size: 8px;
  }
}
</style>
