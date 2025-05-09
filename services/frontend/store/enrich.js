/* eslint-disable no-undef */
/* eslint-disable import/prefer-default-export */

import { defineStore } from 'pinia';

export const useEnrichStore = defineStore('enrich', () => {
  const start = ref(false);
  const files = ref(null);
  const type = ref('');
  const apikey = ref('demo');
  const attributes = ref([]);
  const fileSeparator = ref(',');
  const enrichedFileSeparator = ref(',');
  const isProcessing = ref(false);
  const isError = ref(false);
  const resultID = ref('');

  function setStart(value) {
    start.value = value;
  }
  function setFiles(value) {
    files.value = value;
  }
  function setType(value) {
    type.value = value;
  }
  function setApikey(value) {
    apikey.value = value;
  }
  function setAttributes(value) {
    attributes.value = value;
  }
  function setFileSeparator(value) {
    fileSeparator.value = value;
  }
  function setEnrichedFileSeparator(value) {
    enrichedFileSeparator.value = value;
  }
  function setIsProcessing(value) {
    isProcessing.value = value;
  }
  function setIsError(value) {
    isError.value = value;
  }
  function setResultID(value) {
    resultID.value = value;
  }

  return {
    start,
    files,
    type,
    apikey,
    attributes,
    fileSeparator,
    enrichedFileSeparator,
    resultID,
    isError,
    isProcessing,
    setStart,
    setFiles,
    setType,
    setApikey,
    setAttributes,
    setFileSeparator,
    setEnrichedFileSeparator,
    setIsProcessing,
    setIsError,
    setResultID,
  };
});
