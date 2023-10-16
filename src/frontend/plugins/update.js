import axios from 'axios';

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const { updateHost } = nuxtApp.$config.public;

  const update = axios.create({
    baseURL: updateHost,
  });

  return {
    provide: {
      update,
    },
  };
});
