import { FastifyReply, FastifyRequest } from 'fastify'
import { ContentKeyInit } from '../../types/modules/zlo'
import ContentKeyHandling from '../../modules/zlo/contentkeyhandling'

export async function contentKeyInitHandler(
    request: FastifyRequest<{
        Body: ContentKeyInit
    }>,
    reply: FastifyReply
) {
    const body = request.body

    const contentKeyHandler = new ContentKeyHandling(request, reply)
    const contentKey = await contentKeyHandler.createContentKey(body)

    if (!contentKey)
        return reply.code(500).send({
            error: 'INTERNAL_ERROR',
            message: 'Internal Error, please report this to the admins.'
        })

    return reply.code(201).send()
}
