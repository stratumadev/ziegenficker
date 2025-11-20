import { server } from '../../app'
import { CrunchyrollEpisodes, CrunchyrollLogin } from '../../types/modules/crunchy'
import LogHandler from '../../utils/msg'
import RequestHandler from '../../utils/req'
import crypto from 'crypto'
import { XMLBuilder } from 'fast-xml-parser'
import { Agent } from 'undici'

export default class Crunchyroll {
    private req = new RequestHandler()
    private msg = new LogHandler()
    private langobj: {
        [key: string]: string
    } = {
        'en-US': 'English',
        'ja-JP': 'Japanese',
        'id-ID': 'Indonesian',
        'ms-MY': 'Malay',
        'ca-ES': 'Catalan',
        'de-DE': 'German',
        'es-LA': 'Castilian',
        'es-ES': 'Spanish',
        'es-419': 'Spanish',
        'fr-FR': 'French',
        'it-IT': 'Italian',
        'pl-PL': 'Polish',
        'pt-BR': 'Portugese',
        'pt-PT': 'Portuguese',
        'vi-VN': 'Vietnamese',
        'tr-TR': 'Turkish',
        'ru-RU': 'Russian',
        'ar-SA': 'Arabic',
        'hi-IN': 'Hindi',
        'ta-IN': 'Tamil',
        'te-IN': 'Telugu',
        'zh-HK': 'Cantonese',
        'zh-CN': 'Mandarin',
        'zh-TW': 'Mandarin',
        'ko-KR': 'Korean',
        'th-TH': 'Thai'
    }

    private async getAuth() {
        const cachedAuth: CrunchyrollLogin | undefined = server.cache.get('crunchyAuth')
        if (cachedAuth) return cachedAuth

        const body = new URLSearchParams()
        body.append('grant_type', 'client_id')
        body.append('device_id', '581a2c2b-526b-439f-8723-d28feb9e6685')

        const auth = await this.req.fetch<CrunchyrollLogin>('https://www.crunchyroll.com/auth/v1/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic YW55ZGF6d2F4Y2xyb2NhbndobzM6ODhnbklzdWNWLVE3c1lyWTI5dU9XX0pHbE1xeDFtQk4=`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                'User-Agent': 'Crunchyroll/ANDROIDTV/3.46.0_22275 (Android 12; en-US; SHIELD Android TV Build/SR1A.211012.001)'
            },
            body: body.toString()
        })
        if (!auth || !auth.access_token) {
            this.msg.errorConsoleLog('Failed to Login to Crunchy')
            return
        }

        server.cache.set('crunchyAuth', auth, auth.expires_in - 30)
        return auth
    }

    private async latestEpisodes(lang: string) {
        const auth = await this.getAuth()
        if (!auth) return

        const data = await this.req.fetch<CrunchyrollEpisodes>('https://www.crunchyroll.com/content/v2/discover/browse', {
            method: 'GET',
            query: {
                n: 5000,
                type: 'episode',
                sort_by: 'newly_added',
                locale: lang,
                force_locale: crypto.randomUUID()
            },
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0',
                Authorization: `Bearer ${auth.access_token}`,
                'User-Agent': `Crunchyroll/ANDROIDTV/3.46.0_22275 (Android 12; en-US; SHIELD Android TV Build/SR1A.211012.001)`
            },
            dispatcher: new Agent({
                keepAliveTimeout: 1,
                keepAliveMaxTimeout: 1
            })
        })
        if (!data || !data.data || data.data.length === 0) return this.msg.errorConsoleLog('Failed to get latest episodes')

        return data.data
    }

    private generateXMLImages(
        imgs: {
            height: number
            source: string
            type: string
            width: number
        }[]
    ) {
        if (!imgs || imgs.length === 0) return []
        return {
            'media:thumbnail': imgs.map((i) => ({
                '@_url': i.source,
                '@_width': i.width,
                '@_height': i.height
            }))
        }
    }

    private seasonNameHandler(name: string) {
        const match = name.match(/^Season\s+(\d+)(?:\s*\((.+)\))?$/)
        if (match) {
            // Season Number
            const n = parseInt(match[1], 10)
            // Extra eg. (English Dub)
            const d = match[2]

            if (n === 1) {
                if (d) {
                    return ' ' + d
                } else {
                    return ''
                }
            } else {
                return ' ' + name
            }
        } else {
            return ' ' + name
        }
    }

    private async generateRSSFeed(lang: string) {
        const domain = process.env.DOMAIN
        if (!domain) return

        var episodes = await this.latestEpisodes(lang)
        if (!episodes) return

        const now = new Date().toUTCString()

        episodes = episodes.sort((a, b) => {
            const dateA = new Date(a.episode_metadata.premium_available_date ?? a.episode_metadata.availability_starts ?? a.last_public ?? now).getTime()
            const dateB = new Date(b.episode_metadata.premium_available_date ?? b.episode_metadata.availability_starts ?? b.last_public ?? now).getTime()
            return dateB - dateA
        })

        const rssData = {
            '?xml': {
                '@_version': '1.0'
            },
            rss: {
                '@_version': '2.0',
                '@_xmlns:media': 'http://search.yahoo.com/mrss/',
                '@_xmlns:atom': 'http://www.w3.org/2005/Atom',
                '@_xmlns:crunchyroll': 'https://www.crunchyroll.com/rss',
                channel: {
                    title: 'Latest Crunchyroll Videos',
                    description: 'Check out the newest videos on Crunchyroll.',
                    link: 'https://www.crunchyroll.com/',
                    'atom:link': {
                        '@_href': domain + '/crunchyroll/rss',
                        '@_rel': 'self',
                        '@_type': 'application/rss+xml'
                    },
                    copyright: 'Copyright © 2025 Crunchyroll LLC All rights reserved.',
                    pubDate: now,
                    lastBuildDate: now,
                    language: lang,
                    item: episodes.slice(0, 50).map((ep) => ({
                        title: `${ep.episode_metadata.season_title && !ep.episode_metadata.season_title.startsWith('Season') ? ep.episode_metadata.season_title : ep.episode_metadata.series_title}${ep.episode_metadata.season_title && ep.episode_metadata.season_title.startsWith('Season') ? this.seasonNameHandler(ep.episode_metadata.season_title) : ''}${ep.episode_metadata.audio_locale && ep.episode_metadata.versions && ep.episode_metadata.versions.length !== 0 && ep.episode_metadata.versions.find((e) => e.audio_locale === ep.episode_metadata.audio_locale)?.original === false && this.langobj[ep.episode_metadata.audio_locale] && (!ep.episode_metadata.season_title || !ep.episode_metadata.season_title.includes(' Dub')) ? ' (' + this.langobj[ep.episode_metadata.audio_locale] + ' Dub)' : ''}${ep.episode_metadata.episode ? ' - Episode ' + ep.episode_metadata.episode : ''}${ep.title ? ' - ' + ep.title : ''}`,
                        link: `https://www.crunchyroll.com/watch/${ep.id}/${ep.slug_title}`,
                        guid: /^\d+$/.test(ep.external_id?.split('.')[1] || '')
                            ? {
                                  '@_isPermaLink': 'true',
                                  '#text': `https://www.crunchyroll.com/media-${ep.external_id.split('.')[1]}`
                              }
                            : undefined,
                        description: `${ep.images?.thumbnail?.[0]?.[0]?.source ? '<img src="' + ep.images?.thumbnail?.[0]?.[0]?.source + '" /><br />' : ''}${ep.description}`,
                        enclosure: ep.images?.thumbnail?.[0]?.[0]?.source
                            ? {
                                  '@_url': ep.images?.thumbnail?.[0]?.[0]?.source,
                                  '@_type': 'image/jpeg',
                                  '@_length': '0'
                              }
                            : undefined,
                        category: 'Anime',
                        'media:category': {
                            '@_scheme': 'http://gdata.youtube.com/schemas/2007/categories.cat',
                            '@_label': 'Anime',
                            '#text': 'Movies_Anime_animation'
                        },
                        // Times
                        pubDate: new Date(ep.episode_metadata.premium_available_date ?? ep.episode_metadata.availability_starts ?? ep.last_public).toUTCString(),
                        'crunchyroll:freePubDate': new Date(ep.episode_metadata.free_available_date).toUTCString(),
                        'crunchyroll:premiumPubDate': new Date(ep.episode_metadata.premium_available_date).toUTCString(),
                        'crunchyroll:endPubDate': new Date(ep.episode_metadata.availability_ends).toUTCString(),
                        'crunchyroll:premiumEndPubDate': new Date(ep.episode_metadata.availability_ends).toUTCString(),
                        'crunchyroll:freeEndPubDate': new Date(ep.episode_metadata.availability_ends).toUTCString(),
                        // Series
                        'crunchyroll:seriesId': ep.episode_metadata.series_id,
                        'crunchyroll:seriesTitle': ep.episode_metadata.series_title,
                        // Season
                        'crunchyroll:seasonId': ep.episode_metadata.season_id,
                        'crunchyroll:seasonTitle': ep.episode_metadata.season_title,
                        // Episode
                        'crunchyroll:isDubbed':
                            ep.episode_metadata.audio_locale &&
                            ep.episode_metadata.versions &&
                            ep.episode_metadata.versions.length !== 0 &&
                            ep.episode_metadata.versions.find((e) => e.audio_locale === ep.episode_metadata.audio_locale)?.original === false
                                ? true
                                : false,
                        'crunchyroll:episodeId': ep.id,
                        'crunchyroll:mediaId': ep.external_id.split('.')[1],
                        'crunchyroll:episodeTitle': ep.title,
                        'crunchyroll:episodeDescription': ep.description ?? 'No Description',
                        'crunchyroll:episodeNumber': ep.episode_metadata.episode,
                        'crunchyroll:contentDescriptors':
                            ep.episode_metadata.content_descriptors && ep.episode_metadata.content_descriptors.length !== 0
                                ? ep.episode_metadata.content_descriptors.join(', ')
                                : undefined,
                        // Duration
                        'crunchyroll:duration': ep.episode_metadata.duration_ms ? Math.floor(ep.episode_metadata.duration_ms / 1000) : 0,
                        'crunchyroll:durationFormatted': (() => {
                            if (!ep.episode_metadata.duration_ms) return '0s'
                            const totalSeconds = Math.floor(ep.episode_metadata.duration_ms / 1000)
                            const hours = Math.floor(totalSeconds / 3600)
                            const minutes = Math.floor((totalSeconds % 3600) / 60)
                            const seconds = totalSeconds % 60

                            let formatted = ''
                            if (hours > 0) formatted += `${hours}h`
                            if (minutes > 0 || hours > 0) formatted += `${minutes}m`
                            formatted += `${seconds}s`

                            return formatted
                        })(),
                        // Content
                        'media:content': {
                            '@_type': 'video/mp4',
                            '@_medium': 'video',
                            '@_duration': ep.episode_metadata.duration_ms ? Math.floor(ep.episode_metadata.duration_ms / 1000) : 0
                        },
                        // Lang
                        'crunchyroll:audioLanguage': ep.episode_metadata.audio_locale,
                        'crunchyroll:subtitleLanguages':
                            ep.episode_metadata.subtitle_locales && ep.episode_metadata.subtitle_locales.length !== 0 ? ep.episode_metadata.subtitle_locales.join(', ') : undefined,
                        // Images
                        ...this.generateXMLImages(ep.images.thumbnail?.[0]),
                        // Last Modified
                        'crunchyroll:modifiedDate': new Date(ep.last_public).toUTCString()
                    }))
                }
            }
        }

        if (lang === 'en-US' && server.discorditems) {
            await server.discorditems(
                episodes.slice(0, 100).map((ep) => ({
                    title: `${ep.episode_metadata.season_title && !ep.episode_metadata.season_title.startsWith('Season') ? ep.episode_metadata.season_title : ep.episode_metadata.series_title}${ep.episode_metadata.season_title && ep.episode_metadata.season_title.startsWith('Season') ? this.seasonNameHandler(ep.episode_metadata.season_title) : ''}${ep.episode_metadata.audio_locale && ep.episode_metadata.versions && ep.episode_metadata.versions.length !== 0 && ep.episode_metadata.versions.find((e) => e.audio_locale === ep.episode_metadata.audio_locale)?.original === false && this.langobj[ep.episode_metadata.audio_locale] && (!ep.episode_metadata.season_title || !ep.episode_metadata.season_title.includes(' Dub')) ? ' (' + this.langobj[ep.episode_metadata.audio_locale] + ' Dub)' : ''}${ep.episode_metadata.episode ? ' - Episode ' + ep.episode_metadata.episode : ''}${ep.title ? ' - ' + ep.title : ''}`,
                    url: `https://www.crunchyroll.com/watch/${ep.id}/${ep.slug_title}`,
                    released: new Date(ep.episode_metadata.premium_available_date ?? ep.episode_metadata.availability_starts ?? ep.last_public),
                    img: (() => {
                        const thumbs = ep.images?.thumbnail?.flat() ?? []
                        if (thumbs.length === 0) return ''

                        const best = thumbs.sort((a, b) => b.width * b.height - a.width * a.height)[0]
                        return best.source
                    })(),
                    seid: ep.episode_metadata.series_id,
                    ssid: ep.episode_metadata.season_id,
                    isdub:
                        ep.episode_metadata.audio_locale &&
                        ep.episode_metadata.versions &&
                        ep.episode_metadata.versions.length !== 0 &&
                        ep.episode_metadata.versions.find((e) => e.audio_locale === ep.episode_metadata.audio_locale)?.original === false
                            ? true
                            : false,
                    epid: ep.id,
                    description: ep.description ?? 'No Description',
                    duration: (() => {
                        if (!ep.episode_metadata.duration_ms) return '0s'
                        const totalSeconds = Math.floor(ep.episode_metadata.duration_ms / 1000)
                        const hours = Math.floor(totalSeconds / 3600)
                        const minutes = Math.floor((totalSeconds % 3600) / 60)
                        const seconds = totalSeconds % 60

                        let formatted = ''
                        if (hours > 0) formatted += `${hours}h`
                        if (minutes > 0 || hours > 0) formatted += `${minutes}m`
                        formatted += `${seconds}s`

                        return formatted
                    })(),
                    version: ep.episode_metadata.audio_locale,
                    subtitles: ep.episode_metadata.subtitle_locales && ep.episode_metadata.subtitle_locales.length !== 0 ? ep.episode_metadata.subtitle_locales.join(', ') : '-'
                }))
            )
        }

        const builder = new XMLBuilder({
            ignoreAttributes: false,
            format: true,
            suppressEmptyNode: true,
            suppressBooleanAttributes: false
        })

        return builder.build(rssData)
    }

    public async startRSSUpdater() {
        const langs = ['en-US', 'id-ID', 'de-DE', 'es-419', 'es-ES', 'fr-FR', 'it-IT', 'pt-BR', 'pt-PT', 'ru-RU', 'ar-SA', 'hi-IN']

        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

        const updateAllLangs = async () => {
            for (const lang of langs) {
                try {
                    const rss = await this.generateRSSFeed(lang)
                    if (rss) {
                        server.cache.set(`crunchyRSS:${lang}`, rss)
                        this.msg.infoConsoleLog(`Crunchyroll RSS-Feed updated for ${lang}`)
                    }
                } catch (err) {
                    this.msg.errorConsoleLog(`Failed to update Crunchyroll RSS for ${lang}`, err)
                }

                await delay(400)
            }
        }

        const loop = async () => {
            await updateAllLangs()
            this.msg.infoConsoleLog('Crunchyroll RSS Update Cycle finished – waiting 3s before next round...')
            setTimeout(loop, 3 * 1000)
        }

        await loop()
    }
}
