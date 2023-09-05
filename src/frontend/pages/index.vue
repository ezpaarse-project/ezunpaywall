<template>
  <section class="ma-3">
    <HomeCard class="my-3" />
    <MetricsCard />
  </section>
</template>

<script setup>

console.log(useNuxtApp())

import HomeCard from '@/components/home/HomeCard.vue';
import MetricsCard from '@/components/home/MetricsCard.vue';

</script>
