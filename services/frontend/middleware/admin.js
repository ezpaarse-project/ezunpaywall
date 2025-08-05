/* eslint-disable no-undef */

export default defineNuxtRouteMiddleware(() => {
  const adminStore = useAdminStore();

  if (!adminStore.isAdmin) {
    return navigateTo('/administration');
  }
  return null;
});
