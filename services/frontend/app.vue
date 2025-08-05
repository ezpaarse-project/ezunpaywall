<template>
  <v-app>
    <ClientOnly>
      <NuxtLayout>
        <SkeletonAppBar @menu-update="updateVisibleMenu()" />
        <SkeletonAppMenu v-model="visible" />
        <ConfirmDialog />
        <SnackBar />
        <v-main>
          <NuxtPage />
        </v-main>
      </NuxtLayout>
    </ClientOnly>
  </v-app>
</template>

<script setup>

const visible = ref(true);

const emit = defineEmits({
  updated: () => true,
});

async function updateVisibleMenu() {
  visible.value = !visible.value;
  emit('updated');
}

</script>

<style>
html {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
