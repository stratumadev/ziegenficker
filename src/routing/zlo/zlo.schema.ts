export const content_key_init = {
    body: {
        type: 'object',
        properties: {
            kid: { type: 'string' },
            key: { type: 'string' },
            content_type: { type: 'string' },
            service: { type: 'string' },
            item: { type: 'string' },
            season: { type: 'string' },
            episode: { type: 'string' },
            video_resolution: {
                type: 'object',
                properties: {
                    height: { type: 'number' },
                    width: { type: 'number' },
                    bitrate: { type: 'number' },
                    codec: { type: 'string' },
                    framerate: { type: 'number' }
                },
                required: ['height', 'width']
            }
        },
        required: ['kid', 'key', 'content_type', 'service', 'item']
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
