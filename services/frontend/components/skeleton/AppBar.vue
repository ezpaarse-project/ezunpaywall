<template>
  <v-app-bar
    app
    dark
    fixed
    clipped-left
    color="primary"
  >
    <v-app-bar-nav-icon
      dark
      @click.stop="updateVisibleMenu($event)"
    />
    <v-toolbar-title> {{ title }} </v-toolbar-title>
    <v-spacer />
    <Help />
    <Status />
  </v-app-bar>
</template>

<script setup>

import Help from '@/components/skeleton/appbar/Help.vue';
import Status from '@/components/skeleton/appbar/Status.vue';

const runtimeConfig = useRuntimeConfig();

const i18n = useI18n();

const title = computed(() => {
  if (runtimeConfig.public.environment === 'integration') {
    return `ezunpaywall ${i18n.t('integration')}`;
  }
  if (runtimeConfig.public.environment === 'production') {
    return 'ezunpaywall';
  }
  return `ezunpaywall ${i18n.t('development')}`;
});

const emit = defineEmits({
  menuUpdate: true,
});

async function updateVisibleMenu() {
  emit('menuUpdate');
}

</script>
