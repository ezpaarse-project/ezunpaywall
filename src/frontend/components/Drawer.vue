<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    clipped
    fixed
    disable-resize-watcher
    disable-route-watcher
    width="300"
  >
    <v-list>
      <v-list-item link router :to="{ path: '/' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-view-dashboard</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="$t('drawer.home')" />
        </v-list-item-content>
      </v-list-item>

      <v-list-item link router :to="{ path: '/enrich' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-code-json</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="$t('drawer.enrich')" />
        </v-list-item-content>
      </v-list-item>

      <v-list-item link router :to="{ path: '/graphql' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-server</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="$t('drawer.graphql')" />
        </v-list-item-content>
      </v-list-item>

      <v-list-item link router :to="{ path: '/open-api' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-api</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="$t('drawer.openapi')" />
        </v-list-item-content>
      </v-list-item>

      <v-list-item link router :to="{ path: '/report-history' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-update</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="$t('drawer.updateHistory')" />
        </v-list-item-content>
      </v-list-item>

      <v-list-item link router :to="{ path: '/contact' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-email</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="$t('drawer.contact')" />
        </v-list-item-content>
      </v-list-item>

      <v-list-item link router :to="{ path: '/administration' }" ripple>
        <v-list-item-icon>
          <v-icon>mdi-security</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="$t('drawer.administration')" />
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-list-group
      no-action
      append-icon="mdi-chevron-down"
      prepend-icon="mdi-translate"
    >
      <template #activator>
        <v-list-item-title
          class="body-2"
          v-text="$t('drawer.language')"
        />
      </template>

      <v-list-item
        v-for="locale in $i18n.locales"
        :key="locale.code"
        @click="$i18n.setLocale(locale.code)"
      >
        <v-list-item-title class="body-2" v-text="locale.name" />
        <v-list-item-icon>
          <img width="24" :src="require(`@/static/img/${locale.code}.png`)">
        </v-list-item-icon>
      </v-list-item>
    </v-list-group>

    <template #append>
      <div class="pa-2 text-center">
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn
              small
              text
              icon
              v-on="on"
              @click="$vuetify.theme.dark = !$vuetify.theme.dark"
            >
              <v-icon v-if="$vuetify.theme.dark">
                mdi-white-balance-sunny
              </v-icon>
              <v-icon v-else>
                mdi-weather-night
              </v-icon>
            </v-btn>
          </template>
          <span v-if="$vuetify.theme.dark" v-text="$t('theme.light')" />
          <span v-else v-text="$t('theme.dark')" />
        </v-tooltip>

        <v-spacer />

        <v-btn
          small
          class="ma-3"
          href="https://github.com/ezpaarse-project/ezunpaywall#readme"
          target="_blank"
          rel="noreferrer"
          outlined
        >
          Version: {{ $config.version }}
          <v-icon right>
            mdi-github
          </v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'Drawer',
  computed: {
    drawer: {
      get () {
        return this.$store.getters['drawer/getStatus']
      },
      set (newVal) {
        this.$store.commit('drawer/setDrawer', newVal)
      }
    }
  }
}
</script>
