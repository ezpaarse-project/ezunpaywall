module.exports = {
  // Application
  nodeEnv: 'NODE_ENV', // Environment of node
  timezone: 'TZ', // Timezone of app used in cron
  apikey: 'ADMIN_APIKEY', // Admin API key
  healthTimeout: 'HEALTH_TIMEOUT', // Timeout to query the health route
  port: 'PORT', // Port

  // Mail
  smtp: {
    host: 'SMTP_HOST', // SMTP host
    port: 'SMTP_PORT', // SMTP port
  },
  notifications: {
    sender: 'NOTIFICATIONS_SENDER', // The sender for emails issued by ezunpaywall
    receivers: 'NOTIFICATIONS_RECEIVERS', // Recipients of the recent activity email
    machine: 'NOTIFICATIONS_MACHINE', // Environment of deployment
  },

  // Unpaywall
  unpaywall: {
    url: 'UNPAYWALL_URL', // Unpaywall api URL to access to changefiles
    apikey: 'UNPAYWALL_APIKEY', // Unpaywall apikey to access to changefiles
    email: 'UNPAYWALL_EMAIL', // Email to request Unpaywall API
  },

  // Elasticsearch
  elasticsearch: {
    nodes: 'ELASTICSEARCH_NODES', // Elastic nodes URL separated by comma
    username: 'ELASTICSEARCH_USERNAME', // Username of elastic super user
    password: 'ELASTICSEARCH_PASSWORD', // Password of elastic super user
    timeout: 'ELASTICSEARCH_TIMEOUT', // Timeout in milliseconds of elastic client
  },

  // Redis
  redis: {
    host: 'REDIS_HOST', // Redis host
    port: 'REDIS_PORT', // Redis port
    password: 'REDIS_PASSWORD', // Redis password
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
    demoApikey: {
      schedule: 'CRON_DEMO_APIKEY_SCHEDULE', // Schedule of cron
      active: 'CRON_DEMO_APIKEY_ACTIVE', // Cron active or not at the start of service
      count: 'CRON_DEMO_APIKEY_COUNT', // Count of demo request
    },
  },
};
