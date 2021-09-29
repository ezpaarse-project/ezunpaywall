<template>
  <v-snackbar
    v-if="currentMessage"
    v-model="visible"
    bottom
    right
    :color="currentMessage.color"
    :timeout="currentMessage.timeout"
  >
    {{ currentMessage.text }}
    <template #action="{ attrs }">
      <v-btn
        icon
        v-bind="attrs"
        dark
        text
        right
        @click.native="visible = false"
      >
        <v-icon>
          mdi-window-close
        </v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapState, mapActions } from 'vuex'
export default {
  data () {
    return {
      visible: false
    }
  },
  computed: {
    ...mapState('snacks', ['messages']),
    currentMessage () {
      return this.messages[0]
    }
  },
  watch: {
    messages () {
      if (!this.visible && this.messages.length) {
        this.visible = true
      }
    },
    async visible () {
      if (this.visible || !this.messages.length) {
        return
      }
      await this.$nextTick()
      // wait a little before opening the next message
      setTimeout(() => {
        this.shiftMessages()
        this.visible = true
      }, 200)
    }
  },

  methods: {
    ...mapActions('snacks', ['shiftMessages'])
  }
}
</script>
