import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import path from 'path'
import cors from '@fastify/cors'
import NodeCache from 'node-cache'
import 'dotenv/config'
import { routes } from './system/routes'
import { middlewares } from './system/middlewares'
import MultiPart from '@fastify/multipart'
import { cronjobs } from './system/cronjobs'
import Crunchyroll from './modules/crunchy/crunchy'
import { discord } from './system/discord'
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120, useClones: false })
const isProd = process.env.ISPROD

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

server.register(MultiPart, {
    limits: {
        fileSize: 1000000000,
        parts: 1000
    }
})

// On route not exist
server.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: 'Not found' })
})

// Server Healthcheck
server.get('/health', async function (request, response) {
    return { status: 'OK' }
})
;(async () => {
    await discord()
    console.log('Discord Bot loaded.')
    const crunchy = new Crunchyroll()
    await crunchy.startRSSUpdater()
    console.log('RSS loaded.')
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
})()
