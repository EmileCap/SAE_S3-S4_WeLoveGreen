<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PublicNavbar from '../components/PublicNavbar.vue'
import { authenticate } from '../services/loginService'
import { saveSession } from '../services/sessionService'

const router = useRouter()
const login = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)
const isFormValid = computed(() => login.value.trim() && password.value)

function signIn() {
  errorMessage.value = ''

  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  const authentication = authenticate(login.value, password.value)

  if (!authentication) {
    errorMessage.value = 'Identifiant ou mot de passe incorrect.'
    isSubmitting.value = false
    return
  }

  const user = saveSession(authentication)

  isSubmitting.value = false

  if (router.currentRoute.value.query.redirect === 'mon-programme' && user.role === 'visiteur') {
    router.push({ name: 'client-dashboard' })
    return
  }

  router.push({ name: user.role === 'visiteur' ? 'client-dashboard' : 'dashboard' })
}
</script>

<template>
  <main class="login-page">
    <PublicNavbar />
    <section class="welcome-panel" aria-label="Présentation de We Love Green">
      <div class="welcome-copy">
        <p class="eyebrow">ENSEMBLE, FAISONS BOUGER LES LIGNES</p>
        <h1>La musique<br />au rythme<br /><span>de la nature.</span></h1>
        <p class="welcome-description">
          Retrouvez votre espace et préparez-vous à vivre une expérience inoubliable.
        </p>
      </div>
      <p class="panel-footer">UN FESTIVAL PLUS VERT, UN FUTUR PLUS GRAND.</p>
      <div class="sun-glow" aria-hidden="true"></div>
    </section>

    <section class="form-panel" aria-labelledby="login-title">
      <div class="form-wrap">
        <p class="mobile-brand">WE LOVE GREEN</p>
        <p class="eyebrow form-eyebrow">HEUREUX DE VOUS REVOIR</p>
        <h2 id="login-title">Connectez-vous<span>.</span></h2>
        <p class="form-intro">Accédez à votre espace We Love Green.</p>

        <form class="login-form" @submit.prevent="signIn" novalidate>
          <label for="login">Identifiant</label>
          <input
            id="login"
            v-model="login"
            name="login"
            type="text"
            autocomplete="username"
            placeholder="Votre identifiant"
            required
          />

          <div class="password-label">
            <label for="password">Mot de passe</label>
          </div>
          <div class="password-input">
            <input
              id="password"
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Votre mot de passe"
              required
            />
            <button
              class="visibility-button"
              type="button"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Masquer' : 'Afficher' }}
            </button>
          </div>

          <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

          <button class="submit-button" type="submit" :disabled="!isFormValid || isSubmitting">
            <span>{{ isSubmitting ? 'Connexion…' : 'Se connecter' }}</span>
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p class="form-note">
          Pas encore de compte ?
          <button class="signup-link" type="button" disabled>Créer un compte</button>
        </p>
        <p class="demo-note">Connexion de démonstration — données locales uniquement.</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  min-width: 320px;
  font-family: Shapiro, Arial, sans-serif;
  color: #fff;
  background: #000;
}

:global(button),
:global(input) {
  font: inherit;
}

.login-page {
  display: grid;
  grid-template-columns: minmax(0, 0.93fr) minmax(0, 1.07fr);
  min-height: 100vh;
}

.login-page :deep(.site-header) {
  grid-column: 1 / -1;
}

.welcome-panel {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 42px clamp(36px, 6vw, 90px) 30px;
  color: #fff;
  background: #000;
}

.welcome-panel::before,
.welcome-panel::after {
  position: absolute;
  z-index: 0;
  width: 410px;
  height: 410px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 50%;
  content: '';
}

.welcome-panel::before {
  right: -210px;
  bottom: 10%;
}

.welcome-panel::after {
  right: -165px;
  bottom: calc(10% + 45px);
}

.brand,
.welcome-copy,
.panel-footer {
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 12px;
  color: inherit;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.08;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgb(244 245 225 / 65%);
  border-radius: 50%;
  font-size: 20px;
}

.welcome-copy {
  max-width: 470px;
  margin: auto 0;
  padding: 74px 0 88px;
}

.eyebrow {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.welcome-copy .eyebrow {
  color: #c0fe04;
}

.welcome-copy h1 {
  margin: 24px 0 22px;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(50px, 6.1vw, 84px);
  font-weight: 500;
  letter-spacing: -0.075em;
  line-height: 0.99;
}

.welcome-copy h1 span {
  color: #c0fe04;
}

.welcome-description {
  max-width: 330px;
  margin: 0;
  color: rgb(245 244 232 / 72%);
  font-size: 14px;
  line-height: 1.8;
}

.panel-footer,
.form-bottom {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
}

.panel-footer {
  color: rgb(245 244 232 / 65%);
}

.sun-glow {
  position: absolute;
  right: 12%;
  bottom: 17%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #c0fe04;
  opacity: 0.75;
  filter: blur(1px);
}

.form-panel {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: center;
  padding: 70px clamp(40px, 10vw, 150px) 24px;
  background: #000;
}

.form-wrap {
  width: min(100%, 390px);
  margin: auto;
}

.mobile-brand {
  display: none;
}

.form-eyebrow {
  color: #c0fe04;
}

.form-wrap h2 {
  margin: 16px 0 8px;
  font-family: 'Marathon Shapiro', Impact, sans-serif;
  font-size: clamp(35px, 4vw, 48px);
  font-weight: 500;
  letter-spacing: -0.065em;
}

.form-wrap h2 span {
  color: #c0fe04;
}

.form-intro {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  margin-top: 38px;
}

.login-form label {
  margin-bottom: 9px;
  font-size: 12px;
  font-weight: 600;
}

.login-form > input,
.password-input input {
  width: 100%;
  height: 52px;
  border: 1px solid #555;
  border-radius: 0;
  outline: none;
  padding: 0 15px;
  color: #fff;
  background: #1c1c1c;
  font-size: 13px;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.login-form > input:focus,
.password-input input:focus {
  border-color: #c0fe04;
  box-shadow: 0 0 0 3px rgb(192 254 4 / 12%);
}

.login-form input::placeholder {
  color: #717171;
}

.password-label {
  display: flex;
  justify-content: space-between;
  margin-top: 22px;
}

.password-label label {
  margin: 0 0 9px;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 88px;
}

.visibility-button {
  position: absolute;
  top: 50%;
  right: 13px;
  transform: translateY(-50%);
  border: 0;
  padding: 5px 0;
  color: #c0fe04;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
}

.submit-button {
  display: flex;
  height: 54px;
  align-items: center;
  justify-content: space-between;
  margin-top: 25px;
  border: 0;
  border-radius: 0;
  padding: 0 18px;
  color: #000;
  background: #c0fe04;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 160ms ease, transform 160ms ease;
}

.submit-button:not(:disabled):hover {
  transform: translateY(-1px);
  background: #a8e600;
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.submit-button span:last-child {
  font-size: 19px;
}

.error-message {
  margin: 13px 0 0;
  font-size: 12px;
}

.error-message {
  color: #ff6b5f;
}

.form-note {
  margin: 24px 0 0;
  color: #999;
  font-size: 12px;
  text-align: center;
}

.signup-link {
  border: 0;
  padding: 0;
  color: #c0fe04;
  background: transparent;
  cursor: not-allowed;
  font-size: inherit;
  font-weight: 600;
}

.signup-link:disabled {
  opacity: 0.8;
}

.demo-note {
  margin: 28px 0 0;
  color: #717171;
  font-size: 10px;
  text-align: center;
}

.form-bottom {
  width: min(100%, 390px);
  margin: 30px auto 0;
  color: #717171;
}

@media (max-width: 800px) {
  .login-page {
    grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
  }

  .welcome-panel {
    padding-right: 30px;
    padding-left: 30px;
  }

  .form-panel {
    padding-right: 40px;
    padding-left: 40px;
  }
}

@media (max-width: 640px) {
  .login-page {
    display: flex;
    flex-direction: column;
  }

  .login-page :deep(.site-header) {
    order: -1;
  }

  .welcome-panel {
    display: none;
  }

  .form-panel {
    min-height: 100svh;
    padding: 34px 25px 20px;
  }

  .form-wrap {
    margin: auto;
  }

  .form-wrap h2 {
    font-size: 39px;
  }

  .login-form {
    margin-top: 32px;
  }
}
</style>
