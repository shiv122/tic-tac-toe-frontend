// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    'notivue/nuxt',
    '@vueuse/nuxt',
  ],
  css: [
    'notivue/notification.css',
    'notivue/animations.css'
  ],
  notivue: {
    position: 'top-right',
    limit: 4,
    enqueue: true,
    avoidDuplicates: true,
    notifications: {
      global: {
        duration: 5000
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_URL,
    },
  },
})