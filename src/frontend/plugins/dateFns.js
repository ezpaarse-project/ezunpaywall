import * as dateFns from 'date-fns'
import { fr, enGB as en } from 'date-fns/locale'

const locales = { fr, en }
export default (ctx, inject) => {
  const angDateFns = { ...dateFns }

  const parseISO = (date) => {
    if (dateFns.parseISO) {
      return typeof date !== 'string' ? date : dateFns.parseISO(date)
    }
    return date
  }

  angDateFns.format = (date, format = 'PP', options) => {
    const locale = ctx.app.i18n.locale
    const opts = options || {}

    return dateFns.format(parseISO(date), format, {
      ...opts,
      locale: locales[opts.locale || locale]
    })
  }

  angDateFns.formatDistanceToNow = (date, options) => {
    const locale = ctx.app.i18n.locale
    const opts = options || {}

    return dateFns.formatDistanceToNow(parseISO(date), {
      ...opts,
      locale: locales[opts.locale || locale]
    })
  }

  ctx.$dateFns = angDateFns
  inject('dateFns', angDateFns)
}
