<template>
  <div class="text-center ma-2">
    <v-btn
      small
      href="https://github.com/ezpaarse-project/ezunpaywall"
      target="_blank"
      rel="noopener noreferrer"
      variant="outlined"
    >
      Version: {{ version }}
      <v-icon right>
        mdi-github
      </v-icon>
    </v-btn>
  </div>
</template>

<script setup>

const runtimeConfig = useRuntimeConfig();

const version = ref(runtimeConfig.public.version);

</script>
