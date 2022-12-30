const now = new Date();

const adminSeed = [
	{
		'id': '455c8d34-0033-4b89-af06-e9cc99cd5d50',
		'email': 'sysadmin@mail.com',
		'phone': '+0000000000',
		'name': 'sysadmin',
		'role': 2,
		'privilege': true,
		'confirmed': true,
		'created_at': now,
		'updated_at': now
	},
	{
		'id': '042eebf4-7af1-11ed-9ed2-9bc397315583',
		'name': 'Логист',
		'phone': '+7 000 000 00 00',
		'email': 'logist@mail.com',
		'role': 0,
		'privilege': false,
		'confirmed': true,
		'created_at': now,
		'updated_at': now
	}
];

module.exports = { adminSeed };
