<template>
  <div>
    <v-container fluid>
      <v-autocomplete
        v-model="tab"
        :label="label"
        :items="items"
        item-text="name"
        small-chips
        clearable
        deletable-chips
        multiple
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
  data () {
    return {
      tab: []
    }
  },
  computed: {
    allItems () {
      return this.tab.length === this.items.length
    },
    someItems () {
      this.emit()
      return this.tab.length > 0 && !this.allItems
    },
    icon () {
      if (this.allItems) {
        return 'mdi-close-box'
      }
      if (this.someItems) {
        return 'mdi-minus-box'
      }
      return 'mdi-checkbox-blank-outline'
    }
  },
  methods: {
    toggle () {
      this.$nextTick(() => {
        if (this.allItems) {
          this.tab = []
        } else {
          this.tab = this.items.slice()
          this.emit()
        }
      })
    },
    emit () {
      this.$emit('tab', { label: this.label, tab: this.tab })
    }
  }
}
</script>

<style>
</style>
