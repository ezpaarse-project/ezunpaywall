export default defineNuxtRouteMiddleware((to, from) => {
  const adminStore = useAdminStore();

  if (!adminStore.isAdmin) {
    return navigateTo('/administration');
  }
});
