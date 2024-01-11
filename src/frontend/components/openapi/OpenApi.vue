<template>
  <div id="swagger" />
</template>

<script setup>

import SwaggerUI from 'swagger-ui';

const props = defineProps({
  host: { type: String, default: '' },
});

watch(
  props,
  () => {
    SwaggerUI({
      url: `${props.host}/openapi.yml`,
      dom_id: '#swagger',
      deepLinking: false,
    });
  },
);

onMounted(() => {
  SwaggerUI({
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
