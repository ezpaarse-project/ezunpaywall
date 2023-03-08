<template>
  <v-card>
    <v-card-title class="pt-5 pl-5 pr-5 ma-2">
      <v-row>
        {{ config.name }}
        <v-spacer />
        <template v-if="config.allowed">
          <span
            class="green--text"
            v-text="$t('administration.apikey.allowed')"
          />
          <v-icon size="30" right color="green">
            mdi-check
          </v-icon>
        </template>

        <template v-else>
          <span
            class="red--text"
            v-text="$t('administration.apikey.notAllowed')"
          />
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

    <v-list>
      <v-list-item style="min-height: 16px">
        <v-icon class="mr-3">
          mdi-account-circle
        </v-icon>
        {{ $t("administration.apikey.owner") }} : {{ config.owner }}
      </v-list-item>
      <v-list-item style="min-height: 32px">
        <v-icon class="mr-3">
          mdi-text-account
        </v-icon>
        {{ $t("administration.apikey.description") }} : {{ config.description }}
      </v-list-item>
      <v-list-item style="min-height: 32px">
        <v-icon class="mr-3">
          mdi-calendar-account-outline
        </v-icon>
        <span> {{ $t("createdAt") }} : {{ config.createdAt }} </span>
      </v-list-item>
      <v-list-item style="min-height: 32px">
        <v-icon class="mr-3">
          mdi-security
        </v-icon>
        <span v-text="`${$t('administration.apikey.access')} :`" />
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
      </v-list-item>
      <v-icon class="mr-2 ml-4">
        mdi-code-json
      </v-icon>
      <span v-text="`${$t('administration.apikey.attributes')} :`" />
      <v-chip
        v-for="attribute in config.attributes"
        :key="attribute"
        color="green darken-3"
        text-color="white"
        class="ma-1"
        label
        small
      >
        {{ attribute }}
      </v-chip>
    </v-list>

    <v-card-actions>
      <v-btn color="orange" @click.stop="setUpdateDialogVisible(true)">
        <v-icon color="white">
          mdi-pencil
        </v-icon>
      </v-btn>
      <UpdateDialog
        v-model="updateDialogVisible"
        :apikey="apikey"
        :config="config"
        @closed="setUpdateDialogVisible(false)"
        @updated="emitUpdated()"
      />
      <v-spacer />
      <v-btn color="red" @click.stop="setDeleteDialogVisible(true)">
        <v-icon color="white">
          mdi-delete
        </v-icon>
      </v-btn>
      <DeleteDialog
        v-model="deleteDialogVisible"
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
