require('dotenv').config()

module.exports = {
    development: {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
        pool: {
            max: 50,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    production: {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 50,
            min: 0,
            acquire: 60000,
            idle: 10000
        }
    }
}
