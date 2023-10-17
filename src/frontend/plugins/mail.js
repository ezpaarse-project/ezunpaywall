import axios from 'axios';

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const { mailHost } = nuxtApp.$config.public;

  const mail = axios.create({
    baseURL: mailHost,
    headers: {
      'x-api-key': nuxtApp.$config.public.mailApikey,
    },
  });

  return {
    provide: {
      mail,
    },
  };
});
