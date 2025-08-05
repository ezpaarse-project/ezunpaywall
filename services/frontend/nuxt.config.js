// https://nuxt.com/docs/api/configuration/nuxt-config
export default ({
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
      environment: process.env.NUXT_PUBLIC_ENVIRONMENT || 'local',
      unpaywallURL: process.env.NUXT_PUBLIC_UNPAYWALL_URL || 'https://unpaywall.org',
      unpaywallApiUrl: process.env.NUXT_PUBLIC_UNPAYWALL_API_URL || 'http://api.unpaywall.org',
      ezmesureURL: process.env.NUXT_PUBLIC_EZMESURE_URL || 'https://ezmesure.couperin.org/kibana/s/ezunpaywall/app/dashboards',
      kibanaURL: process.env.NUXT_PUBLIC_KIBANA_URL || 'http://localhost:5601',
      graphqlURL: process.env.NUXT_PUBLIC_GRAPHQL_URL || 'http://localhost:59701',
      enrichURL: process.env.NUXT_PUBLIC_ENRICH_URL || 'http://localhost:59702',
      adminUrl: process.env.NUXT_PUBLIC_ADMIN_URL || 'http://localhost:59703',
      elasticEnv: process.env.NUXT_PUBLIC_ELASTIC_ENV || 'local',
      version: process.env.NUXT_PUBLIC_VERSION || 'local',
    },
    adminUrl: process.env.NUXT_ADMIN_URL || 'http://admin:3003',
    adminApikey: process.env.NUXT_ADMIN_APIKEY || 'changeme',
  },

  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: '0.0.0.0',
        clientPort: 80,
      },
    },
  },

  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
  },

  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],

  build: {
    transpile: ['vuetify', 'date-fns', '@intlify/core-base'],
  },

  i18n: {
    vueI18n: './config/i18n.js',
  },

  pinia: {
    storesDirs: ['./store/**'],
  },

  css: [
    'swagger-ui-dist/swagger-ui.css',
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],

  compatibilityDate: '2024-08-08',
});
