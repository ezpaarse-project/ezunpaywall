// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'fr',
      },
      title: 'ezUNPAYWALL: Miroir français unpaywall pour l\'enseignement supérieur de la Recherche hébergé par l\'Inist-CNRS',
      charset: 'utf-8',
      meta: [],
      link: [],
    },
  },
  runtimeConfig: {
    public: {
      environment: process.env.NUXT_PUBLIC_ENVIRONMENT || 'development',
      unpaywallHost: process.env.NUXT_PUBLIC_UNPAYWALL_HOST || 'https://unpaywall.org',
      unpaywallAPIHost: process.env.NUXT_PUBLIC_UNPAYWALL_API_HOST || 'http://api.unpaywall.org',
      dashboardHost: process.env.NUXT_PUBLIC_DASHBOARD_HOST || 'https://ezmesure.couperin.org/kibana/s/ezunpaywall/app/dashboards',
      graphqlHost: process.env.NUXT_PUBLIC_GRAPHQL_HOST || 'http://localhost:59701',
      updateHost: process.env.NUXT_PUBLIC_UPDATE_HOST || 'http://localhost:59702',
      enrichHost: process.env.NUXT_PUBLIC_ENRICH_HOST || 'http://localhost:59703',
      apikeyHost: process.env.NUXT_PUBLIC_APIKEY_HOST || 'http://localhost:59704',
      mailHost: process.env.NUXT_PUBLIC_MAIL_HOST || 'http://localhost:59705',
      healthHost: process.env.NUXT_PUBLIC_HEALTH_HOST || 'http://localhost:59707',
      elasticEnv: process.env.NUXT_PUBLIC_ELASTIC_ENV || 'development',
      version: process.env.NUXT_PUBLIC_VERSION || 'development',
    },
    mailHost: process.env.NUXT_MAIL_HOST || 'http://mail:3000',
    mailApikey: process.env.NUXT_MAIL_APIKEY || 'changeme',
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],
  build: {
    transpile: ['vuetify', 'date-fns', '@intlify/core-base'],
  },
  i18n: {
    vueI18n: './config/i18n.js',
  },
  css: [
    'swagger-ui-dist/swagger-ui.css',
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],
});
