const Redis = require('ioredis-mock');

const redisData = {
  demo: {
    name: 'demo',
    owner: 'dev',
    description: 'demo apikey, limited at 100 000 graphql requests per days',
    createdAt: '2021-06-01',
    access: ['graphql', 'enrich'],
    attributes: ['*'],
    allowed: true,
    count: 100000,
  },
  user: {
    name: 'user',
    owner: 'dev',
    description: 'user dev apikey',
    createdAt: '2021-06-01',
    access: ['graphql', 'enrich'],
    attributes: ['*'],
    allowed: true,
  },
  restrictedUser: {
    name: 'restrictedUser',
    owner: 'dev',
    description: 'restrictedUser dev apikey',
    createdAt: '2021-06-01',
    access: ['graphql', 'enrich'],
    attributes: ['doi', 'is_oa', 'best_oa_location.license'],
    allowed: true,
  },
  graphql: {
    name: 'graphql',
    owner: 'dev',
    description: 'graphql dev apikey',
    createdAt: '2021-06-01',
    access: ['graphql'],
    attributes: ['*'],
    allowed: true,
  },
  enrich: {
    name: 'enrich',
    owner: 'dev',
    description: 'enrich dev apikey',
    createdAt: '2021-06-01',
    access: ['enrich'],
    attributes: ['*'],
    allowed: true,
  },
  notAllowed: {
    name: 'notAllowed',
    owner: 'dev',
    description: 'notAllowed dev apikey',
    createdAt: '2021-06-01',
    access: ['graphql', 'enrich'],
    attributes: ['*'],
    allowed: false,
  },
};

function initClient() {
  const redisClient = new Redis();
  Object.entries(redisData).forEach(async ([key, value]) => {
    await redisClient.set(key, JSON.stringify(value));
  });
}

module.exports = initClient;
