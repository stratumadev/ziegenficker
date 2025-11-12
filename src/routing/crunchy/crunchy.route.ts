import { FastifyInstance } from 'fastify'
import * as crunchy from './crunchy.schema'
import { crunchyRSSHandler } from './crunchy.controller'

export default async function crunchyRoutes(server: FastifyInstance) {
    server.get(
        '/rss',
        {
            schema: crunchy.rss
        },
        crunchyRSSHandler
    )
}
