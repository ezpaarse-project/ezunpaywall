<template>
  <div class="my-4">
    <v-toolbar
      color="secondary"
      dark
      dense
      flat
    >
      <v-toolbar-title> {{ t("enrich.settings") }} </v-toolbar-title>
    </v-toolbar>

    <v-text-field
      v-model="apikey"
      :append-icon="apiKeyVisible ? 'mdi-eye' : 'mdi-eye-off'"
      :rules="[apiKeyRules.required]"
      :type="apiKeyVisible ? 'text' : 'password'"
      :label="t('enrich.apikey')"
      filled
      @click:append="apiKeyVisible = !apiKeyVisible"
    />
    <v-row class="mb-3 ml-1">
      <div
        class="mr-1"
        v-text="t('enrich.fileExtension')"
      />
      <v-chip
        label
        text-color="white"
        :class="extensionFileColor"
      >
        <span>{{ type }}</span>
      </v-chip>
    </v-row>

    <EnrichSelectSeparator v-if="type === 'csv'" />

    <v-toolbar
      color="secondary"
      dark
      dense
      flat
    >
      <v-toolbar-title>
        {{ t("enrich.unpaywallAttributes") }}
      </v-toolbar-title>
      <UnpaywallArgsHelpButton />
    </v-toolbar>

    <UnpaywallArgsSelectorAttributes
      :hide-oa-locations="type === 'csv'"
      :default-simple="['doi', 'is_oa']"
      :default-best-oa-location="['url_for_pdf']"
      :default-first-oa-location="[]"
      :default-z-authors="['raw_author_name']"
      :simple="attributesSimple"
      :best-oa-location="attributesBestOaLocation"
      :first-oa-location="attributesFirstOaLocation"
      :oa-locations="attributesOaLocations"
      :z-authors="attributesZAuthors"
      @attributes="setAttributes"
    />
  </div>
</template>

<script setup>

const { t } = useI18n();
const enrichStore = useEnrichStore();

const { type } = storeToRefs(enrichStore);
const { apikey } = storeToRefs(enrichStore);
const { attributes } = storeToRefs(enrichStore);

const apiKeyVisible = ref(true);
const apiKeyRules = ref({
  required: (value) => !!value || 'Required.',
});
const authorizedFile = ref([
  { name: 'csv', color: 'bg-green-darken-4 text-white' },
  { name: 'jsonl', color: 'bg-yellow-darken-4 text-white' },
]);

const attributesSimple = computed(() => attributes.value?.filter((e) => !e.includes('.')));
const attributesBestOaLocation = computed(() => attributes.value?.filter((e) => e.includes('best_oa_location')).map((e) => e.split('.')[1]));
const attributesFirstOaLocation = computed(() => attributes.value?.filter((e) => e.includes('first_oa_location')).map((e) => e.split('.')[1]));
const attributesOaLocations = computed(() => attributes.value?.filter((e) => e.includes('oa_locations')).map((e) => e.split('.')[1]));
const attributesZAuthors = computed(() => attributes.value?.filter((e) => e.includes('z_authors')).map((e) => e.split('.')[1]));
const extensionFileColor = computed(() => {
  const extension = authorizedFile.value.find(
    (file) => file.name === type.value,
  );
  return extension?.color || 'gray';
});

function setAttributes(attributesSelected) {
  enrichStore.setAttributes(attributesSelected);
}

</script>
