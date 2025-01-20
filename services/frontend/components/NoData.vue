<template>
  <v-row
    align="center"
    justify="center"
    class="my-4"
  >
    <v-col
      class="text-center"
      cols="12"
      sm="4"
    >
      {{ props.text }}
    </v-col>
  </v-row>
</template>

<script setup>

const props = defineProps({
  text: { type: String, default: '' },
});

</script>
