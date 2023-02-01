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
      <v-btn color="primary" @click="tryLogin()" v-text="$t('administration.login')" />
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      password: '',
      passwordVisible: false,
      login: false,
      loading: false
    }
  },
  computed: {
    passwordRules () { return value => !!value || 'Required.' }
  },
  methods: {
    async tryLogin () {
      this.loading = true
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
    }
  }
}
</script>

<style>

</style>
