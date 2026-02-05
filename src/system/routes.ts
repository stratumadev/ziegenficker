import { server } from '../app'
import crunchyRoutes from '../routing/crunchy/crunchy.route'
import zloRoutes from '../routing/zlo/zlo.route'

export const routes = async () => {
    // Crunchyroll routes
    server.register(crunchyRoutes, { prefix: '/crunchyroll' })

    // ZLO routes
    server.register(zloRoutes, { prefix: '/zlo' })
}
