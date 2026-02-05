import 'dotenv/config'
import { Client, EmbedBuilder, Events, GatewayIntentBits, REST, Routes, time } from 'discord.js'
import { server } from '../app'
import path from 'path'
import fs from 'fs'
import { ContentKey as ContentKeyType } from '../types/modules/zlo'
import { ContentKey } from '../database/database'

const retardList: string[] = []

const configPath = path.join(__dirname, '..', '..', 'config', 'send.json')
var config:
    | {
          crunchyroll: string[]
      }
    | undefined

export const discord = async () => {
    const TOKEN = process.env.DISCORD_TOKEN
    if (!TOKEN) return

    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    })

    client.login(TOKEN)

    await new Promise<void>((resolve) => {
        client.once(Events.ClientReady, async (readyClient) => {
            console.log(`Discord logged in as ${readyClient.user.tag}`)

            client.user?.setPresence({
                activities: [{ name: 'with Izucos balls', type: 0 }],
                status: 'online'
            })

            const rest = new REST({ version: '10' }).setToken(TOKEN)
            await rest.put(Routes.applicationCommands(readyClient.user.id), {
                body: [
                    {
                        name: 'izuco',
                        description: 'See what happens when you nest if statements'
                    },
                    {
                        name: 'contentkeys',
                        description: 'Manage stored content keys',
                        options: [
                            {
                                name: 'count',
                                description: 'Get number of stored content keys',
                                type: 1
                            }
                        ]
                    }
                ]
            })

            server.decorate('discordclient', client)
            resolve()
        })
    })

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return

        if (interaction.commandName === 'izuco') {
            await interaction.reply('Scheiss If Nester')
            await interaction.followUp('https://media.discordapp.net/attachments/884517764344205333/1429508842114519170/500080178-27a7b421-aea0-4e24-93d4-65a9d51ba1d1.png')
        }

        if (interaction.commandName === 'contentkeys') {
            const sub = interaction.options.getSubcommand()

            if (sub === 'count') {
                const count = await ContentKey.count()

                await interaction.reply({
                    embeds: [new EmbedBuilder().setColor('#00ff99').setTitle('Content Keys').setDescription(`Stored Content Keys: **${count}**`)]
                })
            }
        }
    })

    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return

        if (message.content.toLowerCase().includes('nordvpn') && message.content.toLowerCase().includes('love')) {
            await message.reply('https://cdn.discordapp.com/attachments/1323305764130918473/1332078587792068759/r_u_ok.gif')
        }

        if (message.content.toLowerCase().includes('python') && message.content.toLowerCase().includes('love')) {
            await message.reply('https://media.discordapp.net/attachments/1210429883365330957/1221278514263756800/caption.gif')
            await message.reply('https://tenor.com/view/throw-up-dry-heave-vomit-gross-eww-gif-23254758')
        }

        if (message.channelId === '884518760415916062' && (message.content.toLowerCase().includes('help') || message.content.toLowerCase().includes('guide'))) {
            await message.reply(
                'Did you read the [Docs](<https://github.com/anidl/multi-downloader-nx/blob/master/docs/DOCUMENTATION.md>) or the [GET-STARTED](<https://github.com/anidl/multi-downloader-nx/blob/master/docs/GET-STARTED.md>) guide already?'
            )

            retardList.push(message.author.id)
            return
        }

        if (
            message.channelId === '884518760415916062' &&
            retardList.find((r) => r === message.author.id) &&
            (message.content.toLowerCase().includes('nah') || message.content.toLowerCase().includes('no') || message.content.toLowerCase().includes('nope'))
        ) {
            await message.reply('Fucking Clown KYS Nigger')
            await message.reply('https://cdn.discordapp.com/attachments/1374753974212890687/1375404513418281062/76B15A8B-9535-4127-9007-EDC968500385.gif')
        }

        if (message.channelId === '884518760415916062' && retardList.includes(message.author.id)) {
            const i = retardList.indexOf(message.author.id)
            if (i !== -1) retardList.splice(i, 1)
        }
    })

    async function sendNewContentKey(contentKey: ContentKeyType) {
        try {
            const channel = await client.channels.fetch('1468966773796765991')
            if (channel && channel.isTextBased() && channel.isSendable()) {
                const embed = new EmbedBuilder()
                    .setColor('#dbdbdb')
                    .setAuthor({
                        name: 'ZLO'
                    })
                    .setTitle(`New Content Key`)
                    .setDescription(`${contentKey.kid}:${contentKey.key}`)
                    .addFields(
                        { name: 'Type', value: contentKey.content_type.toUpperCase(), inline: true },
                        { name: 'Service', value: contentKey.service.toUpperCase(), inline: true },
                        { name: 'Item', value: contentKey.item, inline: true },
                        { name: 'Season', value: contentKey.season && contentKey.season.length > 0 ? contentKey.season : '-', inline: true },
                        { name: 'Episode', value: contentKey.episode && contentKey.episode.length > 0 ? contentKey.episode : '-', inline: true },
                        {
                            name: 'Resolution',
                            value: contentKey.video_resolution ? `${contentKey.video_resolution.width}x${contentKey.video_resolution.height}` : '-',
                            inline: true
                        }
                    )
                    .setFooter({
                        text: `Fuck Niggers`
                    })

                await channel.send({ embeds: [embed] })
                console.log(`Message send: ${contentKey.kid}`)
            }
        } catch (e) {
            console.error('Error on message sending discord:', e)
        }
    }

    async function sendNewItems(
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
    ) {
        try {
            if (!config) {
                if (!fs.existsSync(configPath)) {
                    fs.writeFileSync(
                        configPath,
                        JSON.stringify(
                            {
                                crunchyroll: []
                            },
                            null,
                            2
                        )
                    )
                }
                config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
            }

            if (!config) return

            const now = Date.now()
            const cutoff = now - 24 * 60 * 60 * 1000

            const newItems = items.filter((item) => !config!.crunchyroll.includes(item.epid) && new Date(item.released).getTime() >= cutoff)

            if (newItems.length === 0) return

            config!.crunchyroll.push(...newItems.map((i) => i.epid))
            config!.crunchyroll = config!.crunchyroll.slice(-1000)
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

            const channel = await client.channels.fetch('1424068594156830863')
            if (channel && channel.isTextBased() && channel.isSendable()) {
                for (const i of newItems) {
                    const embed = new EmbedBuilder()
                        .setColor('#FFBA00')
                        .setAuthor({
                            name: 'Crunchyroll New Video',
                            url: 'https://www.crunchyroll.com/',
                            iconURL: 'https://www.crunchyroll.com/build/assets/img/favicons/apple-touch-icon-v2-114x114.png'
                        })
                        .setTitle(i.title)
                        .setURL(i.url)
                        .setDescription(i.description && i.description.length > 0 ? i.description : null)
                        .addFields(
                            { name: 'Episode ID', value: i.epid, inline: true },
                            { name: 'Season ID', value: i.ssid, inline: true },
                            { name: 'Series ID', value: i.seid, inline: true },
                            { name: 'Version', value: i.version, inline: true },
                            { name: 'IsDub', value: i.isdub ? 'true' : 'false', inline: true },
                            { name: 'Duration', value: i.duration, inline: true },
                            { name: 'Subtitles', value: i.subtitles, inline: false }
                        )
                        .setImage(i.img)
                        .setFooter({
                            text: `Fuck Crunchyroll`
                        })
                        .setTimestamp(i.released)

                    const sent = await channel.send({ embeds: [embed] })

                    console.log(`Message send: ${i.title}`)

                    // Disabled because ratelimit
                    // if (sent.crosspostable) {
                    //     try {
                    //         await sent.crosspost()
                    //         console.log(`Message crossposted: ${i.title}`)
                    //     } catch (err) {
                    //         console.error('Error on message crosspost:', err)
                    //     }
                    // }
                }
            }
        } catch (e) {
            console.error('Error on message sending discord:', e)
        }
    }

    server.decorate('discorditems', sendNewItems)
    server.decorate('discordNewContentKey', sendNewContentKey)
}
