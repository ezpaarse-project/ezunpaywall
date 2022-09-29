<template>
  <div>
    <v-bottom-navigation :value="value" color="primary" horizontal>
      <v-btn @click="setValue(0)">
        <span>Enrich</span>
      </v-btn>

      <v-btn @click="setValue(1)">
        <span>Update</span>
      </v-btn>

      <v-btn @click="setValue(2)">
        <span>Apikey</span>
      </v-btn>

      <v-btn @click="setValue(3)">
        <span>Mail</span>
      </v-btn>
    </v-bottom-navigation>
    <Enrich v-if="value === 0" />
    <Update v-if="value === 1" />
    <Apikey v-if="value === 2" />
    <Mail v-if="value === 3" />
  </div>
</template>

<script>
import Enrich from '~/components/openapi/Enrich.vue'
import Update from '~/components/openapi/Update.vue'
import Apikey from '~/components/openapi/Apikey.vue'
import Mail from '~/components/openapi/Mail.vue'

export default {
  components: {
    Enrich,
    Update,
    Apikey,
    Mail
  },
  data: () => ({ value: 0 }),
  head () {
    return {
      title: 'Doc'
    }
  },
  methods: {
    setValue (value) {
      this.value = value
    }
  }
}
</script>
