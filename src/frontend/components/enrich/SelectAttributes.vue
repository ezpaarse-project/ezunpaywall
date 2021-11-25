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
            <v-list-item-title v-text="item.name" />
            <v-list-item-subtitle v-text="item.info" />
          </v-list-item-content>
        </template>
      </v-autocomplete>
    </v-container>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: () => ('')
    },
    items: {
      type: Array,
      default: () => ([])
    }
  },
  data: () => {
    return {}
  },
  methods: {
    updateModel (value) {
      this.$store.dispatch('enrich/update', {
        source: this.label,
        attrs: value
      })
    }
  }
}
</script>

<style>
</style>
