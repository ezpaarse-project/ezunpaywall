module.exports = {
  // Application
  nodeEnv: 'NODE_ENV', // Environment of node
  timezone: 'TZ', // Timezone of app used in cron
  apikey: 'ADMIN_APIKEY', // Admin API key
  healthTimeout: 'HEALTH_TIMEOUT', // Timeout to query the health route
  port: 'PORT', // Port of node.js

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
    maxBulkSize: 'ELASTICSEARCH_MAX_BULK_SIZE', // Max bulk size of update process
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
    // Download snapshot
    downloadSnapshot: {
      schedule: 'CRON_DOWNLOAD_SNAPSHOT_SCHEDULE', // Schedule of cron
      active: 'CRON_DOWNLOAD_SNAPSHOT_ACTIVE', // Cron active or not at the start of service
    },
    // Data update
    dataUpdate: {
      schedule: 'CRON_DATA_UPDATE_SCHEDULE', // Schedule of cron
      active: 'CRON_DATA_UPDATE_ACTIVE', // Cron active or not at the start of service
      index: 'CRON_DATA_UPDATE_INDEX', // Index where data is inserted
      interval: 'CRON_DATA_UPDATE_INTERVAL', // Interval of changefile
      anteriority: 'CRON_DATA_UPDATE_ANTERIORITY', // Number of days the update starts from today's date
    },
    // Clean file
    cleanFile: {
      schedule: 'CRON_CLEAN_FILE_SCHEDULE', // Schedule of cron
      active: 'CRON_CLEAN_FILE_ACTIVE', // Cron active or not at the start of service
      changefileRetention: 'CRON_CLEAN_FILE_CHANGEFILE_RETENTION', // Detention time in days for changefiles from unpaywall
      reportRetention: 'CRON_CLEAN_FILE_REPORT_RETENTION', // Detention time in days for report of update process
      snapshotRetention: 'CRON_CLEAN_FILE_SNAPSHOT_RETENTION', // Detention time in days for snapshot from unpaywall
      accessLogRetention: 'CRON_CLEAN_FILE_ACCESS_LOG_RETENTION', // Detention time in days for access log
      applicationLogRetention: 'CRON_CLEAN_FILE_APPLICATION_LOG_RETENTION', // Detention time in days for application log
      healthcheckLogRetention: 'CRON_CLEAN_FILE_HEALTHCHECK_LOG_RETENTION', // Detention time in days for healthcheck log
    },
    // DOI update
    doiUpdate: {
      schedule: 'CRON_DOI_UPDATE_SCHEDULE', // Schedule of cron
      active: 'CRON_DOI_UPDATE_ACTIVE', // Cron active or not at the start of service
      limit: 'CRON_DOI_UPDATE_LIMIT', // DOI limit that can be updated
    },
  },
};
