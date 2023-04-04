<template>
  <div>
    <v-autocomplete
      :value="value"
      :label="label"
      :items="items"
      item-text="name"
      small-chips
      clearable
      deletable-chips
      multiple
      @input="updateModel"
    >
      <template slot="item" slot-scope="{ item }">
        <v-list-item-content>
          <v-list-item-title> {{ item.name }} </v-list-item-title>
          <v-list-item-subtitle> {{ item.info }} </v-list-item-subtitle>
        </v-list-item-content>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: () => ''
    },
    items: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data: () => {
    return {}
  },

  methods: {
    updateModel (value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style>
</style>
