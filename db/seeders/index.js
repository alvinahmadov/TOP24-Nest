// noinspection JSUnusedGlobalSymbols

const { addressSeed } = require('./seeds/addressSeed');

module.exports = {
	up: async (queryInterface) => {
		try {
			await queryInterface.bulkInsert('addresses', addressSeed, {});
		} catch (err) {
			console.error(`Seeding error: ${err}\nStack: ${err.stack}`);
		}
	},

	down: async (queryInterface) => {
		try {
			await queryInterface.bulkDelete('addresses', null, {});
			await queryInterface.bulkDelete('admins', null, {});
			await queryInterface.bulkDelete('images', null, {});
			await queryInterface.bulkDelete('offers', null, {});
			await queryInterface.bulkDelete('orders', null, {});
			await queryInterface.bulkDelete('transports', null, {});
			await queryInterface.bulkDelete('drivers', null, {});
			await queryInterface.bulkDelete('payments', null, {});
			await queryInterface.bulkDelete('cargo_companies', null, {});
			await queryInterface.bulkDelete('cargoinn_companies', null, {});
		} catch (err) {
			console.error(`Seeding error: ${err}\nStack: ${err.stack}`);
		}
	}
};
