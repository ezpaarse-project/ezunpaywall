<template>
  <v-card>
    <v-toolbar
      dark
      color="secondary"
    >
      <v-toolbar-title> {{ t("administration.loginForm") }} </v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form
        v-model="valid"
        @submit.prevent="tryLogin"
      >
        <v-text-field
          v-model="password"
          prepend-icon="mdi-lock"
          :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[passwordRules]"
          :type="passwordVisible ? 'text' : 'password'"
          :label="t('administration.password')"
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
        {{ t("administration.login") }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>

import { useSnacksStore } from '@/store/snacks';
import { useAdminStore } from '@/store/admin';

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $apikey } = useNuxtApp();

const loading = ref(false);
const valid = ref(false);
const password = ref('');
const passwordVisible = ref(false);

const passwordRules = computed(() => (value) => !!value || t('required'));

async function tryLogin() {
  loading.value = true;
  try {
    await $apikey({
      method: 'POST',
      url: '/login',
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (e) {
    snackStore.error(t('error.administration.invalidPassword'));
    loading.value = false;
    return;
  }
  adminStore.setIsAdmin(true);
  adminStore.setPassword(password.value);
  loading.value = false;
  snackStore.success(t('info.administration.login'));
}

</script>
