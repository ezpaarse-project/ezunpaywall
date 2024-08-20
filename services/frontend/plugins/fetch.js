export default defineNuxtPlugin((nuxtApp) => {
  const adminURL = nuxtApp.$config.public.adminURL;
  const graphqlURL = nuxtApp.$config.public.graphqlURL;
  const enrichURL = nuxtApp.$config.public.enrichURL;

  const adminFetch = $fetch.create({
    baseURL: adminURL,
  });
  adminFetch.baseURL = adminURL;

  const enrichFetch = $fetch.create({
    baseURL: enrichURL,
  });
  enrichFetch.baseURL = enrichURL;

  const graphqlFetch = $fetch.create({
    baseURL: graphqlURL,
  });
  graphqlFetch.baseURL = graphqlURL

  nuxtApp.provide('admin', adminFetch);
  nuxtApp.provide('enrich', enrichFetch);
  nuxtApp.provide('graphql', graphqlFetch);
});
