<template>
  <v-navigation-drawer
    :value="visible"
    width="300"
    disable-resize-watcher
    disable-route-watcher
    @input="updateVisible($event)"
  >
    <SkeletonMenuListRouter />
    <SkeletonMenuLangSwitch />

    <v-spacer />

    <template #append>
      <SkeletonMenuThemeButton />
      <SkeletonMenuGithubButton />
      <SkeletonMenuInistImg />
    </template>
  </v-navigation-drawer>
</template>

<script setup>

const visible = defineProps({
  value: { type: Boolean, default: false },
});

const emit = defineEmits({
  updated: () => true,
});

async function updateVisible() {
  emit('updated');
}
</script>
