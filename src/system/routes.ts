import { server } from '../app'
import crunchyRoutes from '../routing/crunchy/crunchy.route'

export const routes = async () => {
    // Crunchyroll routes
    server.register(crunchyRoutes, { prefix: '/crunchyroll' })
}
