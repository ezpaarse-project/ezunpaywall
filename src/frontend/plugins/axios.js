import axios from 'axios'

export default (ctx, inject) => {
  const graphql = axios.create({
    baseURL: ctx.$config.grapqlURL,
    timeout: 3000
  })

  inject('graphql', graphql)

  const update = axios.create({
    baseURL: ctx.$config.updateURL,
    timeout: 3000
  })

  inject('update', update)

  const enrich = axios.create({
    baseURL: ctx.$config.enrichURL,
    timeout: 3000
  })

  inject('enrich', enrich)

  const mail = axios.create({
    baseURL: ctx.$config.mailURL,
    timeout: 3000,
    headers: {
      'x-api-key': ctx.$config.apikeymail
    }
  })

  inject('mail', mail)
}
