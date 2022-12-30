const { addressSeed } = require('./seeds/addressSeed');
const { adminSeed } = require('./seeds/adminSeed');
const { companySeed } = require('./seeds/companySeed');
const { companyInnSeed } = require('./seeds/companyInnSeed');
const { driverSeed } = require('./seeds/driverSeed');
const { paymentSeed } = require('./seeds/paymentSeed');
const { transportSeed } = require('./seeds/transportSeed');
const { userSeed } = require('./seeds/userSeed');

module.exports = {
	up: async (queryInterface) => {
		try {
			await queryInterface.bulkInsert('addresses', addressSeed, {});
			await queryInterface.bulkInsert('admins', adminSeed, {});
			await queryInterface.bulkInsert('users', userSeed, {});
			await queryInterface.bulkInsert('companies', companySeed, {});
			await queryInterface.bulkInsert('companies_inn', companyInnSeed, {});
			await queryInterface.bulkInsert('payments', paymentSeed, {});
			await queryInterface.bulkInsert('drivers', driverSeed, {});
			await queryInterface.bulkInsert('transports', transportSeed, {});
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
			await queryInterface.bulkDelete('companies', null, {});
			await queryInterface.bulkDelete('companies_inn', null, {});
			await queryInterface.bulkDelete('users', null, {});
		} catch (err) {
			console.error(`Seeding error: ${err}\nStack: ${err.stack}`);
		}
	}
};
