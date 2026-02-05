import NodeCache from 'node-cache'
import { Client } from 'discord.js'
import { ContentKey } from '../types/modules/zlo'

declare module 'fastify' {
    export interface FastifyInstance {
        cache: NodeCache
        zloAuth: any
        discordclient: Client<boolean>
        discordNewContentKey: ((contentKey: ContentKey) => Promise<void>) | undefined
        discorditems:
            | ((
                  items: {
                      title: string
                      url: string
                      description: string
                      epid: string
                      ssid: string
                      seid: string
                      version: string
                      isdub: boolean
                      duration: string
                      subtitles: string
                      img: string
                      released: Date
                  }[]
              ) => Promise<void>)
            | undefined
    }
}
