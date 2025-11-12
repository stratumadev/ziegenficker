import { FetchOptions, FetchRequest, ofetch } from 'ofetch'
import LogHandler from './msg'

export default class RequestHandler {
    private msg

    constructor() {
        this.msg = new LogHandler()
    }

    public async fetch<T>(request: FetchRequest, options?: FetchOptions<'json', any> | undefined): Promise<T | undefined> {
        const data = await ofetch<T>(request, {
            ...options,
            onResponseError: ({ response }) => {
                const errorBody = response._data
                this.msg.errorConsoleLog('[RequestHandler] Error response', errorBody)
            }
        }).catch((error) => this.msg.errorConsoleLog('[RequestHandler]', error))

        if (!data) return

        return data
    }
}
