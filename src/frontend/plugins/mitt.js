import mitt from 'mitt';

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin(() => {
  const emitter = mitt();

  return {
    provide: {
      emitter,
    },
  };
});
