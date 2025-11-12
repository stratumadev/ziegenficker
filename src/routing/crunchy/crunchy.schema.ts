export const rss = {
    querystring: {
        type: 'object',
        properties: {
            locale: { type: 'string' }
        }
    },
    response: {
        '5xx': {
            type: 'object',
            properties: {
                error: { type: 'string' }
            }
        }
    }
}
