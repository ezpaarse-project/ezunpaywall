<template>
  <section class="ma-3">
    <v-card>
      <v-toolbar
        color="secondary"
        dark
        flat
        dense
      >
        <v-toolbar-title>{{ t('contact.contactUs') }} </v-toolbar-title>
        <v-spacer />
        <v-app-bar-nav-icon>
          <v-icon>mdi-email-edit</v-icon>
        </v-app-bar-nav-icon>
      </v-toolbar>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
        >
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
            item-title="name"
            :rules="subjectRules"
            :label="t('contact.subject')"
            outlined
            required
            return-object
          />
          <v-textarea
            v-model="message"
            :rules="messageRules"
            :label="t('contact.content')"
            name="message"
            outlined
            required
          />
          <v-checkbox
            v-if="subject.value === 'bugs'"
            v-model="sendBrowser"
            :label="t('contact.sendNavigatorVersion')"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="!valid"
          :loading="loading"
          color="primary"
          @click="validate"
        >
          {{ t('send') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </section>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();

const form = ref(null);
const email = ref('');
const message = ref('');
const subject = ref({ key: 'informations', name: t('contact.requestInformation') });
const sendBrowser = ref(true);
const valid = ref(false);
const loading = ref(false);

const subjects = computed(() => [
  {
    key: 'informations',
    name: t('contact.requestInformation'),
  },
  {
    key: 'bugs',
    name: t('contact.bugReport'),
  },
  {
    key: 'apikey',
    name: t('contact.requestApikey'),
  },
]);

const emailRules = computed(() => [
  (v) => !!v || t('contact.emailIsRequired'),
  (v) => /.+@.+\..+/.test(v) || t('contact.emailMustBeValid'),
]);

const messageRules = computed(() => [(v) => !!v || t('contact.contentIsRequired')]);

const subjectRules = computed(() => [(v) => !!v || t('contact.subjectIsRequired')]);

function resetForm() {
  message.value = '';
}

async function validate() {
  if (valid) {
    loading.true = true;
    try {
      await $fetch('/nuxt/mail', {
        method: 'POST',
        body: {
          email: email.value,
          subject: subject.value.name,
          message: message.value,
        },
      });
      resetForm();
      snackStore.success(t('info.contact.mailSent'));
    } catch (err) {
      snackStore.error(t('error.contact.failed'));
    }
    loading.value = false;
  }
}

</script>
