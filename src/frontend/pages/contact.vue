<template>
  <section>
    <v-card>
      <v-toolbar color="secondary" dark flat dense>
        <v-toolbar-title>{{ $t('contact.contactUs') }} </v-toolbar-title>
        <v-spacer />
        <v-icon>mdi-email-edit</v-icon>
      </v-toolbar>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="Email"
            name="email"
            outlined
            clearable
            required
          />
          <v-select
            v-model="subject"
            :items="subjects"
            :rules="subjectRules"
            :label="$t('contact.subject')"
            name="subject"
            outlined
            required
            return-object
          />
          <v-textarea
            v-model="message"
            :rules="messageRules"
            :label="$t('contact.content')"
            name="message"
            outlined
            required
          />
          <v-checkbox
            v-if="subject.value === 'bugs'"
            v-model="sendBrowser"
            :label="$t('contact.sendNavigatorVersion')"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="error"
          @click="$router.go(-1)"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          :disabled="!valid"
          :loading="loading"
          color="primary"
          @click="validate"
        >
          {{ $t('send') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </section>
</template>

<script>
export default {
  transition: 'slide-x-transition',
  data: () => ({
    email: '',
    message: '',
    subject: {},
    sendBrowser: true,
    valid: true,
    loading: false
  }),
  head () {
    return {
      title: 'Contact'
    }
  },
  computed: {
    subjects () {
      return [
        {
          value: 'informations',
          text: this.$t('contact.requestInformation')
        },
        {
          value: 'bugs',
          text: this.$t('contact.bugReport')
        },
        {
          value: 'apikey',
          text: this.$t('contact.requestApikey')
        }
      ]
    },
    emailRules () {
      return [
        v => !!v || this.$t('contact.emailIsRequired'),
        v => /.+@.+\..+/.test(v) || this.$t('contact.emailMustBeValid')
      ]
    },
    messageRules () {
      return [v => !!v || this.$t('contact.contentIsRequired')]
    },
    subjectRules () {
      return [v => !!v || this.$t('contact.subjectIsRequired')]
    }
  },
  methods: {
    async validate () {
      this.$refs.form.validate()
      if (this.valid) {
        this.loading = true
        try {
          await this.$mail.post('/contact', {
            email: this.email,
            subject: this.subject?.text,
            message: this.message
          })
          this.$store.dispatch('snacks/success', this.$t('info.contact.mailSent'))
          this.email = ''
          this.subject = {}
          this.message = ''
          this.sendBrowser = true
          this.$refs.form.resetValidation()
          this.loading = false
        } catch (e) {
          this.$store.dispatch('snacks/error', this.$t('error.contact.failed'))
          this.loading = false
        }
      }
    }
  }
}
</script>
