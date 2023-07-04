<template>
  <section>
    <Login v-if="!isAdmin" />
    <div v-else>
      <v-row class="ma-1">
        <v-btn color="primary" @click="logOut()">
          {{ $t('administration.logout') }}
        </v-btn>
        <v-spacer />
        <v-btn
          :href="dashbordHost"
          target="_blank"
        >
          <img
            style="max-width: 35px"
            :src="require(`@/static/img/ezmesure-logo.svg`)"
            alt="ezmesure-logo"
          >
          ezMESURE
        </v-btn>
      </v-row>
      <WeekHistory />
      <HealthTab />
      <ApikeyTab />
    </div>
  </section>
</template>

<script>

import Login from '~/components/administration/Login.vue'
import WeekHistory from '~/components/administration/update/WeekHistory.vue'
import HealthTab from '~/components/administration/health/HealthTab.vue'
import ApikeyTab from '~/components/administration/apikey/ApikeyTab.vue'

export default {
  name: 'Administration',
  components: {
    Login,
    WeekHistory,
    HealthTab,
    ApikeyTab
  },
  computed: {
    isAdmin () {
      return this.$store.getters['admin/getIsAdmin']
    },
    dashbordHost () {
      return this.$config.dashbordHost
    }
  },
  methods: {
    logOut () {
      this.$store.commit('admin/setIsAdmin', false)
      this.$store.commit('admin/setPassword', '')
    }
  }
}
</script>
