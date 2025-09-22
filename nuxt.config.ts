// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
        enabled: true
  },
  modules: [
   '@nuxt/eslint',
   '@nuxt/fonts',
   '@nuxt/icon',
   '@nuxt/image',
   '@nuxt/scripts',
   '@nuxtjs/tailwindcss'
  ],
    runtimeConfig: {
        geminiApiKey: process.env.GEMINI_API_KEY
    }
})