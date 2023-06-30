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
        {{ $t('fileSelector.clickToAdd') }}
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
            <v-icon small @click="removeFile(item.id)">
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
            <span> {{ $t('fileSelector.removeList') }} </span>
          </v-btn>

          <v-spacer />

          <span>
            {{ files.length }} {{ $t('fileSelector.selectedFiles') }}
            ({{ totalFileSize }}) {{ $t('fileSelector.total') }}
          </span>
        </v-toolbar>
      </template>
    </v-data-table>
  </v-layout>
</template>

<script>
import prettyBytes from 'pretty-bytes'
export default {
  name: 'EnrichLogFiles',
  filters: {
    prettyBytes (val) {
      let size = parseInt(val, 10)
      if (Number.isNaN(size)) { size = 0 }
      return prettyBytes(size)
    }
  },
  data: () => {
    return {
      fileId: 1
    }
  },
  computed: {
    files: {
      get () {
        return this.$store.getters['enrich/getFiles']
      },
      set (newVal) {
        this.$store.commit('enrich/setFiles', newVal)
      }
    },
    headers () {
      return [
        {
          text: '',
          value: 'action',
          sortable: false,
          width: 10
        },
        {
          text: this.$t('fileSelector.filename'),
          align: 'left',
          sortable: false,
          value: 'name'
        },
        {
          text: this.$t('fileSelector.size'),
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
        const ext = file.name.split('.').pop()
        if (!['csv', 'jsonl'].includes(ext)) {
          this.$store.dispatch('snacks/error', this.$t('error.enrich.uploadFile'))
          return
        }
        if (this.files.length >= 1) {
          this.$store.dispatch('snacks/error', this.$t('error.enrich.manyFile'))
          return
        }
        this.$store.commit('enrich/setFiles', [{ id: this.fileId, file }])
        this.$store.commit('enrich/setType', ext)
        this.fileId += 1
      })
      this.$refs.filesLoaded.value = ''
    },
    removeFile (id) {
      this.files = this.files.filter(file => file.id !== id)
      this.$store.commit('enrich/setFiles', this.files)
      this.$store.commit('enrich/setType', '')
    },
    clearList () {
      this.files = []
      this.$store.commit('enrich/setFiles', this.files)
      this.$store.commit('enrich/setType', '')
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
