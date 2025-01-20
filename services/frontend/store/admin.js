/* eslint-disable no-undef */
/* eslint-disable import/prefer-default-export */

import { defineStore } from 'pinia';

export const useAdminStore = defineStore('admin', () => {
  const isAdmin = ref(false);
  const password = ref('');

  function setIsAdmin(value) {
    isAdmin.value = value;
  }

  function setPassword(value) {
    password.value = value;
  }

  return {
    isAdmin, password, setIsAdmin, setPassword,
  };
});
