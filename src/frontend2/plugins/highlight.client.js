import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import highlightJS from '@highlightjs/vue-plugin';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  hljs.registerLanguage('json', json);
  nuxtApp.vueApp.use(highlightJS);
});
