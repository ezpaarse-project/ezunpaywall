export default defineNuxtPlugin((nuxtApp) => {
  const adminUrl = nuxtApp.$config.public.adminUrl;
  const graphqlURL = nuxtApp.$config.public.graphqlURL;
  const enrichURL = nuxtApp.$config.public.enrichURL;

  const adminFetch = $fetch.create({
    baseURL: adminUrl,
  });
  adminFetch.baseURL = adminUrl;

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
