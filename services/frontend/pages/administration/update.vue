<template>
  <section class="ma-3">
    <AdministrationUpdateProcessButton />
    <ReportCard class="my-4"/>
  </section>
</template>

<script setup>

definePageMeta({
  middleware: 'admin',
});

</script>
