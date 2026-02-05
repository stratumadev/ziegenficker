import { FastifyReply, FastifyRequest } from 'fastify'
import LogHandler from '../../utils/msg'
import { Op } from 'sequelize'
import { server } from '../../app'
import { ContentKey as ContentKeyType, ContentKeyInit } from '../../types/modules/zlo'
import { ContentKey } from '../../database/database'

export default class ContentKeyHandling {
    private request: FastifyRequest | undefined
    private reply: FastifyReply | undefined
    private msg = new LogHandler()

    constructor(request?: FastifyRequest, reply?: FastifyReply) {
        ;((this.request = request), (this.reply = reply))
    }

    private async newContentKey(init: ContentKeyInit) {
        try {
            return await ContentKey.create(init).then((data) => data?.get())
        } catch (e) {
            return this.reply?.code(500).send({
                error: 'INTERNAL_ERROR',
                message: 'Internal Error, please report this to the admins.'
            })
        }
    }

    private async findContentKey(kid: string) {
        try {
            return await ContentKey.findByPk(kid).then((data) => data?.get())
        } catch (e) {
            return this.reply?.code(500).send({
                error: 'INTERNAL_ERROR',
                message: 'Internal Error, please report this to the admins.'
            })
        }
    }

    private async findContentKeys(data: { q?: string; limit: number; offset: number }) {
        try {
            return await ContentKey.findAll({
                where: data.q
                    ? {
                          [Op.or]: [{ kid: { [Op.iLike]: `%${data.q}%` } }, { key: { [Op.iLike]: `%${data.q}%` } }, { service: { [Op.iLike]: `%${data.q}%` } }]
                      }
                    : undefined,
                limit: data.limit,
                offset: data.offset && data.limit ? data.limit * data.offset : 0,
                order: [['createdAt', 'DESC']]
            }).then((data) => data.map((d) => d.get()))
        } catch (e) {
            return this.reply?.code(500).send({
                error: 'INTERNAL_ERROR',
                message: 'Internal Error, please report this to the admins.'
            })
        }
    }

    private async delete(kid: string) {
        try {
            await ContentKey.destroy({
                where: {
                    kid: kid
                }
            })

            return true
        } catch (e) {
            return this.reply?.code(500).send({
                error: 'INTERNAL_ERROR',
                message: 'Internal Error, please report this to the admins.'
            })
        }
    }

    public async getContentKeys(data: { q?: string; limit: number; offset: number }) {
        const contentKeys = await this.findContentKeys(data)

        if (!contentKeys)
            return this.reply?.code(500).send({
                error: 'INTERNAL_ERROR',
                message: 'Internal Error, please report this to the admins.'
            })
        if (contentKeys.length === 0) return []

        return contentKeys
    }

    public async getContentKey(kid: string) {
        const cached = server.cache.get(`ck-${kid}`) as ContentKeyType
        if (cached) return cached

        const contentKey = await this.findContentKey(kid)
        if (!contentKey) {
            return this.reply?.code(500).send({
                error: 'NOT_FOUND',
                message: 'No entry found with this kid.'
            })
        }

        server.cache.set(`ck-${kid}`, contentKey, 3600)
        return contentKey
    }

    public async createContentKey(contentkey: ContentKeyInit) {
        const contentKey = await this.findContentKey(contentkey.kid)
        if (contentKey && contentKey.kid === contentkey.kid && contentKey.key === contentkey.key && contentKey.content_type === 'audio' && contentkey.content_type === 'video') {
            this.deleteContentKey(contentKey.kid)
        } else if (contentKey && contentKey.kid === contentkey.kid && contentKey.key === contentkey.key) {
            return this.reply?.code(200).send()
        } else if (contentKey) {
            this.deleteContentKey(contentKey.kid)
        }

        const ck = await this.newContentKey(contentkey)

        // Send to discord bot
        if (ck && server.discordNewContentKey) {
            server.discordNewContentKey(ck)
        }

        return ck
    }

    public async deleteContentKey(kid: string) {
        const contentKey = await this.findContentKey(kid)
        if (!contentKey)
            return this.reply?.code(500).send({
                error: 'NOT_FOUND',
                message: 'Content key not found.'
            })

        server.cache.flushAll()
        return await this.delete(kid)
    }
}
