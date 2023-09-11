import axios from 'axios';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const { graphqlHost } = nuxtApp.$config.public;

  const graphql = axios.create({
    baseURL: graphqlHost,
  });

  return {
    provide: {
      graphql,
    },
  };
});
