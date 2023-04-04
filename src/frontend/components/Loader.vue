<template>
  <v-progress-circular
    class="ma-8"
    :size="size"
    :width="width"
    indeterminate
    :color="color"
  />
</template>

<script>
export default {
  props: {
    size: {
      type: Number,
      default: 50
    },
    width: {
      type: Number,
      default: 3
    },
    color: {
      type: String,
      default: 'green'
    }
  }
}
</script>
