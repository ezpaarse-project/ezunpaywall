<template>
  <v-card>
    <v-layout justify-end class="mb-3">
      <v-btn :disabled="isProcessing || error" @click="download()">
        <v-icon left>
          mdi-download
        </v-icon>
        {{ $t("enrich.download") }}
      </v-btn>
    </v-layout>
    <v-container v-if="isProcessing" class="text-center">
      <v-progress-circular
        :size="70"
        :width="7"
        indeterminate
        color="green"
      />
      <div v-text="stepTitle" />
    </v-container>
    <v-container v-else class="text-center">
      <v-icon v-if="error" size="70" color="orange darken-2">
        mdi-alert-circle
      </v-icon>
      <v-icon v-else size="70" color="green darken-2">
        mdi-check
      </v-icon>
      <div v-if="error" v-text="$t('error.enrich.job')" />
      <div v-else v-text="$t('enrich.end')" />
    </v-container>
    <v-container>
      <Report :time="time" :state="state" />
    </v-container>
  </v-card>
</template>

<script>
import Report from '~/components/enrich/Report.vue'

export default {
  name: 'EnrichProcessTab',
  components: {
    Report
  },
  data: () => ({
    // process
    files: [],
    apikey: 'demo',
    attributes: ['doi'],
    separator: ',',
    type: '',
    state: {},
    stepTitle: '',
    timer: undefined,
    time: 0,
    isProcessing: false,
    error: false,
    id: ''
  }),
  computed: {
    resultID () {
      return `${this.id}.${this.type}`
    }
  },
  mounted () {
    this.$root.$on('startEnrich', async () => {
      this.attributes = this.$store.getters['enrich/getAttributes']
      this.type = this.$store.getters['enrich/getType']
      this.apikey = this.$store.getters['enrich/getApikey']
      this.separator = this.$store.getters['enrich/getEnrichedFileSeparator']
      if (this.type === 'csv') {
        this.attributes = this.attributes.filter(e => !e.includes('oa_locations'))
      }
      this.files = this.$store.getters['enrich/getFiles']
      await this.enrich()
    })
  },
  methods: {
    async upload () {
      const formData = new FormData()
      formData.append('file', this.files[0].file)

      let upload

      this.stepTitle = this.$t('enrich.stepUpload')
      try {
        upload = await this.$enrich({
          method: 'POST',
          url: '/upload',
          data: formData,
          headers: {
            'Content-Type': 'text/csv',
            'x-api-key': this.apikey
          },
          responseType: 'json'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.enrich.uploadFile'))
        return this.errored()
      }
      const id = upload.data

      return id
    },
    async startEnrichJob (id, data) {
      try {
        await this.$enrich({
          method: 'POST',
          url: `/job/${id}`,
          data,
          headers: {
            'x-api-key': this.apikey
          },
          responseType: 'json'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.enrich.job'))
        return this.errored()
      }
    },

    async getStateOfEnrichJob (id) {
      let state

      do {
        try {
          state = await this.$enrich({
            method: 'GET',
            url: `/states/${id}.json`,
            responseType: 'json',
            headers: {
              'x-api-key': this.apikey
            }
          })
          this.state = state?.data
        } catch (err) {
          this.$store.dispatch('snacks/error', this.$t('error.enrich.state'))
          return this.errored()
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      } while (!state?.data?.done)
    },

    async enrich () {
      this.time = 0
      this.error = false
      this.startTimer(Date.now())
      this.isProcessing = true
      this.$emit('isProcessing', true)

      const graphqlAttributes = this.parseUnpaywallAttributesToGraphqlAttributes(this.attributes)
      const id = await this.upload()

      if (!this.error) {
        const data = {
          type: this.type,
          args: graphqlAttributes,
          separator: this.separator
        }
        await this.startEnrichJob(id, data)
      }

      if (!this.error) {
        this.stepTitle = this.$t('enrich.stepEnrich')
        await this.getStateOfEnrichJob(id)
      }

      this.stopTimer()
      this.isProcessing = false
      this.$emit('isProcessing', false)
      this.id = id
    },

    async download () {
      let download
      try {
        download = await this.$enrich({
          method: 'GET',
          url: `/enriched/${this.resultID}`,
          headers: {
            'x-api-key': this.apikey
          },
          responseType: 'blob'
        })
      } catch (err) {
        this.$store.dispatch('snacks/error', this.$t('error.enrich.download'))
        return this.errored()
      }
      this.forceFileDownload(download)
    },

    forceFileDownload (response) {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', this.resultID)
      console.log(link)
      console.log(url)
      console.log(this.resultID)
      document.body.appendChild(link)
      link.click()
    },

    startTimer (startTime) {
      this.timer = setInterval(() => {
        this.time = Math.ceil((Date.now() - startTime) / 1000)
      }, 500)
    },

    stopTimer () {
      clearInterval(this.timer)
    },

    errored () {
      this.stopTimer()
      this.error = true
      this.isProcessing = false
      this.state = {}
      this.id = ''
    },

    parseUnpaywallAttributesToGraphqlAttributes (attributes) {
      const simple = attributes.filter((e) => { return !e.includes('.') })
      let best_oa_location = attributes.filter((e) => { return e.includes('best_oa_location') })
      let first_oa_location = attributes.filter((e) => { return e.includes('first_oa_location') })
      let oa_locations = attributes.filter((e) => { return e.includes('oa_locations') })
      let z_authors = attributes.filter((e) => { return e.includes('z_authors') })

      if (
        !simple.length &&
        !best_oa_location.length &&
        !first_oa_location.length &&
        !oa_locations.length &&
        !z_authors.length
      ) {
        return ''
      }
      const attrs = []
      if (simple.length) {
        attrs.push(simple.join(', '))
      }
      if (best_oa_location.length) {
        best_oa_location = best_oa_location.map((e) => { return e.split('.')[1] })
        attrs.push(`best_oa_location { ${best_oa_location.join(', ')} }`)
      }
      if (first_oa_location.length) {
        first_oa_location = first_oa_location.map((e) => { return e.split('.')[1] })
        attrs.push(`first_oa_location { ${first_oa_location.join(', ')} }`)
      }
      if (oa_locations.length) {
        oa_locations = oa_locations.map((e) => { return e.split('.')[1] })
        attrs.push(`oa_locations { ${oa_locations.join(', ')} }`)
      }
      if (z_authors.length) {
        z_authors = z_authors.map((e) => { return e.split('.')[1] })
        attrs.push(`z_authors { ${z_authors.join(', ')} }`)
      }
      return `{ ${attrs.join(', ')} }`
    }
  }
}
</script>
