<template>
  <section class="ma-3">
    <ReportsCard :type="'unpaywall'" />

    <ReportsCard
      :type="'unpaywallHistory'"
      class="my-4"
    />
  </section>
</template>

<script setup>

import ReportsCard from '@/components/report/ReportsCard.vue';

</script>
