<template>
  <v-navigation-drawer
    :value="visible"
    width="300"
    disable-resize-watcher
    disable-route-watcher
    @input="updateVisible($event)"
  >
    <ListRouter />
    <LangSwitch />

    <v-spacer />

    <template #append>
      <ThemeButton />
      <GithubButton />
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import ListRouter from '@/components/skeleton/menu/ListRouter.vue';
import LangSwitch from '@/components/skeleton/menu/LangSwitch.vue';
import GithubButton from '@/components/skeleton/menu/GithubButton.vue';
import ThemeButton from '@/components/skeleton/menu/ThemeButton.vue';

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
