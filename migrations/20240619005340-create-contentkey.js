'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('contentkeys', {
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            kid: {
                allowNull: false,
                primaryKey: true,
                unique: true,
                type: Sequelize.STRING(32)
            },
            key: {
                allowNull: false,
                type: Sequelize.STRING(32)
            },
            content_type: {
                allowNull: false,
                type: Sequelize.STRING(5)
            },
            service: {
                allowNull: false,
                type: Sequelize.STRING
            },
            item: {
                allowNull: false,
                type: Sequelize.STRING(500)
            },
            season: {
                allowNull: true,
                type: Sequelize.STRING
            },
            episode: {
                allowNull: true,
                type: Sequelize.STRING
            },
            video_resolution: {
                allowNull: true,
                type: Sequelize.JSONB
            }
        })
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('contentkeys')
    }
}
