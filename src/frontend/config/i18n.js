/* eslint-disable no-undef */
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'fr',
  locales: ['en', 'fr'],
  messages: {
    en,
    fr,
  },
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root',
  },
}));
