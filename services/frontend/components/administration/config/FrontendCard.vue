<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title>
        Frontend
      </v-toolbar-title>
    </v-toolbar>
    <JSONView :code="config" />
  </v-card>
</template>

<script setup>

const runtimeConfig = useRuntimeConfig();

const config = ref(JSON.stringify(runtimeConfig.public, null, 2));

</script>
