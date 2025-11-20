import 'dotenv/config'
import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import path from 'path'
import cors from '@fastify/cors'
import NodeCache from 'node-cache'
import { routes } from './system/routes'
import { middlewares } from './system/middlewares'
import { cronjobs } from './system/cronjobs'
import Crunchyroll from './modules/crunchy/crunchy'
import { discord } from './system/discord'
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120, useClones: false })

// Startup Fastify server
export const server = fastify()

// Cors Handler
server.register(cors, {
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['*']
})

// // Image Handler
server.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/static',
    wildcard: true,
    cacheControl: true,
    maxAge: 31536000000
})

// Decorate Cache Controller
server.decorate('cache', cache)

// On route not exist
server.setNotFoundHandler((request, reply) => {
    return reply.code(404).send({ error: 'Not found' })
})

// Server Healthcheck
server.get('/health', async function (request, reply) {
    return reply.code(200).send('OK')
})
;(async () => {
    if (!process.env.DOMAIN) {
        console.error('Domain variable not defined in .env, cannot startup server.')
        process.exit(1)
    }
    if (process.env.DISCORD_TOKEN) {
        await discord()
        console.log('Discord Bot loaded.')
    } else {
        console.log('Discord Bot token missing, not booting discord client.')
    }
    await middlewares()
    console.log('Middlewares loaded.')
    await routes()
    console.log('Routes loaded.')
    await cronjobs()

    // Bootup server
    server.listen(
        {
            host: '0.0.0.0',
            port: 8080
        },
        (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(`Server listening at ${address}`)
        }
    )

    // Init RSS
    const crunchy = new Crunchyroll()
    await crunchy.startRSSUpdater()
    console.log('RSS loaded.')
})()
