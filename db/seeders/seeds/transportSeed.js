const now = new Date();

const transportSeed = [
	{
		'id': '2121353a-7ae4-11ed-aa3e-a3275990f5ba',
		'cargo_id': '00da494a-7ad7-11ed-8613-e757132d41a7',
		'driver_id': 'cc00e758-7ae3-11ed-b003-8f261a76559a',
		'status': 1,
		'type': 'Цельнометаллический',
		'fixtures': [
			'Гидроборт',
			'Коники',
			'Цепи'
		],
		'brand': 'GENIE',
		'model': 'GR20',
		'registration_number': 'мо 956 н 123',
		'prod_year': 2016,
		'payloads': [
			'ГСМ',
			'Автошины'
		],
		'certificate_number': '51 1 2070 ',
		'weight_extra': 0,
		'volume_extra': 0,
		'weight': 30,
		'volume': 25,
		'length': 7,
		'width': 4,
		'height': 3,
		'pallets': 40,
		'risk_classes': [
			'ADR1',
			'ADR3',
			'ADR5'
		],
		'loading_types': [
			2
		],
		'osago_number': '873 73 33',
		'osago_expiry_date': '2026-07-12',
		'diagnostics_number': 'T2Z1DF69UC',
		'diagnostics_expiry_date': '2023-09-22',
		'info': 'Китайстое авто.',
		'comments': 'Haval',
		'created_at': now,
		'updated_at': now
	},
	{
		'id': 'fb2491bc-7ae6-11ed-951e-4f8266dbee86',
		'driver_id': 'e7bae7b4-7ae3-11ed-8994-13943af5ef1d',
		'cargo_id': '2285cd58-7ad7-11ed-9d18-b7e60aa3dcc7',
		'status': 1,
		'type': 'Контейнер 40фт',
		'fixtures': [
			'Аппарели',
			'Пирамида',
			'С болтами'
		],
		'brand': 'JAC',
		'model': 'HFC',
		'registration_number': 'сф 748 у 541',
		'prod_year': 2019,
		'payloads': [
			'Безалкогольные напитки',
			'Бытовая химия',
			'Вет. Препараты'
		],
		'certificate_number': '0000 000000',
		'weight_extra': 0,
		'volume_extra': 0,
		'weight': 30,
		'volume': 30,
		'length': 7,
		'width': 5,
		'height': 4,
		'pallets': 50,
		'risk_classes': [
			'Не опасный',
			'ADR1',
			'ADR2'
		],
		'loading_types': [
			1,
			2
		],
		'osago_number': '154 14 88',
		'osago_expiry_date': '2025-02-24',
		'diagnostics_number': '0000000000000000',
		'diagnostics_expiry_date': '2023-09-22',
		'info': 'Легковое авто.',
		'comments': '',
		'created_at': now,
		'updated_at': now
	},
	{
		'id': '11736384-7ae8-11ed-9a6b-5fdfc4b36327',
		'driver_id': '043b0c84-7ae4-11ed-8cea-2b631f050ef4',
		'cargoinn_id': '33b285ea-7ad7-11ed-8876-af1a703eb020',
		'status': 1,
		'type': 'Манипулятор',
		'fixtures': [
			'Аппарели',
			'Стойки',
			'С болтами',
			'Со снятием стоек'
		],
		'brand': 'IVECO',
		'model': 'Eurocargo',
		'registration_number': 'кк 541 е 478',
		'prod_year': 2017,
		'payloads': [
			'Химические продукты неопасные',
			'Трубы',
			'Табак',
			'Удобрения'
		],
		'certificate_number': '0000 000000',
		'weight_extra': 0,
		'volume_extra': 0,
		'weight': 50,
		'volume': 40,
		'length': 8,
		'width': 5,
		'height': 6,
		'pallets': 100,
		'risk_classes': [
			'ADR1',
			'ADR2',
			'ADR3',
			'ADR4',
			'ADR5'
		],
		'loading_types': [
			1,
			3
		],
		'osago_number': '263 22 94',
		'osago_expiry_date': '2024-05-23',
		'diagnostics_number': '0000000000000000',
		'diagnostics_expiry_date': '2026-09-22',
		'info': '',
		'comments': '',
		'created_at': now,
		'updated_at': now
	},
	{
		'id': '949f74f2-7aeb-11ed-85a0-9711b8cc5896',
		'driver_id': '0c5fe484-7ae4-11ed-bc53-fb65e098db93',
		'cargoinn_id': '4482a652-7ad7-11ed-9f62-cb2ef5ae9c5f',
		'status': 1,
		'type': 'Манипулятор',
		'fixtures': [
			'Аппарели',
			'Стойки',
			'С болтами',
			'Со снятием стоек'
		],
		'brand': 'IVECO',
		'model': 'Eurocargo',
		'registration_number': 'кк 541 е 478',
		'prod_year': 2017,
		'payloads': [
			'Химические продукты неопасные',
			'Трубы',
			'Табак',
			'Удобрения'
		],
		'certificate_number': '0000 000000',
		'weight_extra': 0,
		'volume_extra': 0,
		'weight': 50,
		'volume': 40,
		'length': 8,
		'width': 5,
		'height': 6,
		'pallets': 100,
		'risk_classes': [
			'ADR1',
			'ADR2',
			'ADR3',
			'ADR4',
			'ADR5'
		],
		'loading_types': [
			1,
			3
		],
		'osago_number': '263 22 94',
		'osago_expiry_date': '2024-05-23',
		'diagnostics_number': '0000000000000000',
		'diagnostics_expiry_date': '2026-09-22',
		'info': '',
		'comments': '',
		'created_at': now,
		'updated_at': now
	}
];

module.exports = { transportSeed };
