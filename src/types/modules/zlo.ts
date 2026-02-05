interface VideoResolution {
    height: number
    width: number
    bitrate: number
    codec: string
    framerate?: number | undefined
}

export interface ContentKey {
    createdAt?: Date
    updatedAt?: Date
    kid: string
    key: string
    content_type: 'video' | 'audio'
    service: string
    item: string
    season?: string
    episode?: string
    video_resolution?: VideoResolution
}

export interface ContentKeyInit {
    kid: string
    key: string
    content_type: 'video' | 'audio'
    service: string
    item: string
    season?: string
    episode?: string
    video_resolution?: VideoResolution
}
