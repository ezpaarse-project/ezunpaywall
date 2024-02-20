# ezunpaywall-mail

Service that sends email if there is an error in the update process and for the contact page in the web interface.
This service is for administrators.

## Config

To set up this service, you can use environment variables. The config is displayed at startup. Sensitive data are not displayed.

```
# if sensitive data are not updated
warn: [config]: Apikey has the default value

info: {
  "nodeEnv": "development",
  "accessLogRotate": false,
  "smtp": {
    "host": "maildev",
    "port": 25
  },
  "notifications": {
    "sender": "ezunpaywall",
    "receivers": [
      "ezunpaywall@example.fr"
    ],
    "machine": "dev"
  },
  "apikey": "********",
  "healthTimeout": 3000
}
```

## Service environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| NODE_CONFIG | {} | make tls and secure of mail (only in developement) |
| ACCESS_LOG_ROTATE | false | Set to true if you want to use access log rotation |
| MAIL_SMTP_HOST | localhost | SMTP server host |
| MAIL_SMTP_PORT | 25 | SMTP server port |
| MAIL_NOTIFICATIONS_SENDER | ezunpaywall | the sender for emails issued by ezunpaywall |
| MAIL_NOTIFICATIONS_RECEIVERS | ezunpaywall@example.fr" | recipients of the recent activity email |
| MAIL_NOTIFICATIONS_MACHINE | dev | environment of machine |
| MAIL_APIKEY | changeme | mail apikey |
| HEALTH_TIMEOUT | 3000 | timeout to query the health route |


## Log format

```
:ip ":user" [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```