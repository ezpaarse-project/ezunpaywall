<template>
  <v-text-field
    variant="solo"
    class="ma-6"
    :value="textFieldValue"
    hide-details
    prepend-icon="mdi-magnify"
    single-line
    clearable
    :label="placeHolder"
    @update:model-value="emitValue"
  />
</template>

<script setup>

const { t } = useI18n();

const textFieldValue = ref('');

const emits = defineEmits(['update:modelValue']);

const emitValue = (newValue) => {
  textFieldValue.value = newValue;
  emits('update:modelValue', newValue);
};
const placeHolder = computed(() => t('search'));
</script>
