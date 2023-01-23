<template>
  <v-card>
    <v-card-title class="pt-5 pl-5 pr-5 ma-2">
      <v-row>
        {{ config.name }}
        <v-spacer />
        <span v-if="config.allowed" class="green--text"> Allowed </span>
        <v-icon v-if="config.allowed" size="30" right color="green">
          mdi-check
        </v-icon>

        <span v-if="!config.allowed" class="red--text"> Not Allowed </span>
        <v-icon v-if="!config.allowed" size="30" right color="red">
          mdi-close
        </v-icon>
      </v-row>
    </v-card-title>

    <v-card-subtitle class="pb-0">
      {{ apikey }}
    </v-card-subtitle>

    <v-divider class="ma-2" />

    <div class="ml-8">
      access:
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
      attributes:
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
        @click.stop="setUpdateDialogShow(true)"
      >
        <v-icon color="white">
          mdi-pencil
        </v-icon>
      </v-btn>
      <UpdateDialog
        :dialog="updateDialogShow"
        :apikey="apikey"
        :config="config"
        @closed="setUpdateDialogShow(false)"
        @updated="emitUpdated()"
      />
      <v-spacer />
      <v-btn
        color="red"
        @click.stop="setDeleteDialogShow(true)"
      >
        <v-icon color="white">
          mdi-delete
        </v-icon>
      </v-btn>
      <DeleteDialog
        :dialog="deleteDialogShow"
        :apikey="apikey"
        @closed="setDeleteDialogShow(false)"
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
      default: () => {}
    }
  },
  data () {
    return {
      updateDialogShow: false,
      deleteDialogShow: false,
      apikeys: {}
    }
  },
  methods: {
    setUpdateDialogShow (value) {
      this.updateDialogShow = value
    },
    emitUpdated () {
      this.$emit('updated')
    },
    setDeleteDialogShow (value) {
      this.deleteDialogShow = value
    },
    emitDeleted () {
      this.$emit('deleted')
    }
  }
}
</script>
