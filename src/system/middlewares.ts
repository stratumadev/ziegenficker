import 'dotenv/config'
import { FastifyReply, FastifyRequest } from 'fastify'
import { server } from '../app'

export const middlewares = async () => {
    server.decorate('zloAuth', () => {
        return async function (request: FastifyRequest, reply: FastifyReply) {
            if (!process.env.ZLO_SECRET) return reply.code(500).send({ error: 'AUTH_FAILED', message: 'ZLO_SECRET not set in ENV' })

            var authHeader = request.headers['authorization']
            if (!authHeader && request.query && (request as any).query['authorization']) {
                authHeader = (request as any).query['authorization']
            }
            if (!authHeader) {
                return reply.code(401).send({ error: 'AUTH_INVALID', message: 'Authorization missing or invalid' })
            }

            // Return error if auth is not equal to secret
            if (authHeader !== process.env.ZLO_SECRET) return reply.code(401).send({ error: 'AUTH_INVALID', message: 'Authorization missing or invalid' })
        }
    })
}
