<template>
  <div>
    {{ t('graphql.settings') }}
    <UnpaywallArgsHelpButton />
    <UnpaywallArgsSelectorAttributes
      :default-simple="['doi', 'is_oa']"
      :default-best-oa-location="['url_for_pdf']"
      :default-first-oa-location="[]"
      :default-oa-locations="[]"
      :default-oa-locations-embargoed="[]"
      :default-z-authors="['raw_author_name']"
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
