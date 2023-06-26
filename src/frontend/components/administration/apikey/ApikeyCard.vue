<template>
  <v-card>
    <v-card-title class="pt-5 pl-5 pr-5 ma-2">
      <v-row>
        {{ config.name }}
        <v-spacer />
        <template v-if="config.allowed">
          <span class="green--text">
            {{ $t('administration.apikey.allowed') }}
          </span>
          <v-icon size="30" right color="green">
            mdi-check
          </v-icon>
        </template>

        <template v-else>
          <span class="red--text">
            {{ $t('administration.apikey.notAllowed') }}
          </span>
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
        {{ $t("administration.apikey.ownerValue", { owner: config.owner }) }}
      </v-list-item>
      <v-list-item style="min-height: 32px">
        <v-icon class="mr-3">
          mdi-text-account
        </v-icon>
        {{ $t("administration.apikey.descriptionValue", { description: config.description }) }}
      </v-list-item>
      <v-list-item style="min-height: 32px">
        <v-icon class="mr-3">
          mdi-calendar-account-outline
        </v-icon>
        <span> {{ $t("administration.apikey.createdAtValue", { date: config.createdAt }) }} </span>
      </v-list-item>
      <v-list-item style="min-height: 32px">
        <v-icon class="mr-3">
          mdi-security
        </v-icon>
        <span> {{ $t('administration.apikey.access') }} </span>
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
      <span> {{ $t('administration.apikey.attributes') }} </span>
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

    <v-divider class="mx-2" />

    <v-card-actions>
      <v-btn text @click.stop="setUpdateDialogVisible(true)">
        <span> {{ $t("edit") }} </span>
      </v-btn>
      <UpdateDialog
        v-model="updateDialogVisible"
        :apikey="apikey"
        :config="config"
        @closed="setUpdateDialogVisible(false)"
        @updated="emitUpdated()"
      />
      <v-spacer />
      <v-btn class="red--text" text @click.stop="setDeleteDialogVisible(true)">
        <span> {{ $t("delete") }} </span>
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
