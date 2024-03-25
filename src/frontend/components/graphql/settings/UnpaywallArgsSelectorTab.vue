<template>
  <div>
    {{ t('graphql.settings') }}
    <HelpButton />
    <SelectorAttributes
      :default-simple="['doi']"
      :default-best-oa-location="['evidence', 'is_best']"
      :default-first-oa-location="['url_for_pdf']"
      :default-z-authors="['family', 'given']"
      @attributes="setAttributes"
    />
  </div>
</template>

<script setup>

import HelpButton from '@/components/unpaywallArgs/HelpButton.vue';
import SelectorAttributes from '@/components/unpaywallArgs/SelectorAttributes.vue';

const { t } = useI18n();

const emit = defineEmits(['attributes']);

function setAttributes(attributes) {
  emit('attributes', attributes);
}

</script>
