<template>
  <v-layout column>
    <v-layout
      ref="dropZone"
      class="dropzone"
      align-center
      justify-center
      @dragover="dragAndDrop('over')"
      @dragleave="dragAndDrop('leave')"
    >
      <input
        ref="filesLoaded"
        type="file"
        multiple
        @change="handleFilesUpload"
      >
      <v-flex
        class="headline grey--text text-center"
      >
        {{ $t('ui.components.files.clickToAdd') }}
        <v-flex />
      </v-flex>
    </v-layout>

    <v-data-table
      v-if="files.length > 0"
      :headers="headers"
      :items="files"
      hide-default-footer
      class="elevation-1 my-3"
    >
      <template #body="{ items }">
        <tr v-for="(item, index) in items" :key="index">
          <td class="text-center pl-4 py-1">
            <v-icon small @click="removeLogsFile(item.id)">
              mdi-delete
            </v-icon>
          </td>
          <td class="px-3" v-text="item.file.name" />
          <td class="text-right pr-5">
            {{ item.file.size | prettyBytes }}
          </td>
        </tr>
      </template>

      <template #footer>
        <v-toolbar dense flat class="my-2">
          <v-btn color="error" outlined small @click="clearList">
            <v-icon left>
              mdi-delete-forever
            </v-icon>
            <span> {{ $t('ui.components.files.removeList') }} </span>
          </v-btn>

          <v-spacer />

          <span>
            {{ files.length }} {{ $t('ui.components.files.selectedFiles') }}
            ({{ totalFileSize }}) {{ $t('ui.components.files.total') }}
          </span>
        </v-toolbar>
      </template>
    </v-data-table>
  </v-layout>
</template>

<script>
import prettyBytes from 'pretty-bytes'
export default {
  filters: {
    prettyBytes (val) {
      let size = parseInt(val, 10)
      if (Number.isNaN(size)) { size = 0 }
      return prettyBytes(size)
    }
  },
  data: () => {
    return {
      files: [],
      fileId: 1
    }
  },
  computed: {
    headers () {
      return [
        {
          text: '',
          value: 'action',
          sortable: false,
          width: 10
        },
        {
          text: 'Nom du fichier',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        {
          text: 'Taille',
          align: 'right',
          sortable: false,
          value: 'size'
        }
      ]
    },
    totalFileSize () {
      const size = this.files.reduce((prev, { file }) => prev + file.size, 0)
      return prettyBytes(size)
    }
  },
  methods: {
    handleFilesUpload () {
      Array.from(this.$refs.filesLoaded.files).forEach((file) => {
        this.files.push({ id: this.fileId, file })
        this.fileId += 1
      })
      this.$refs.filesLoaded.value = ''
      this.$emit('files', this.files)
    },
    removeLogsFile (id) {
      this.files.filter(file => file.id !== id)
      this.$emit('files', this.files)
    },
    clearList () {
      this.files = []
      this.$emit('files', this.files)
    },
    dragAndDrop (event) {
      if (this.$refs && this.$refs.dropZone) {
        if (event && event === 'over') {
          this.$refs.dropZone.classList.add('overlay')
        }
        if (event && event === 'leave') {
          this.$refs.dropZone.classList.remove('overlay')
        }
      }
    }
  }
}
</script>

<style scoped>
.dropzone {
  position: relative;
  border: 5px dashed #9e9e9e;
  background-color: transparent;
  border-radius: 3px;
  height: 100px;
}
.dropzone input[type='file'] {
  cursor: pointer;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.overlay {
  background-color: rgba(62, 62, 62, 0.3);
  border-color: #787878;
}
</style>
