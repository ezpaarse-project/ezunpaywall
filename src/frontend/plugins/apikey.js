import axios from 'axios';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const { apikeyHost } = nuxtApp.$config.public;

  const apikey = axios.create({
    baseURL: apikeyHost,
  });

  return {
    provide: {
      apikey,
    },
  };
});
