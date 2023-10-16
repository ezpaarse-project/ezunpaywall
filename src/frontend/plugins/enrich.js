import axios from 'axios';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const { enrichHost } = nuxtApp.$config.public;

  const enrich = axios.create({
    baseURL: enrichHost,
  });

  return {
    provide: {
      enrich,
    },
  };
});
