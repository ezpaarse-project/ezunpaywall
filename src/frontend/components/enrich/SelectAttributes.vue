<template>
  <div>
    <v-container fluid>
      <v-autocomplete
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
            <v-list-item-title v-html="item.name" />
            <v-list-item-subtitle v-html="item.info" />
          </v-list-item-content>
        </template>
      </v-autocomplete>
    </v-container>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    items: Array
  },
  data: () => {
    return {}
  },
  methods: {
    updateModel (value) {
      this.$store.dispatch('enrichArgs/update', {
        source: this.label,
        attrs: value
      })
    }
  }
}
</script>

<style>
</style>
