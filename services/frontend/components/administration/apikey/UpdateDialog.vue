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
          <UnpaywallArgsSelectorAttributes
            :all="allSelected"
            :default-simple="attributesSimple"
            :default-best-oa-location="attributesBestOaLocation"
            :default-first-oa-location="attributesFirstOaLocation"
            :default-oa-locations="attributesOaLocations"
            :default-oa-locations-embargoed="attributesOaLocationsEmbargoed"
            :default-z-authors="attributesZAuthors"
            :best-oa-location="attributesBestOaLocation"
            :first-oa-location="attributesFirstOaLocation"
            :oa-locations="attributesOaLocations"
            :oa-locations-embargoed="attributesOaLocationsEmbargoed"
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
          :disabled="!validForm && attributesRules && accessRules"
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

const { t } = useI18n();
const snackStore = useSnacksStore();
const adminStore = useAdminStore();
const { $admin } = useNuxtApp();

const { password } = storeToRefs(adminStore);

const props = defineProps({
  disabled: { type: Boolean, default: false },
  apikey: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  owner: { type: String, default: '' },
  enrich: { type: Boolean, default: false },
  graphql: { type: Boolean, default: false },
  attributes: { type: Array, default: () => [] },
  allowed: { type: Boolean, default: false },
});

const emit = defineEmits({
  'update:modelValue': () => true,
  'update:name': (val) => val,
  'update:description': (val) => val,
  'update:owner': (val) => val,
  'update:attributes': (val) => val,
  'update:allowed': (val) => val,
  'update:enrich': (val) => val,
  'update:graphql': (val) => val,
  updated: () => true,
});

const value = ref('false');
const loading = ref(false);

const name = computed({
  get: () => props.name,
  set: (val) => emit('update:name', val),
});
const description = computed({
  get: () => props.description,
  set: (val) => emit('update:description', val),
});
const owner = computed({
  get: () => props.owner,
  set: (val) => emit('update:owner', val),
});
const attributes = computed({
  get: () => props.attributes,
  set: (val) => emit('update:attributes', val),
});
const allowed = computed({
  get: () => props.allowed,
  set: (val) => emit('update:allowed', val),
});
const enrich = computed({
  get: () => props.enrich,
  set: (val) => emit('update:enrich', val),
});
const graphql = computed({
  get: () => props.graphql,
  set: (val) => emit('update:graphql', val),
});

const nameRule = computed(() => [(v) => !!v || t('required')]);
const attributesRules = computed(() => attributes.value.length > 0);
const accessRules = computed(() => graphql.value || enrich.value);

const validForm = ref(false);

const attributesSimple = computed(() => attributes?.value?.filter((e) => !e.includes('.')));
const attributesBestOaLocation = computed(() => attributes?.value?.filter((e) => e.includes('best_oa_location.')).map((e) => e.split('.')[1]));
const attributesFirstOaLocation = computed(() => attributes?.value?.filter((e) => e.includes('first_oa_location.')).map((e) => e.split('.')[1]));
const attributesOaLocations = computed(() => attributes?.value?.filter((e) => e.includes('oa_locations.')).map((e) => e.split('.')[1]));
const attributesOaLocationsEmbargoed = computed(() => attributes?.value?.filter((e) => e.includes('oa_locations_embargoed.')).map((e) => e.split('.')[1]));
const attributesZAuthors = computed(() => attributes?.value?.filter((e) => e.includes('z_authors.')).map((e) => e.split('.')[1]));
const allSelected = computed(() => attributes?.value?.includes('*'));

async function updateApikey() {
  loading.value = true;
  const access = graphql.value ? ['graphql'] : [];
  if (enrich.value) { access.push('enrich'); }
  try {
    await $admin(`/apikeys/${props.apikey}`, {
      method: 'PUT',
      body: {
        name: name.value,
        owner: owner.value,
        description: description.value,
        attributes: attributes.value,
        access,
        allowed: allowed.value,
      },
      headers: {
        'X-API-KEY': password.value,
      },
    });
  } catch (err) {
    snackStore.error(t('error.apikey.update'));
    loading.value = false;
    return;
  }
  snackStore.info(t('info.apikey.updated'));
  emit('updated');
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
