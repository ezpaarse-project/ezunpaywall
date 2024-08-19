<template>
  <v-list v-model:opened="open">
    <v-list-group>
      <template #activator="{ props }">
        <v-list-item v-bind="props">
          {{ t("drawer.language") }}
        </v-list-item>
      </template>
      <SkeletonMenuLangList />
    </v-list-group>
  </v-list>
</template>

<script setup>

const { t } = useI18n();

const open = ref(['Lang']);

</script>
