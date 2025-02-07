const elasticMock = {
  ping: jest.fn().mockResolvedValue({ statusCode: 200 }),
  indices: {
    create: jest.fn().mockResolvedValue({ acknowledged: true }),
    exists: jest.fn().mockResolvedValue({ body: false }),
    existsAlias: jest.fn().mockResolvedValue({ body: false }),
    putAlias: jest.fn().mockResolvedValue({ acknowledged: true }),
    delete: jest.fn().mockResolvedValue({ acknowledged: true }),
    refresh: jest.fn().mockResolvedValue({ acknowledged: true }),
  },
  search: jest.fn().mockResolvedValue({
    body: {
      hits: { hits: [{ _source: { doi: '10.1000/mock' } }] },
    },
  }),
  bulk: jest.fn().mockResolvedValue({ body: { items: [] } }),
  cat: {
    indices: jest.fn().mockResolvedValue({
      body: [{ index: 'test-index' }],
    }),
    aliases: jest.fn().mockResolvedValue({
      body: [{ alias: 'test-alias', index: 'test-index' }],
    }),
  },
};

module.exports = elasticMock;
