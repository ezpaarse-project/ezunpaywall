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
          {{ item.name }}
          <v-spacer />
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-icon color="primary" dark v-bind="attrs" v-on="on">
                mdi-information
              </v-icon>
            </template>
            <span>{{ item.info }}</span>
          </v-tooltip>
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
  data: () => { return {} },
  methods: {
    updateModel (value) {
      this.$store.dispatch('enrichArgs/update', { source: this.label, attrs: value })
    }
  }
}
</script>

<style>
</style>
