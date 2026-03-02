export const unauthorized = {
  description: 'Unauthorized',
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 401 },
    message: { type: 'string', example: 'API key is missing' }
  }
};

export const forbidden = {
  description: 'Forbidden',
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 403 },
    message: { type: 'string', example: 'Invalid API key' }
  }
};

export const internalServerError = {
  description: 'Internal Server Error',
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 500 },
    message: { type: 'string', example: 'Internal Server Error' }
  }
};

export const accepted = {
  description: 'Accepted',
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 202 },
    message: { type: 'string', example: 'Job started' }
  }
}

export function badRequest(messages: string[]) {
  return {
    description: 'Bad Request',
    type: 'object',
    items: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        error: { type: 'string', example: 'Bad Request' },
        message: {
          type: 'string',
          enum: messages
        }
      }
    },
    example: messages.map(msg => ({
      statusCode: 400,
      error: 'Bad Request',
      message: msg
    }))
  };
}

export function notFound(messages: string[]) {
  return {
    description: 'Not Found',
    type: 'object',
    items: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        error: { type: 'string', example: 'Not Found' },
        message: {
          type: 'string',
          enum: messages
        }
      }
    },
    example: messages.map(msg => ({
      statusCode: 404,
      error: 'Not Found',
      message: msg
    }))
  };
}


export const jobUpdateState = {
  oneOf: [
    {
      type: 'object',
      description: 'Job execution state with index metadata and processing steps',
      additionalProperties: false,
      required: ['status', 'index', 'createdAt', 'steps'],
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'running', 'inProgress', 'done', 'error'],
          example: 'inProgress',
        },

        index: {
          type: 'string',
          example: 'holdings-2025-12-18',
        },

        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-18T08:01:06.170Z',
        },

        documents: {
          type: ['integer', 'string', 'null'],
          example: 0,
        },

        endAt: {
          type: ['string', 'null'],
          format: 'date-time',
          example: null,
        },

        took: {
          type: 'number',
          example: 0,
        },

        steps: {
          type: 'array',
          description: 'List of processing steps executed during the job',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['key', 'name', 'fileType', 'startDate', 'status'],
            properties: {
              key: {
                type: 'string',
                example: 'portal:INC',
              },

              name: {
                type: 'string',
                example: '[holdingsIQ][download]',
              },

              fileType: {
                type: 'string',
                example: 'STANDARD',
              },

              startDate: {
                type: 'string',
                format: 'date-time',
                example: '2025-12-18T08:01:06.173Z',
              },

              endDate: {
                type: ['string', 'null'],
                format: 'date-time',
                example: null,
              },

              status: {
                type: 'string',
                enum: ['pending', 'running', 'inProgress', 'done', 'error'],
                example: 'done',
              },

              lineUpserted: {
                type: ['integer', 'null'],
                example: 208279,
              },
            },
          },
        },
      },
    },
    {
      type: 'object',
      description: 'No job running',
      additionalProperties: false,
      maxProperties: 0,
    },
  ],
};
