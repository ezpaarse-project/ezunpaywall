<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title>
        Cron
      </v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <v-row
      class="ma-2"
    >
      <v-col
        v-for="name in names"
        :key="name"
        cols="12"
        sm="6"
        md="6"
        lg="6"
        xl="6"
      >
        <AdministrationCronCard :name="name" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>

const names = ['dataUpdate', 'dataUpdateHistory'];

</script>
