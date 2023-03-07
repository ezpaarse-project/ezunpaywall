<template>
  <v-row align="center" justify="center">
    <v-col class="text-center" cols="12" sm="4">
      {{ $t(localKey) }}
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    localKey: {
      type: String,
      default: 'noData'
    }
  }
}
</script>
