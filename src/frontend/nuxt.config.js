import colors from 'vuetify/es5/util/colors'

export default {
  publicRuntimeConfig: {
    graphqlURL: process.env.EZUNPAYWALL_GRAPHQL_URL || 'http://localhost:3000',
    updateURL: process.env.EZUNPAYWALL_UPDATE_URL || 'http://localhost:4000',
    enrichURL: process.env.EZUNPAYWALL_ENRICH_URL || 'http://localhost:5000',
    mailURL: process.env.EZUNPAYWALL_MAIL_URL || 'http://localhost:8000',
    apikeyURL: process.env.EZUNPAYWALL_MAIL_URL || 'http://localhost:12000',
    apikeymail: process.env.EZUNPAYWALL_MAIL_APIKEY || 'changeme',
    elasticOrigin: process.env.ELASTICSEARCH_ORIGIN || 'development'
  },

  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - client',
    title: 'client',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'swagger-ui/dist/swagger-ui.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/axios.js' },
    { src: '~/plugins/dateFns.js' }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    // '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    'nuxt-i18n',
    '@nuxtjs/axios'
  ],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    theme: {
      themes: {
        dark: {
          primary: '#4caf50',
          accent: colors.grey.darken3,
          secondary: colors.grey.darken4,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        },
        light: {
          primary: '#4caf50',
          secondary: colors.grey.darken3
        }
      }
    }
  },

  i18n: {
    locales: [
      {
        name: 'Français',
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr.json'
      },
      {
        name: 'English',
        code: 'en',
        iso: 'en-US',
        file: 'en.json'
      }
    ],
    baseUrl: '/',
    defaultLocale: 'fr',
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'ezunpaywall_i18n',
      alwaysRedirect: true,
      fallbackLocale: 'en'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
