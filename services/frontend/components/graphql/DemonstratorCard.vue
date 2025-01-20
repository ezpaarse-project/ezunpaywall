<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
      flat
      dense
    >
      <v-toolbar-title> {{ t('graphql.constructor') }} </v-toolbar-title>
      <v-spacer />
      <v-app-bar-nav-icon>
        <v-icon>mdi-api</v-icon>
      </v-app-bar-nav-icon>
    </v-toolbar>
    <v-card-text>
      <v-text-field
        v-model="apikey"
        :label="t('graphql.apikey')"
      />
      <v-text-field
        v-model="dois"
        label="DOI"
      />
    </v-card-text>
    <hr class="mx-4">
    <v-card-text>
      <GraphqlSettingsSelectorTab @attributes="setAttributes" />
    </v-card-text>
    <hr class="mx-4">
    <v-card-text>
      <GraphqlRequestTab
        :attributes="attributesSelected"
        :dois="dois"
        :apikey="apikey"
        @query="setQuery"
        @graphql-data="setGraphqlData"
      />
    </v-card-text>
    <hr class="mx-4">
    <v-card-text>
      <GraphqlResultTab
        :graphql-data="graphqlData"
        :query="query"
        :visible="resultVisible"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>

const { t } = useI18n();

const apikey = ref('demo');
const dois = ref('10.1001/jama.2016.9797');
const attributesSelected = ref([]);
const query = ref('');
const graphqlData = ref([]);
const resultVisible = ref(false);

function setAttributes(attributes) {
  attributesSelected.value = attributes;
}

function setGraphqlData(data) {
  graphqlData.value = data;
  resultVisible.value = true;
}

function setQuery(data) {
  query.value = data;
}

</script>
