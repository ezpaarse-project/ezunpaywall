module.exports = {
  // Application
  nodeEnv: 'NODE_ENV', // Environment of node
  apikey: 'ADMIN_APIKEY', // Admin API key
  timezone: 'TZ', // Timezone of app used in cron
  healthTimeout: 'HEALTH_TIMEOUT', // Timeout to query the health route
  port: 'PORT', // Port
  // Redis
  redis: {
    host: 'REDIS_HOST', // Redis host
    port: 'REDIS_PORT', // Redis port
    password: 'REDIS_PASSWORD', // Redis password
  },
  // GraphQL
  graphql: {
    url: 'GRAPHQL_URL', // Graphql host
  },
  // Cron
  cron: {
    cleanFile: {
      schedule: 'CRON_CLEAN_FILE_SCHEDULE', // Schedule of cron
      active: 'CRON_CLEAN_FILE_ACTIVE', // Cron active or not at the start of service
      enrichedFileRetention: 'CRON_CLEAN_FILE_ENRICHED_RETENTION', // Detention time in days for enriched file
      uploadedFileRetention: 'CRON_CLEAN_FILE_UPLOADED_RETENTION', // Detention time in days for uploaded file
      stateFileRetention: 'CRON_CLEAN_FILE_STATE_RETENTION', // Detention time in days for state file
      accessLogRetention: 'CRON_CLEAN_FILE_ACCESS_LOG_RETENTION', // Detention time in days for access log
      applicationLogRetention: 'CRON_CLEAN_FILE_APPLICATION_LOG_RETENTION', // Detention time in days for application log
      healthcheckLogRetention: 'CRON_CLEAN_FILE_HEALTHCHECK_LOG_RETENTION', // Detention time in days for healthcheck log
    },
  },
};
