<template>
  <v-progress-circular
    class="ma-8"
    :size="props.size"
    :width="props.width"
    indeterminate
    :color="props.color"
  />
</template>

<script setup>

const props = defineProps({
  size: { type: Number, default: 50 },
  width: { type: Number, default: 3 },
  color: { type: String, default: 'green' },
});

</script>
