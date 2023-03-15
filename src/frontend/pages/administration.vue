<template>
  <section>
    <Login v-if="!isAdmin" />
    <div v-else>
      <v-btn color="primary" @click="logOut()" v-text="$t('administration.logout')" />
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
    }
  },
  methods: {
    logOut () {
      this.$store.dispatch('admin/setIsAdmin', false)
      this.$store.dispatch('admin/setPassword', '')
    }
  }
}
</script>
