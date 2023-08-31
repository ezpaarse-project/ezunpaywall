// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      environment: process.env.NODE_ENV || 'development',
      unpaywallHost: process.env.UNPAYWALL_HOST || 'https://unpaywall.org',
      unpaywallAPIHost: process.env.UNPAYWALL_API_HOST || 'http://api.unpaywall.org',
      dashbordHost: process.env.DASHBOARD_HOST || 'https://ezmesure.couperin.org/kibana/s/ezunpaywall/app/dashboards',
      graphqlHost: process.env.GRAPHQL_HOST || 'http://localhost:59701',
      updateHost: process.env.UPDATE_HOST || 'http://localhost:59702',
      enrichHost: process.env.ENRICH_HOST || 'http://localhost:59703',
      apikeyHost: process.env.APIKEY_HOST || 'http://localhost:59704',
      apikeyMail: process.env.MAIL_APIKEY || 'changeme',
      mailHost: process.env.MAIL_HOST || 'http://localhost:59705',
      healthHost: process.env.HEALTH_HOST || 'http://localhost:59707',
      elasticEnv: process.env.ELASTIC_ENV || 'development',
      version: process.env.VERSION || 'development'
    }
  },
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],
  build: {
    transpile: ['vuetify'],
  },
  i18n: {
    vueI18n: './config/i18n.js'
  },
  css: [
    'swagger-ui/dist/swagger-ui.css',
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],
})
