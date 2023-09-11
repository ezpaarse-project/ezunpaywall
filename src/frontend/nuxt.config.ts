// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      environment: process.env.NUXT_PUBLIC_NODE_ENV || 'development',
      unpaywallHost: process.env.NUXT_PUBLIC_UNPAYWALL_HOST || 'https://unpaywall.org',
      unpaywallAPIHost: process.env.NUXT_PUBLIC_UNPAYWALL_API_HOST || 'http://api.unpaywall.org',
      dashbordHost: process.env.NUXT_PUBLIC_DASHBOARD_HOST || 'https://ezmesure.couperin.org/kibana/s/ezunpaywall/app/dashboards',
      graphqlHost: process.env.NUXT_PUBLIC_GRAPHQL_HOST || 'http://localhost:59701',
      updateHost: process.env.NUXT_PUBLIC_UPDATE_HOST || 'http://localhost:59702',
      enrichHost: process.env.NUXT_PUBLIC_ENRICH_HOST || 'http://localhost:59703',
      apikeyHost: process.env.NUXT_PUBLIC_APIKEY_HOST || 'http://localhost:59704',
      apikeyMail: process.env.NUXT_PUBLIC_MAIL_APIKEY || 'changeme',
      mailHost: process.env.NUXT_PUBLIC_MAIL_HOST || 'http://localhost:59705',
      healthHost: process.env.NUXT_PUBLIC_HEALTH_HOST || 'http://localhost:59707',
      elasticEnv: process.env.NUXT_PUBLIC_ELASTIC_ENV || 'development',
      version: process.env.NUXT_PUBLIC_VERSION || 'development',
    },
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
    'swagger-ui/dist/swagger-ui.css',
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],
});
