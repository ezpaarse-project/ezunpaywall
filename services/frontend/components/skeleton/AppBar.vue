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
    <SkeletonAppbarHelp />
    <SkeletonAppbarStatus />
  </v-app-bar>
</template>

<script setup>

const runtimeConfig = useRuntimeConfig();

const i18n = useI18n();

const title = computed(() => {
  if (runtimeConfig.public.environment) {
    return `ezunpaywall ${runtimeConfig.public.environment}`;
  }
  return 'ezunpaywall';
});

const emit = defineEmits({
  menuUpdate: true,
});

async function updateVisibleMenu() {
  emit('menuUpdate');
}

</script>
