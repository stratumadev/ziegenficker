export interface CrunchyrollLogin {
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
    scope: string
    country: string
    account_id: string
    profile_id: string
}

export interface CrunchyrollEpisode {
    slug: string
    last_public: string
    streams_link: string
    images: {
        thumbnail: {
            height: number
            source: string
            type: string
            width: number
        }[][]
    }
    promo_title: string
    linked_resource_key: string
    description: string
    external_id: string
    promo_description: string
    channel_id: string
    id: string
    title: string
    type: string
    new: boolean
    episode_metadata: {
        audio_locale: string
        availability_ends: string
        availability_notes: string
        availability_starts: string
        availability_status: string
        available_date: any
        available_offline: boolean
        closed_captions_available: boolean
        content_descriptors: string[]
        duration_ms: number
        eligible_region: string
        episode: string
        episode_air_date: string
        episode_number: number
        extended_maturity_rating: {
            level: string
            rating: string
            system: string
        }
        free_available_date: string
        identifier: string
        is_clip: boolean
        is_dubbed: boolean
        is_mature: boolean
        is_premium_only: boolean
        is_subbed: boolean
        mature_blocked: boolean
        maturity_ratings: string[]
        premium_available_date: string
        premium_date: any
        roles: string[]
        season_display_number: string
        season_id: string
        season_number: number
        season_sequence_number: number
        season_slug_title: string
        season_title: string
        sequence_number: number
        series_id: string
        series_slug_title: string
        series_title: string
        subtitle_locales: string[]
        upload_date: string
        versions: {
            audio_locale: string
            guid: string
            is_premium_only: boolean
            media_guid: string
            original: boolean
            roles: string[]
            season_guid: string
            variant: string
        }[]
    }
    slug_title: string
}

export interface CrunchyrollEpisodes {
    total: number
    data: CrunchyrollEpisode[]
}
