<template>
  <div>
    {{ t('graphql.settings') }}
    <HelpButton />
    <SettingsAttributes @attributes="setAttributes" />
  </div>
</template>

<script setup>

import HelpButton from '@/components/unpaywallArgs/HelpButton.vue';
import SettingsAttributes from '@/components/unpaywallArgs/SettingsAttributes.vue';

const { t } = useI18n();

const emit = defineEmits(['attributes']);

function setAttributes(attributes) {
  emit('attributes', attributes);
}

</script>
