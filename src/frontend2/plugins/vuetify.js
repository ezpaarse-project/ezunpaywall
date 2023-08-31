import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import colors from 'vuetify/lib/util/colors';
import { VDataTable } from 'vuetify/labs/VDataTable';
import { VStepper, VStepperHeader } from 'vuetify/labs/VStepper';

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components: {
      ...components,
      VDataTable,
      VStepper,
      VStepperHeader,
    },
    directives,
    theme: {
      themes: {
        dark: {
          colors: {
            primary: '#4caf50',
            accent: colors.grey.darken3,
            secondary: colors.grey.darken4,
            info: colors.teal.lighten1,
            warning: colors.amber.base,
            error: colors.red.accent4,
            success: colors.green.accent3,
          },

        },
        light: {
          colors: {
            primary: '#4caf50',
            secondary: colors.grey.darken3,
          },
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
