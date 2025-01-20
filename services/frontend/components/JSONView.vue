<template>
  <highlightjs
    language="json"
    :code="props.code"
  />
</template>

<script setup>

const props = defineProps({
  code: { type: String, default: '' },
});

</script>
