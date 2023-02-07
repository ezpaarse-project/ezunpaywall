<template>
  <v-card>
    <v-toolbar dark color="secondary">
      <v-toolbar-title v-text="$t('administration.loginForm')" />
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
      <v-btn :loading="loading" color="primary" @click="tryLogin()" v-text="$t('administration.login')" />
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      loading: false,
      password: '',
      passwordVisible: false,
      login: false
    }
  },
  computed: {
    passwordRules () { return value => !!value || this.$t('required') }
  },
  methods: {
    async tryLogin () {
      this.loading = true
      try {
        await this.$apikey({
          method: 'POST',
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
      this.$store.dispatch('admin/setIsAdmin', true)
      this.$store.dispatch('admin/setPassword', this.password)
      this.$store.dispatch('snacks/info', this.$t('administration.loginSuccess'))
      this.loading = false
    }
  }
}
</script>

<style>

</style>
