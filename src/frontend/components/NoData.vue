<template>
  <v-row align="center" justify="center">
    <v-col class="text-center" cols="12" sm="4">
      {{ text }}
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: ''
    }
  }
}
</script>
