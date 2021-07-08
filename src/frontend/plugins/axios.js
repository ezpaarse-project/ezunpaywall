import axios from 'axios'

export default (ctx, inject) => {
  const graphql = axios.create({
    baseURL: ctx.env.GRAPHQL_URL,
    timeout: 3000
  })

  const update = axios.create({
    baseURL: ctx.env.UPDATE_URL,
    timeout: 3000
  })

  const enrich = axios.create({
    baseURL: ctx.env.ENRICH_URL,
    timeout: 3000
  })

  ctx.$graphql = graphql
  inject('graphql', graphql)

  ctx.$update = update
  inject('update', update)

  ctx.$enrich = enrich
  inject('enrich', enrich)
}
