<template>
  <v-dialog
    :value="value"
    max-width="1000px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        <v-toolbar-title>
          {{ t('administration.apikey.create') }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form
          id="formCreate"
          v-model="validForm"
          @submit.prevent="createApikey()"
        >
          <v-text-field
            v-model="name"
            :rules="nameRule"
            :label="t('administration.apikey.name')"
            name="name"
            outlined
            clearable
            required
            autofocus
          />
          <v-text-field
            v-model="owner"
            :label="t('administration.apikey.owner')"
            name="owner"
            outlined
            clearable
            required
          />
          <v-text-field
            v-model="description"
            :label="t('administration.apikey.description')"
            name="description"
            outlined
            clearable
            required
          />
          <v-card-actions>
            <span
              class="mr-2"
              v-text="`${t('administration.apikey.access')}`"
            />
            <v-checkbox
              v-model="graphql"
              class="mr-2"
              label="graphql"
            />
            <v-checkbox
              v-model="enrich"
              label="enrich"
            />
          </v-card-actions>
          <v-card-actions>
            <span
              class="mr-2"
              v-text="`${t('administration.apikey.allowed')} :`"
            />
            <v-checkbox v-model="allowed" />
          </v-card-actions>
          <v-divider />
          <v-card-title> {{ t('administration.apikey.attributes') }} </v-card-title>
          <UnpaywallArgsSelectorAttributes
            @attributes="updateAttributes"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          class="red--text"
          @click.stop="emit('update:modelValue', false)"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          type="submit"
          form="formCreate"
          :disabled="!validForm"
          :loading="loading"
          class="green--text"
        >
          {{ t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $admin } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const emit = defineEmits({
  'update:modelValue': () => true,
  created: () => true,
});

const value = ref('false');
const loading = ref(false);
const name = ref('');
const owner = ref('');
const description = ref('');
const enrich = ref(false);
const graphql = ref(true);
const attributes = ref(['doi']);
const allowed = ref(true);

const nameRule = computed(() => [(v) => !!v || t('required')]);

const access = computed(() => {
  const res = [];
  if (enrich.value) { res.push('enrich'); }
  if (graphql.value) { res.push('graphql'); }
  return res;
});

const validForm = computed(() => attributes.value?.length > 0
  && name.value?.length > 0
  && access.value?.length > 0);

async function createApikey() {
  loading.value = true;
  try {
    await $admin('/apikeys', {
      method: 'POST',
      body: {
        name: name.value,
        owner: owner.value,
        description: description.value,
        attributes: attributes.value,
        access: access.value,
        allowed: allowed.value,
      },
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.apikey.create'));
    loading.value = false;
    return;
  }
  snackStore.info(t('info.apikey.created'));
  emit('created');
  loading.value = false;
  emit('update:modelValue', false);
}

function updateAttributes(selectedAttributes) {
  // 18 + 5 + 4 * 11 = 67 is the sum of attributes available through ezunpaywall
  if (selectedAttributes.length === 66) {
    attributes.value = ['*'];
  } else {
    attributes.value = selectedAttributes;
  }
}
</script>
