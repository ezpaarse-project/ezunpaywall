<template>
  <v-app>
    <ClientOnly>
      <NuxtLayout>
        <SkeletonAppBar @menu-update="updateVisibleMenu()" />
        <SkeletonAppMenu v-model="visible" />
        <Snackbar />
        <v-main>
          <NuxtPage />
        </v-main>
      </NuxtLayout>
    </ClientOnly>
  </v-app>
</template>

<script setup>

const visible = ref(false);

const emit = defineEmits({
  updated: () => true,
});

async function updateVisibleMenu() {
  visible.value = !visible.value;
  emit('updated');
}

</script>
