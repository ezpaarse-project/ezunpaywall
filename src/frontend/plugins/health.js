import axios from 'axios';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const { healthHost } = nuxtApp.$config.public;

  const health = axios.create({
    baseURL: healthHost,
  });

  return {
    provide: {
      health,
    },
  };
});
