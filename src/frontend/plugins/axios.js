import axios from 'axios'

export default (ctx, inject) => {
  const graphql = axios.create({
    baseURL: ctx.$config.grapqlURL,
    timeout: 3000
  })
  graphql.baseURL = ctx.$config.grapqlURL

  const update = axios.create({
    baseURL: ctx.$config.updateURL,
    timeout: 3000
  })
  update.baseURL = ctx.$config.updateURL

  const enrich = axios.create({
    baseURL: ctx.$config.enrichURL,
    timeout: 3000
  })
  enrich.baseURL = ctx.$config.enrichURL

  ctx.$graphql = graphql
  inject('graphql', graphql)

  ctx.$update = update
  inject('update', update)

  ctx.$enrich = enrich
  inject('enrich', enrich)
}
