<template>
  <v-btn
    color="primary"
    @click="logOut()"
  >
    {{ t('administration.logout') }}
  </v-btn>
</template>

<script setup>

import { useAdminStore } from '@/store/admin';

const adminStore = useAdminStore();
const { t } = useI18n();

function logOut() {
  adminStore.setIsAdmin(false);
  adminStore.setPassword('');
}

</script>
