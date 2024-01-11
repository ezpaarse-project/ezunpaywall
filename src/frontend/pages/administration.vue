<template>
  <section class="ma-3">
    <Login v-if="!isAdmin" />
    <div v-else>
      <v-row class="my-2 mx-1">
        <LogoutButton />
        <v-spacer />
        <EzmesureButton />
      </v-row>
      <ReportsCard :type="'unpaywall'" />
      <ReportsCard
        :type="'unpaywallHistory'"
        class="my-4"
      />
      <HealthTab class="my-2" />
      <ApikeyTab class="my-2" />
    </div>
  </section>
</template>

<script setup>

import Login from '@/components/administration/Login.vue';
import LogoutButton from '@/components/administration/LogoutButton.vue';
import EzmesureButton from '@/components/administration/EzmesureButton.vue';
import ReportsCard from '@/components/report/ReportsCard.vue';
import HealthTab from '@/components/administration/health/HealthTab.vue';
import ApikeyTab from '@/components/administration/apikey/ApikeyTab.vue';

import { useAdminStore } from '@/store/admin';

const adminStore = useAdminStore();

const isAdmin = computed(() => adminStore.isAdmin);

</script>
