import { FastifyInstance } from 'fastify'
import * as zlo from './zlo.schema'
import { contentKeyInitHandler } from './zlo.controller'

export default async function zloRoutes(server: FastifyInstance) {
    server.post(
        '/contentkey',
        {
            schema: zlo.content_key_init
        },
        contentKeyInitHandler
    )
}
