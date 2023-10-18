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
          {{ t('administration.apikey.update') }}
          <v-chip
            class="bg-grey-darken-3"
            label
            text-color="white"
          >
            {{ apikey }}
          </v-chip>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form
          :id="`form-${apikey}`"
          v-model="validForm"
          @submit.prevent="updateApikey()"
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
          <SettingsAttributes
            :all="allSelected"
            :simple="attributesSimple"
            :best-oa-location="attributesBestOaLocation"
            :first-oa-location="attributesFirstOaLocation"
            :oa-locations="attributesOaLocations"
            :z-authors="attributesZAuthors"
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
          :form="`form-${apikey}`"
          :disabled="!validForm"
          :loading="loading"
          class="green--text"
        >
          {{ t('update') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>

import { storeToRefs } from 'pinia';
import SettingsAttributes from '@/components/unpaywallArgs/SettingsAttributes.vue';

import { useSnacksStore } from '@/store/snacks';
import { useAdminStore } from '@/store/admin';

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $apikey } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const props = defineProps({
  disabled: { type: Boolean, default: false },
  apikey: { type: String, default: '' },
  config: { type: Object, default: () => {} },
});

const emit = defineEmits({
  'update:modelValue': () => true,
  updated: () => true,
});

const value = ref('false');
const loading = ref(false);
const name = ref(props.config.name);
const description = ref(props.config.description);
const owner = ref(props.config.owner);
const enrich = ref(false);
const graphql = ref(false);
const attributes = ref(props.config.attributes);
const allowed = ref(props.config.allowed);

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

const attributesSimple = computed(() => attributes.value?.filter((e) => !e.includes('.')));
const attributesBestOaLocation = computed(() => attributes.value?.filter((e) => e.includes('best_oa_location')).map((e) => e.split('.')[1]));
const attributesFirstOaLocation = computed(() => attributes.value?.filter((e) => e.includes('first_oa_location')).map((e) => e.split('.')[1]));
const attributesOaLocations = computed(() => attributes.value?.filter((e) => e.includes('oa_locations')).map((e) => e.split('.')[1]));
const attributesZAuthors = computed(() => attributes.value?.filter((e) => e.includes('z_authors')).map((e) => e.split('.')[1]));
const allSelected = computed(() => attributes.value.includes('*'));

onMounted(() => {
  graphql.value = props.config?.access.includes('graphql');
  enrich.value = props.config?.access.includes('enrich');
});

async function updateApikey() {
  loading.value = true;
  try {
    await $apikey({
      method: 'PUT',
      url: `/keys/${props.apikey}`,
      data: {
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
  } catch (e) {
    snackStore.error(t('error.apikey.update'));
    loading.value = false;
    return;
  }
  snackStore.info(t('info.apikey.updated'));
  emit('updated');
  loading.value = false;
  emit('update:modelValue', false);
}
function updateAttributes(attributesSelected) {
  // TODO 50 is the sum of attributes available through ezunpaywall
  if (attributesSelected.length === 50) {
    attributes.value = ['*'];
  } else {
    attributes.value = attributesSelected;
  }
}

</script>
