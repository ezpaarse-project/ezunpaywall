<template>
  <v-dialog :value="visible" max-width="1000px" @input="closeDialog">
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <span class="mr-2" v-text="report.createdAt" />
      </v-toolbar>
      <v-card-text>
        <pre>
          <code v-highlight class="json">{{ stringifiedReport }}</code>
        </pre>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click.stop="closeDialog()"
          v-text="$t('close')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    report: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    visible: {
      get () {
        return this.dialog
      },
      set (dialog) {
        this.$emit('input', dialog)
      }
    }
  },
  methods: {
    closeDialog () {
      this.$emit('closed')
      this.visible = false
    }
  }
}
</script>
