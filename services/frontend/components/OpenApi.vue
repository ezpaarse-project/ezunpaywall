<template>
  <div id="swagger" />
</template>

<script setup>

import { SwaggerUIBundle } from 'swagger-ui-dist';

const props = defineProps({
  host: { type: String, default: '' },
});

watch(
  props,
  () => {
    SwaggerUIBundle({
      url: `${props.host}/openapi.yml`,
      dom_id: '#swagger',
      deepLinking: false,
    });
  },
);

onMounted(() => {
  SwaggerUIBundle({
    url: `${props.host}/openapi.yml`,
    dom_id: '#swagger',
    deepLinking: false,
  });
});

</script>

<style>
#swagger .info {
  background-color: transparent !important;
  border-color: transparent !important;
}

#swagger .col {
  width: auto;
  max-width: 20%;
}
</style>
