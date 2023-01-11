<template>
  <div>
    <v-container fluid>
      <v-autocomplete
        :value="selectedComputed"
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
      default: () => ''
    },
    items: {
      type: Array,
      default: () => []
    },
    selected: {
      type: Array,
      default: () => []
    }
  },
  data: () => {
    return {}
  },
  computed: {
    selectedComputed () {
      return this.selected
    }
  },

  methods: {
    updateModel (value) {
      this.$emit(this.label, value)
    }
  }
}
</script>

<style>
</style>
