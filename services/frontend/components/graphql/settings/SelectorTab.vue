<template>
  <div>
    {{ t('graphql.settings') }}
    <UnpaywallArgsHelpButton />
    <UnpaywallArgsSelectorAttributes
      :default-simple="['doi']"
      :default-best-oa-location="['evidence', 'is_best']"
      :default-first-oa-location="['url_for_pdf']"
      :default-z-authors="['family', 'given']"
      @attributes="setAttributes"
    />
  </div>
</template>

<script setup>

const { t } = useI18n();

const emit = defineEmits(['attributes']);

function setAttributes(attributes) {
  emit('attributes', attributes);
}

</script>
