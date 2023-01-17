<template>
  <section>
    <v-container v-if="!isAdmin">
      <v-card>
        <v-toolbar dark color="secondary">
          <v-toolbar-title>Login form</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="password"
            prepend-icon="mdi-lock"
            :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[passwordRules]"
            :type="passwordVisible ? 'text' : 'password'"
            :label="$t('administration.password')"
            @click:append="passwordVisible = !passwordVisible"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="tryLogin()" v-text="$t('administration.login')" />
        </v-card-actions>
      </v-card>
    </v-container>
    <v-container v-else>
      <v-btn color="primary" @click="logOut()" v-text="$t('administration.logout')" />
      <WeekHistory />
      <HealthCards :global-name="globalName" :global-health="globalHealth" />
      <Apikeycards />
    </v-container>
  </section>
</template>

<script>

import WeekHistory from '~/components/administration/report/WeekHistory.vue'
import HealthCards from '~/components/administration/HealthCards.vue'
import Apikeycards from '~/components/administration/ApikeyCards.vue'

export default {
  name: 'Administration',
  components: {
    WeekHistory,
    HealthCards,
    Apikeycards
  },
  data () {
    return {
      password: '',
      passwordVisible: false,
      passwordRules: value => !!value || 'Required.',
      login: false
    }
  },
  computed: {
    isAdmin () {
      return this.$store.state.admin.status
    }
  },
  methods: {
    async tryLogin () {
      try {
        await this.$apikey({
          method: 'GET',
          url: '/login',
          headers: {
            'X-API-KEY': this.password
          }
        })
      } catch (e) {
        this.$store.dispatch('snacks/error', this.$t('administration.errorLogin'))
        this.loading = false
        return
      }
      this.$store.dispatch('admin/setAdmin', true)
      this.$store.dispatch('admin/setPassword', this.password)
      this.$store.dispatch('snacks/info', this.$t('administration.loginSuccess'))
    },
    logOut () {
      this.$store.dispatch('admin/setAdmin', false)
      this.$store.dispatch('admin/setPassword', '')
    }
  }
}
</script>
