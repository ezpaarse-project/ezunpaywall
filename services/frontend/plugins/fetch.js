/* eslint-disable no-undef */

import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const { adminURL } = nuxtApp.$config.public;
  const { harvesterUnpaywallURL } = nuxtApp.$config.public;
  const { graphqlURL } = nuxtApp.$config.public;
  const { enrichURL } = nuxtApp.$config.public;

  const adminFetch = $fetch.create({
    baseURL: adminURL,
  });
  adminFetch.baseURL = adminURL;

  const harvesterUnpaywallFetch = $fetch.create({
    baseURL: harvesterUnpaywallURL,
  });
  harvesterUnpaywallFetch.baseURL = harvesterUnpaywallURL;

  const enrichFetch = $fetch.create({
    baseURL: enrichURL,
  });
  enrichFetch.baseURL = enrichURL;

  const graphqlFetch = $fetch.create({
    baseURL: graphqlURL,
  });
  graphqlFetch.baseURL = graphqlURL;

  nuxtApp.provide('admin', adminFetch);
  nuxtApp.provide('harvesterUnpaywall', harvesterUnpaywallFetch);
  nuxtApp.provide('enrich', enrichFetch);
  nuxtApp.provide('graphql', graphqlFetch);
});
