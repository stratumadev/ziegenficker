import NodeCache from 'node-cache'
import { Client } from 'discord.js'

declare module 'fastify' {
    export interface FastifyInstance {
        cache: NodeCache
        discordclient: Client<boolean>
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
