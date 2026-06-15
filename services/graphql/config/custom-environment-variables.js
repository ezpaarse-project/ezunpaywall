module.exports = {
  // Application
  nodeEnv: 'NODE_ENV', // Environment of node
  timezone: 'TZ', // Timezone of app used in cron
  apikey: 'ADMIN_APIKEY', // Admin API key
  healthTimeout: 'HEALTH_TIMEOUT', // Timeout to query the health route
  port: 'PORT', // Port
  // Redis
  redis: {
    host: 'REDIS_HOST', // Redis host
    port: 'REDIS_PORT', // Redis port
    password: 'REDIS_PASSWORD', // Redis password
  },
  // Elasticsearch
  elasticsearch: {
    nodes: 'ELASTICSEARCH_NODES', // Elasticsearch host
    username: 'ELASTICSEARCH_USERNAME', // Elasticsearch admin username
    password: 'ELASTICSEARCH_PASSWORD', // Elasticsearch admin password
    indexBase: 'ELASTICSEARCH_INDEX_BASE', // Graphql entry point
    indexHistory: 'ELASTICSEARCH_INDEX_HISTORY',
  },
  // Cron
  cron: {
    cleanFile: {
      schedule: 'CRON_CLEAN_FILE_SCHEDULE', // Schedule of cron
      active: 'CRON_CLEAN_FILE_ACTIVE', // Cron active or not at the start of service
      accessLogRetention: 'CRON_CLEAN_FILE_ACCESS_LOG_RETENTION', // Detention time in days for access log
      applicationLogRetention: 'CRON_CLEAN_FILE_APPLICATION_LOG_RETENTION', // Detention time in days for application log
      healthcheckLogRetention: 'CRON_CLEAN_FILE_HEALTHCHECK_LOG_RETENTION', // Detention time in days for healthcheck log
    },
    metrics: {
      schedule: 'CRON_METRICS_SCHEDULE', // Schedule of cron
      active: 'CRON_METRICS_ACTIVE', // Cron active or not at the start of service
    },
  },
};
