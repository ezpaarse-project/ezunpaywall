import * as dateFns from 'date-fns';
import { fr, enGB as en } from 'date-fns/locale';
import { defineNuxtPlugin } from '#imports';

const locales = { fr, en };

export default defineNuxtPlugin((nuxtApp) => {
  const angDateFns = { ...dateFns };

  const parseISO = (date) => {
    if (dateFns.parseISO) {
      return typeof date !== 'string' ? date : dateFns.parseISO(date);
    }
    return date;
  };

  angDateFns.format = (date, format = 'PP', options) => {
    const locale = nuxtApp.$i18n.locale.value;
    const opts = options || {};

    return dateFns.format(parseISO(date), format, {
      ...opts,
      locale: locales[opts.locale || locale],
    });
  };

  angDateFns.formatDistanceToNow = (date, options) => {
    const { locale } = nuxtApp.$config.i18n;
    const opts = options || {};

    return dateFns.formatDistanceToNow(parseISO(date), {
      ...opts,
      locale: locales[opts.locale || locale],
    });
  };

  nuxtApp.$dateFns = angDateFns;

  return {
    provide: {
      dateFns: angDateFns,
    },
  };
});
