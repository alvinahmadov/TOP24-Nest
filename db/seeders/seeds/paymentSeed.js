const { companySeed } = require('./companySeed');
const { companyInnSeed } = require('./companyInnSeed');

const now = new Date();

const paymentSeed = [
	{
		'id': '1ca68592-7af2-11ed-a812-132cf34145f5',
		'cargo_id': companySeed[0].id,
		'correspondent_account': '444136754757424',
		'current_account': '966643932671329',
		'bank_name': 'Райхарт Инкорпорэйтед',
		'bank_bic': 'HXDIMXS1',
		'created_at': now,
		'updated_at': now
	},
	{
		'id': '23b58c02-7af2-11ed-a25d-2f86992e5f6a',
		'cargo_id': companySeed[1].id,
		'correspondent_account': '029873471982022',
		'current_account': '264067094618991',
		'bank_name': 'Трэмбли Снаб',
		'bank_bic': 'ESFATRZ1',
		'created_at': now,
		'updated_at': now
	},
	{
		'id': '2f110c2a-7af2-11ed-9eac-7bc9ed24de40',
		'cargoinn_id': companyInnSeed[0].id,
		'correspondent_account': '937839613009415',
		'current_account': '683356270653506',
		'ogrnip': '1383233359',
		'bank_name': 'Ходкиевич - Бэрроуз',
		'bank_bic': 'JTHEKHR1',
		'created_at': now,
		'updated_at': now
	}
];

module.exports = { paymentSeed };
