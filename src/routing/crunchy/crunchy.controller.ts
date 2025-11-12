import { FastifyReply, FastifyRequest } from 'fastify'
import { server } from '../../app'

export async function crunchyRSSHandler(
    request: FastifyRequest<{
        Querystring: {
            locale: string
        }
    }>,
    reply: FastifyReply
) {
    const query = request.query
    const langs = ['en-US', 'id-ID', 'de-DE', 'es-419', 'es-ES', 'fr-FR', 'it-IT', 'pt-BR', 'pt-PT', 'ru-RU', 'ar-SA', 'hi-IN']

    if (query.locale && !langs.find((a) => a === query.locale))
        return reply.code(200).send({
            error: 'LOCALE_NOT_SUPPORTED',
            message: 'Use one of these locales: ' + langs.join(', ')
        })

    const rss = server.cache.get(`crunchyRSS:${query.locale ?? 'en-US'}`)
    if (!rss)
        return reply.code(200).send({
            error: 'RSS_NOT_INITIALIZED',
            message: 'Rss not yet initialized'
        })

    return reply.code(200).type('text/xml').send(rss)
}
