import axios from 'axios'

export default (ctx, inject) => {
  const graphql = axios.create({
    baseURL: ctx.$config.graphqlHost,
    timeout: 3000
  })

  inject('graphql', graphql)

  const update = axios.create({
    baseURL: ctx.$config.updateHost,
    timeout: 3000
  })

  inject('update', update)

  const enrich = axios.create({
    baseURL: ctx.$config.enrichHost,
    timeout: 3000
  })

  inject('enrich', enrich)

  const mail = axios.create({
    baseURL: ctx.$config.mailHost,
    timeout: 3000,
    headers: {
      'x-api-key': ctx.$config.apikeyMail
    }
  })

  inject('mail', mail)
}
