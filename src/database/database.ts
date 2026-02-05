import { Sequelize, DataTypes, ModelDefined } from 'sequelize'
import { ContentKey, ContentKeyInit } from '../types/modules/zlo'
const config = require(__dirname + '/../../config/config.js')['production']

const sequelize = new Sequelize(config.url, config)

const ContentKey: ModelDefined<ContentKey, ContentKeyInit> = sequelize.define(
    'contentkeys',
    {
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        kid: {
            allowNull: false,
            primaryKey: true,
            unique: true,
            type: DataTypes.STRING(32)
        },
        key: {
            allowNull: false,
            type: DataTypes.STRING(32)
        },
        content_type: {
            allowNull: false,
            type: DataTypes.STRING(5)
        },
        service: {
            allowNull: false,
            type: DataTypes.STRING
        },
        item: {
            allowNull: false,
            type: DataTypes.STRING(500)
        },
        season: {
            allowNull: true,
            type: DataTypes.STRING
        },
        episode: {
            allowNull: true,
            type: DataTypes.STRING
        },
        video_resolution: {
            allowNull: true,
            type: DataTypes.JSONB
        }
    },
    { freezeTableName: true }
)

export { sequelize, ContentKey }
