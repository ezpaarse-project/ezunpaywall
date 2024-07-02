<template>
  <v-card>
    <v-list>
      <v-list-item
        :title="props.label"
        :subtitle="props.value"
      >
        <template #append>
          <v-icon
            :class="color"
            size="x-large"
          >
            {{ props.icon }}
          </v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>

const props = defineProps({
  label: {
    type: String,
    default: () => '',
  },
  value: {
    type: String,
    default: () => '',
  },
  icon: {
    type: String,
    default: () => '',
  },
  color: {
    type: String,
    default: () => '',
  },
});

</script>
