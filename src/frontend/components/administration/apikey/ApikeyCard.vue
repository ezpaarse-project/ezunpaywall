<template>
  <v-card>
    <v-card-title class="pt-5 pl-5 pr-5 ma-2">
      <v-row>
        {{ config.name }}
        <v-spacer />
        <template v-if="config.allowed">
          <span class="green--text" v-text="$t('administration.apikey.allowed')" />
          <v-icon size="30" right color="green">
            mdi-check
          </v-icon>
        </template>

        <template v-else>
          <span class="red--text" v-text="$t('administration.apikey.notAllowed')" />
          <v-icon size="30" right color="red">
            mdi-close
          </v-icon>
        </template>
      </v-row>
    </v-card-title>

    <v-card-subtitle class="pb-0">
      {{ apikey }}
    </v-card-subtitle>

    <v-divider class="ma-2" />

    <div class="ml-8">
      <span v-text="$t('administration.apikey.access')" />
      <v-chip
        v-for="access in config.access"
        :key="access"
        color="primary"
        text-color="white"
        class="ma-1"
        label
        small
      >
        {{ access }}
      </v-chip>
    </div>

    <div class="ml-8">
      <span v-text="$t('administration.apikey.attributes')" />
      <v-chip
        v-for="attributes in config.attributes"
        :key="attributes"
        color="green darken-3"
        text-color="white"
        class="ma-1"
        label
        small
      >
        {{ attributes }}
      </v-chip>
    </div>

    <v-card-actions>
      <v-btn
        color="orange"
        @click.stop="setUpdateDialogVisible(true)"
      >
        <v-icon color="white">
          mdi-pencil
        </v-icon>
      </v-btn>
      <UpdateDialog
        :visible="updateDialogVisible"
        :apikey="apikey"
        :config="config"
        @closed="setUpdateDialogVisible(false)"
        @updated="emitUpdated()"
      />
      <v-spacer />
      <v-btn
        color="red"
        @click.stop="setDeleteDialogVisible(true)"
      >
        <v-icon color="white">
          mdi-delete
        </v-icon>
      </v-btn>
      <DeleteDialog
        :visible="deleteDialogVisible"
        :apikey="apikey"
        @closed="setDeleteDialogVisible(false)"
        @deleted="emitDeleted()"
      />
    </v-card-actions>
  </v-card>
</template>

<script>

import DeleteDialog from '~/components/administration/apikey/DeleteDialog.vue'
import UpdateDialog from '~/components/administration/apikey/UpdateDialog.vue'

export default {
  name: 'ApikeyCard',
  components: {
    DeleteDialog,
    UpdateDialog
  },
  props: {
    apikey: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      updateDialogVisible: false,
      deleteDialogVisible: false
    }
  },
  methods: {
    setUpdateDialogVisible (value) {
      this.updateDialogVisible = value
    },
    emitUpdated () {
      this.$emit('updated')
    },
    setDeleteDialogVisible (value) {
      this.deleteDialogVisible = value
    },
    emitDeleted () {
      this.$emit('deleted')
    }
  }
}
</script>
