<template>
  <v-btn
    :href="dashbordHost"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      style="max-width: 35px"
      :src="ezmesureLogo"
      alt="ezmesure-logo"
    >
    ezMESURE
  </v-btn>
</template>

<script setup>

import ezmesureLogo from '@/static/images/ezmesure-logo.svg';

const runtimeConfig = useRuntimeConfig();

const dashbordHost = ref(runtimeConfig.public.dashbordHost);

</script>
