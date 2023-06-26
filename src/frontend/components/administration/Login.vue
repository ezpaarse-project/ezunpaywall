<template>
  <v-card>
    <v-toolbar dark color="secondary">
      <v-toolbar-title> {{ $t("administration.loginForm") }} </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form v-model="valid" @submit.prevent="tryLogin">
        <v-text-field
          v-model="password"
          prepend-icon="mdi-lock"
          :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[passwordRules]"
          :type="passwordVisible ? 'text' : 'password'"
          :label="$t('administration.password')"
          autocomplete="on"
          @click:append="passwordVisible = !passwordVisible"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        :loading="loading"
        :disabled="!valid"
        color="primary"
        @click="tryLogin()"
      >
        {{ $t("administration.login") }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      loading: false,
      valid: false,
      password: '',
      passwordVisible: false,
      login: false
    }
  },
  computed: {
    passwordRules () {
      return value => !!value || this.$t('required')
    }
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
        this.$store.dispatch('snacks/error', this.$t('error.admininistration.login'))
        this.loading = false
        return
      }
      this.$store.commit('admin/setIsAdmin', true)
      this.$store.commit('admin/setPassword', this.password)
      this.loading = false
      this.$store.dispatch('snacks/info', this.$t('info.admininistration.login'))
    }
  }
}
</script>

<style>
</style>
