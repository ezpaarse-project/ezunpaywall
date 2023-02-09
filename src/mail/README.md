# ezunpaywall-health

Health service indicating the status of the connection between each service.

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

## Docker environment variables

| name | default | description |
| --- | --- | --- |
| MAIL_APPLICATION_LOG_PATH | ./src/mail/log/application | application output log path |
| MAIL_ACCESS_LOG_PATH | ./src/mail/log/access | access log output path |
| MAIL_PORT | 59705 | output port |