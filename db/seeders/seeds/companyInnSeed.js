const { userSeed } = require('./userSeed');

const now = new Date();

const companyInnSeed = [
	{
		'id': '33b285ea-7ad7-11ed-8876-af1a703eb020',
		'user_id': userSeed[2].id,
		'phone': userSeed[2].phone,
		'type': 1,
		'name': 'Сергей',
		'patronymic': 'Викторович',
		'last_name': 'Поланский',
		'is_default': true,
		'birth_date': '1989-01-15',
		'contact_phone': '+7 526 854 85 08',
		'payment_type': 'Без НДС',
		'taxpayer_number': '000000000000',
		'passport_serial_number': '000000000000',
		'passport_given_date': '2019-01-01',
		'passport_subdivision_code': '648 485',
		'passport_issued_by': 'УМВД по Волгоградской области, г. Волгоград',
		'passport_registration_address': 'Россия, Волгоградская обл., г. Ленинск, 404620',
		'address': 'Россия, Калужская обл., г. Обнинск, 249030',
		'postal_address': 'Россия, Калужская обл., г. Таруса, 249100',
		'actual_address': 'Россия, Калининградская обл., г. Приморск, 238510',
		'email': 'sergey.polansk@yandex.ru',
		'created_at': now,
		'updated_at': now
	},
	{
		'id': '4482a652-7ad7-11ed-9f62-cb2ef5ae9c5f',
		'user_id': userSeed[3].id,
		'phone': userSeed[3].phone,
		'name': 'Артем',
		'patronymic': 'Федорович',
		'last_name': 'Галак',
		'is_default': true,
		'birth_date': '1991-05-23',
		'taxpayer_number': '000000000000',
		'type': 2,
		'passport_serial_number': '000000000000',
		'passport_given_date': '2019-01-01',
		'passport_subdivision_code': '648 485',
		'passport_issued_by': 'УМВД по Ивановской области, Белград',
		'passport_registration_address': 'Россия, Краснодарский край, г. Краснодар, 350000',
		'address': 'Россия, Краснодарский край, г. Анапа, 353440',
		'postal_address': 'Россия, Краснодарский край, г. Абинск, 353320',
		'actual_address': 'Россия, Краснодарский край, г. Абинск, 353320',
		'personal_phone': '+7 526 854 85 08',
		'email': 'artegal@yandex.ru',
		'created_at': now,
		'updated_at': now
	}
];

module.exports = { companyInnSeed };
