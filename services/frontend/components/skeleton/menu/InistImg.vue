<template>
  <v-row justify="center">
    <v-col cols="auto">
      <a
        href="https://inist.fr"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          v-if="theme.global.current.value.dark"
          src="/static/images/inist-dark.png"
          alt="Inist CNRS"
          style="max-width: 120px; max-height: 120px;"
        >
        <img
          v-else
          src="/static/images/inist-light.png"
          alt="Inist CNRS"
          style="max-width: 120px; max-height: 120px;"
        >
      </a>
    </v-col>
  </v-row>
</template>

<script setup>

import { useTheme } from 'vuetify';

const theme = useTheme();

</script>
