const { userSeed } = require('./userSeed');

const now = new Date();

const companySeed = [
	{
		'id': '00da494a-7ad7-11ed-8613-e757132d41a7',
		'user_id': userSeed[0].id,
		'phone': userSeed[0].phone,
		'type': 0,
		'name': 'Карго Сервис',
		'legal_name': 'ООО "КаргоСервис"',
		'is_default': true,
		'taxpayer_number': '000000000000',
		'tax_reason_code': '000000000000',
		'registration_number': '000000000000',
		'passport_serial_number': '000000000000',
		'passport_given_date': '2018-01-01',
		'passport_subdivision_code': '883 835 ',
		'passport_issued_by': 'ГУМВД России по Брянской области',
		'passport_registration_address': 'Россия, Брянская обл., г. Фокино, 242610',
		'legal_address': 'Россия, Брянская область, г. Брянск, ул. Ленина, 241000',
		'postal_address': 'Россия, Брянская обл., г. Клинцы, 243140',
		'director': 'Валерий Громов',
		'email': 'cargo.services@ya.ru',
		'payment_type': 'Без НДС',
		'created_at': now,
		'updated_at': now
	},
	{
		'id': '2285cd58-7ad7-11ed-9d18-b7e60aa3dcc7',
		'user_id': userSeed[1].id,
		'phone': userSeed[1].phone,
		'type': 0,
		'is_default': true,
		'taxpayer_number': '749823047628',
		'name': 'Веселый Перевозчик',
		'legal_name': 'ООО "Веселый Перевозчик"',
		'tax_reason_code': '000000000000',
		'registration_number': '000000000000',
		'passport_serial_number': '000000000000',
		'passport_given_date': '2019-04-10',
		'passport_subdivision_code': '612 126',
		'passport_issued_by': 'ГУМВД России по Смоленской области',
		'passport_registration_address': 'г. Брянск, пр. Теслы, 830 кв. 460',
		'legal_address': 'Россия, Смоленская область, г. Смоленск, ул. Таранова, 329 кв. 108',
		'postal_address': 'Россия, Республика Татарстан, г. Казань, пр. Тимирязева, 124 кв. 797',
		'director': 'Игорь Саратов',
		'email': 'happy-cargo@ya.ru',
		'payment_type': 'Наличными',
		'created_at': now,
		'updated_at': now
	}
];

module.exports = { companySeed };
