import { sequelize } from '../database/database'

export const syncDatabase = async () => {
    try {
        await sequelize.authenticate({
            logging: false
        })
        console.log('Connection to Database has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the Database:', error)
    }

    try {
        await sequelize.sync({
            logging: false
        })
        console.log('All models were synchronized successfully.')
    } catch (error) {
        console.log('Failed to synchronize Models')
    }
}
