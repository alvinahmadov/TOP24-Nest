import {
	IAddress,
	IAdmin,
	ICargoCompany,
	ICargoInnCompany,
	IDriver, IGatewayEvent,
	IImage,
	IModel,
	IOffer,
	IOrder,
	IPayment,
	ITransport,
	IUser,
	TApiProperty
} from '@common/interfaces';

/**@ignore*/
type TCompanyAssociates = {
	user?: any;
	payment?: any;
	drivers?: any[];
	images?: any[];
	orders?: any[];
	transports?: any[];
};

/**@ignore*/
type TDriverAssociates = {
	cargo?: any;
	cargoinn?: any;
	order?: any;
	transports?: any[];
};

/**@ignore*/
type TImageAssociates = {
	readonly cargo?: any;
	readonly cargoinn?: any;
	readonly transport?: any;
};

/**@ignore*/
type TOfferAssociates = {
	order?: any;
	driver?: any;
	transports?: any[];
};

/**@ignore*/
type TOrderAssociates = {
	cargo?: any;
	cargoinn?: any;
	driver?: any;
};

/**@ignore*/
type TPaymentAssociates = {
	cargo?: any;
	cargoinn?: any;
};

/**@ignore*/
type TTransportAssociates = {
	cargo?: any;
	cargoinn?: any;
	driver?: any;
	images?: any[];
};

/**@ignore*/
type TEntityConfigList = {
	base: TApiProperty<IModel>;
	address: TApiProperty<IAddress>;
	admin: TApiProperty<IAdmin>;
	company: TApiProperty<ICargoCompany & TCompanyAssociates>;
	companyinn: TApiProperty<ICargoInnCompany & TCompanyAssociates>;
	driver: TApiProperty<IDriver & TDriverAssociates>;
	gatewayEvent: TApiProperty<IGatewayEvent>;
	image: TApiProperty<IImage & TImageAssociates>;
	offer: TApiProperty<IOffer & TOfferAssociates>;
	order: TApiProperty<IOrder & TOrderAssociates>;
	payment: TApiProperty<IPayment & TPaymentAssociates>;
	transport: TApiProperty<ITransport & TTransportAssociates>;
	user: TApiProperty<IUser>;
};

/**@ignore*/
const base: TApiProperty<IModel> = {
	id:        {
		description: 'Идентификатор объекта. В формате UUID,'
		             + ' генерируется системой автоматически.',
		example:     'afbb564b-b7ba-495d-8c66-a2020fbb80c2',
		readOnly:    true,
		required:    false,
		format:      'uuid'
	},
	createdAt: {
		description: 'Дата создания объекта. '
		             + 'Присваивается автоматически при создании.',
		example:     '2021-12-27 15:05:21.275000 +00:00',
		readOnly:    true,
		required:    false
	},
	updatedAt: {
		description: 'Дата обновления объекта. '
		             + 'Автоматически обновляется при изменениях в объекте.',
		example:     '2021-12-27 15:05:21.275000 +00:00',
		readOnly:    true,
		required:    false
	}
};

export const entityConfig: TEntityConfigList = {
	base,
	admin:
		{
			...base,
			name:      {
				description: 'Имя админа/логиста.'
				             + '',
				example:     'Иван'
			},
			email:     {
				description: 'Почтовый адрес админа/логиста.'
				             + '',
				example:     'logist.cargo@mail.com'
			},
			phone:     {
				description: 'Телефонный номер админа/логиста. '
				             + 'Нельзя потом изменять',
				examples:    [
					'+7 000 000 00 00',
					'+7 (000) 000 00 00',
					'+70000000000'
				]
			},
			role:      {
				description: 'Роль пользователя. '
				             + 'Админ хоста или логист.',
				nullable:    false,
				readOnly:    true,
				enum:        { 'LOGIST': 0, 'CARGO': 1, 'ADMIN': 2 }
			},
			confirmed: {
				description: 'Аккаунт админа/логиста подтвержден.'
				             + '',
				default:     false,
				readOnly:    true
			},
			privilege: {
				description: 'Пользователь имеет привилегии. '
				             + 'Только админ хоста имеет привилегии.',
				default:     false,
				readOnly:    true
			},
			verify:    {
				description: 'Код подтверждения при авторизации.'
				             + '',
				default:     '',
				readOnly:    true
			}
		},
	address:
		{
			...base,
			country:         {
				description: 'Значение страны.'
			},
			area:            {
				description: 'A geographic area',
				example:     'Змеиногорский'
			},
			areaType:        {
				description: 'The type of geographic area',
				examples:    ['р-н (район)']
			},
			city:            {
				description: 'Name of the city',
				example:     ['Москва', 'Казань']
			},
			cityType:        {
				description: 'Type of city',
				examples:    ['г (город)', 'п (поселок)']
			},
			region:          {
				description: 'Region of address',
				example:     'Башкортостан'
			},
			regionType:      {
				description: 'Type of region',
				examples:    ['обл', 'край', 'Респ']
			},
			settlement:      {},
			settlementType:  {},
			capitalMarker:   {},
			federalDistrict: {
				description: 'Federal district of address, if country is of federation type',
				example:     [
					'Сибирский федеральный округ',
					'Дальневосточный федеральный округ'
				]
			},
			fiasId:          { description: 'Id of address record in fias' },
			fiasLevel:       { description: 'Level in the fias' },
			kladrId:         { description: 'Id of address in KLADR.rf' },
			okato:           {
				description: 'All-Russian Classifier of Administrative-territorial '
				             + 'division objects (ОКАТО) number',
				example:     '12245501000'
			},
			oktmo:           {
				description: 'All-Russian Classifier of Municipalities (ОКТМО) number',
				example:     '12645101001'
			},
			postalCode:      {},
			taxOffice:       {},
			timezone:        {
				description: 'Timezone of address',
				example:     'UTC+3'
			},
			latitude:        { description: 'Address latitude' },
			longitude:       { description: 'Address longitude' },
			value:           {
				description: 'Getter generates full address from city, region, country and their types.',
				example:     'Россия, Респ. Татарстан, г. Казань',
				readOnly:    true
			}
		},
	company:
		{
			...base,
			userId:
				{
					description: 'Идентификатор пользователя, владеющего компанией. '
					             + 'В формате UUID',
					readOnly:    true,
					format:      'uuid'
				},
			crmId:
				{
					description: 'CRM идентификатор компании в системе Битрикс24.'
					             + '\nГенерируется автоматически в системе Битрикс24.',
					readOnly:    true
				},
			name:
				{
					description: 'Полное наименование компании',
					example:     'ООО "Борис и КО"',
					required:    true
				},
			taxpayerNumber:
				{
					description: 'Идентификационный номер налогоплательщика (ИНН) компании.' +
					             '\nсм. `inn`.',
					example:     '7707083893',
					required:    true
				},
			shortName:
				{
					description: 'Короткое название компании.' +
					             '\nсм. `shortname`.',
					example:     '"Борис и КО"',
					required:    true
				},
			email:
				{
					description: 'Почтовый электронный адрес компании.',
					example:     'amadeus.cargo@mail.com',
					required:    true,
					uniqueItems: true
				},
			type:
				{
					description: 'Тип компании. Может быть следующих значений: Юрлицо (0), ИП (1) или Физлицо (2).' +
					             '\nсм. `company_type`.',
					enum:        { ORG: 0, IE: 1, PI: 2 },
					required:    true
				},
			role:
				{
					description: 'Роль пользователя. По умолчанию ставится значение 1 для компаний.' +
					             '\nсм. `type`.',
					nullable:    false,
					readOnly:    true,
					enum:        { 'LOGIST': 0, 'CARGO': 1, 'ADMIN': 2 }
				},
			phone:
				{
					description: 'Телефонный номер компании.',
					examples:    ['+7 000 000 00 00', '+70000000000'],
					required:    true
				},
			isDefault:
				{
					description: 'Выбрана ли компания по умолчанию. '
					             + 'При выборе компании по умолчанию используются '
					             + 'данные этой компании для поиска заявок.' +
					             '\nсм. `is_default`.',
					default:     false
				},
			taxReasonCode:
				{
					description: 'Код причины постановки на учет (КПП) компании.' +
					             '\nсм. `kpp`.',
					example:     '773601001',
					required:    true
				},
			registrationNumber:
				{
					description: 'Основной государственный регистрационный номер записи о ' +
					             'создании юридического лица (ОГРН) для компании.' +
					             '\nсм. `ogpn`.',
					example:     '025850',
					required:    true
				},
			passportSerialNumber:
				{
					description: 'Серийный номер паспорта директора/владельца компании.' +
					             '\nсм. `passport_serial_number`.',
					example:     '4218 555555',
					required:    true
				},
			passportSubdivisionCode:
				{
					description: 'Код подразделения органа выдавшего паспорт.' +
					             '\nсм. `passport_subdivision_code`.',
					required:    true
				},
			passportGivenDate:
				{
					description: 'Дата выдачи паспорта.' +
					             '\nсм. `passport_date`.',
					example:     '22.09.2005',
					required:    true
				},
			passportRegistrationAddress:
				{
					description: 'Адрес регистрации в паспорте.' +
					             '\nсм. `passport_registration_address` ' +
					             'в режиме совместимости.',
					example:     'Москва, 117312, ул. Вавилова, д. 19',
					required:    true
				},
			passportIssuedBy:
				{
					description: 'Орган выдавший паспорт.' +
					             '\nсм. `passport_issued_by`.',
					example:     'УМВД России по Липецкой области'
				},
			director:
				{
					description: 'ФИО генерального директора компании. Только для юрлиц.'
				},
			directions:
				{
					description: 'Направления работы компании. Города или регионы.',
					examples:    ['Москва', 'Санкт-Петербург']
				},
			paymentType:
				{
					description: 'Тип оплаты которую принимает компания.' +
					             '\nПри регистрации использовать значение id при запросе /api/reference/payment_types' +
					             '\nсм. `nds`.',
					examples:    ['20% НДС', 'Без НДС', 'Карта']
				},
			contactPhone:
				{
					description: 'Дополнительный контактный телефон компании.' +
					             '\nсм. `phone_second`.',

					examples: ['+7 000 000 00 00', '+70000000000']
				},
			legalAddress:
				{
					description: 'Юридический адрес компании.' +
					             '\nсм. `address_first`.',
					example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
				},
			postalAddress:
				{
					description: 'Почтовый адрес компании.' +
					             '\nсм. `address_second`.',
					example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
				},
			contact:
				{
					description: 'Контактное лицо компании.' +
					             '\nсм. `contact_first`.',
					example:     'Константинопольский К. К.'
				},
			contactSecond:
				{
					description: 'Второе контактное лицо компании' +
					             '\nсм. `contact_second`.',
					example:     'Иванов И. И.'
				},
			contactThird:
				{
					description: 'Третье контактное лицо компании.' +
					             '\nсм. `contact_third`.',
					example:     'Иванов И. И.'
				},
			confirmed:
				{
					description: 'Компания прошла модерацию в Битрикс24.'
				},
			info:
				{
					description: 'Дополнительная информация о компании.'
				},
			status:
				{
					description: 'Статус компании.',
					deprecated:  true
				},
			avatarLink:
				{
					description: 'URI аватара компании. Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `avatar_link`.',
					readOnly:    true,
					format:      'url'
				},
			certificatePhotoLink:
				{
					description: 'URI сертификата компании. Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `certificate_photo_link`.',
					readOnly:    true,
					format:      'url'
				},
			passportPhotoLink:
				{
					description: 'URI фото паспорта ген. директора компании. ' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `passport_photo_link`.',
					readOnly:    true,
					format:      'url'
				},
			directorOrderPhotoLink:
				{
					description: 'URI фото о приказа назначении ген. директора компании. ' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `director_order_photo_link`.',
					readOnly:    true,
					format:      'url'
				},
			attorneySignLink:
				{
					description: 'Фото приказа о назначении гендиректора.' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `attorney_sign_link`.',
					readOnly:    true,
					format:      'url'
				},
			userPhone:
				{
					description: 'Мобильный номер телефона указанный при регистрации. ' +
					             'Используется при авторизации' +
					             'По нему пользователь может добавить несколько компаний в одну группу.'
				},
			user:
				{
					description: 'Пользователь к которому привязана компания.' +
					             '\nПри регистрации значение должно быть номером регистрации. ' +
					             'По нему пользователь может добавить несколько компаний в одну группу.'
				},
			payment:
				{
					description: 'Банковские реквизиты компании.'
					             + '',
					readOnly:    true
				},
			drivers:
				{
					description: 'Список водителей компании.'
					             + '',
					isArray:     true,
					readOnly:    true
				},
			orders:
				{
					description: 'Заказы выполненные или выполняемые водителями компании.'
					             + '',
					isArray:     true,
					readOnly:    true
				},
			transports:
				{
					description: 'Список транспортов которые принадлежат к компании'
					             + ' (Юрлицо).',
					isArray:     true,
					readOnly:    true
				}
		},
	companyinn:
		{
			...base,
			userId:
				{
					description: 'Id of user that owns the company',
					format:      'uuid'
				},
			crmId:
				{
					description: 'CRM идентификатор компании в системе Битрикс24.'
					             + '\nГенерируется автоматически в системе Битрикс24.',
					readOnly:    true
				},
			name:
				{
					description: 'Имя владельца компании (ИП/Физлицо).',
					example:     'ООО "Борис и КО"',
					required:    true
				},
			patronymic:
				{
					description: 'Отчество владельца компании (ИП/Физлицо).' +
					             '\nсм. `middle_name`.',
					example:     ['Владимирович', 'Осипович']
				},
			lastName:
				{
					description: 'Фамилия владельца компании (ИП/Физлицо).' +
					             '\nсм. `surname`.',
					examples:    ['Баширов', 'Иванов']
				},
			type:
				{
					description: 'Тип компании. Может быть следующих значений: Юрлицо (0), ИП (1) или Физлицо (2).' +
					             '\nсм. `company_type`.',
					enum:        { ORG: 0, IE: 1, PI: 2 },
					required:    true
				},
			taxpayerNumber:
				{
					description: 'Идентификационный номер налогоплательщика (ИНН) компании.' +
					             '\nсм. `inn`.',
					example:     '7707083893',
					required:    true
				},
			email:
				{
					description: 'Почтовый электронный адрес компании.'
					             + '',
					example:     'amadeus.cargo@mail.com',
					required:    true,
					uniqueItems: true
				},
			role:
				{
					description: 'Роль пользователя. По умолчанию ставится значение 1 для компаний.' +
					             '\nсм. `type`.',
					nullable:    false,
					readOnly:    true,
					enum:        { 'LOGIST': 0, 'CARGO': 1, 'ADMIN': 2 }
				},
			phone:
				{
					description: 'Телефонный номер компании.',
					examples:    ['+7 000 000 00 00', '+70000000000'],
					required:    true
				},
			isDefault:
				{
					description: 'Выбрана ли компания по умолчанию. '
					             + 'При выборе компании по умолчанию используются '
					             + 'данные этой компании для поиска заявок.' +
					             '\nсм. `is_default`.',
					default:     false
				},
			birthDate:
				{
					description: 'Дата рождения владельца компании (ИП/Физлицо).',
					example:     '2001-05-15',
					format:      'date'
				},
			passportSerialNumber:
				{
					description: 'Серийный номер паспорта директора/владельца компании.' +
					             '\nсм. `passport_serial_number`.',
					example:     '4218 555555',
					required:    true
				},
			passportSubdivisionCode:
				{
					description: 'Код подразделения органа выдавшего паспорт.' +
					             '\nсм. `passport_subdivision_code`.',
					required:    true
				},
			passportGivenDate:
				{
					description: 'Дата выдачи паспорта.' +
					             '\nсм. `passport_date`.',
					example:     '22.09.2005',
					required:    true
				},
			passportRegistrationAddress:
				{
					description: 'Адрес регистрации в паспорте.' +
					             '\nсм. `passport_registration_address`.',
					example:     'Москва, 117312, ул. Вавилова, д. 19',
					required:    true
				},
			passportIssuedBy:
				{
					description: 'Орган выдавший паспорт.' +
					             '\nсм. `passport_issued_by`.',
					example:     'УМВД России по Липецкой области'
				},
			paymentType:
				{
					description: 'Тип оплаты которую принимает компания.' +
					             '\nПри регистрации использовать значение id при запросе /api/reference/payment_types' +
					             '\nсм. `nds`.',
					examples:    ['20% НДС', 'Без НДС', 'Карта']
				},
			directions:
				{
					description: 'Направления работы компании. '
					             + 'Города или регионы.',
					examples:    ['Москва', 'Санкт-Петербург']
				},
			confirmed:
				{
					description: 'Компания прошла модерацию в Битрикс24.'
				},
			info:
				{
					description: 'Дополнительная информация о компании.'
				},
			status:
				{
					description: 'Статус компании.',
					deprecated:  true
				},
			avatarLink:
				{
					description: 'URI аватара компании. Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `avatar_link`.',
					readOnly:    true,
					format:      'url'
				},
			address:
				{
					description: 'Main address of the cargo company.',
					example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
				},
			postalAddress:
				{
					description: 'Postal address of the cargo company.',
					example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
				},
			actualAddress:
				{
					description: 'Actual address of the cargo company (Физлицо).',
					example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
				},
			contactPhone:
				{
					description: 'Contact phone number.',
					examples:    ['+7 000 000 00 00', '+70000000000']
				},
			personalPhone:
				{
					description: 'Personal phone number of company owner.',
					examples:    ['+7 000 000 00 00', '+70000000000']
				},
			passportPhotoLink:
				{
					description: 'Паспорт. Разворот. ' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `passport_photo_link`.',
					readOnly:    true,
					format:      'url'
				},
			passportSignLink:
				{
					description: 'Паспорт. Фото прописки.' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `passport_sign_link`.',
					readOnly:    true,
					format:      'url'
				},
			passportSelfieLink:
				{
					description: 'Селфи с паспортом.' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `passport_selfie_link`.',
					readOnly:    true,
					format:      'url'
				},
			userPhone:
				{
					description: 'Мобильный номер телефона указанный при регистрации. ' +
					             'Используется при авторизации' +
					             'По нему пользователь может добавить несколько компаний в одну группу.'
				},
			user:
				{
					description: 'Пользователь к которому привязана компания.' +
					             '\nПри регистрации значение должно быть номером регистрации. ' +
					             'По нему пользователь может добавить несколько компаний в одну группу.'
				},
			payment:
				{
					description: 'Банковские реквизиты компании '
					             + '(ИП/Физлицо).',
					readOnly:    true
				},
			drivers:
				{
					description: 'Список водителей компании '
					             + '(ИП/Физлицо).',
					readOnly:    true
				},
			orders:
				{
					description: 'Заказы выполненные или выполняемые водителями компании '
					             + '(ИП/Физлицо).',
					readOnly:    true
				},
			transports:
				{
					description: 'Список транспортов которые принадлежат к компании '
					             + '(ИП/Физлицо).',
					readOnly:    true
				}
		},
	driver:
		{
			...base,
			cargoId:
				{
					description: 'Идентификатор компании к которой водитель принадлежит (Юрлицо)',
					format:      'uuid',
					readOnly:    true
				},
			cargoinnId:
				{
					description: 'Идентификатор компании к которой водитель принадлежит (ИП/Физлицо)',
					format:      'uuid',
					readOnly:    true
				},
			crmId:
				{
					description: 'CRM идентификатор водителя в системе Битрикс24.'
					             + '\nГенерируется автоматически в системе Битрикс24.',
					readOnly:    true
				},
			name:
				{
					description: 'Имя водителя.',
					example:     'Дмитрий'
				},
			patronymic:
				{
					description: 'Отчество водителя компании.' +
					             '\nсм. `middle_name`.',
					example:     ['Владимирович', 'Осипович']
				},
			lastName:
				{
					description: 'Фамилия водителя компании.' +
					             '\nсм. `surname`.',
					examples:    ['Баширов', 'Иванов']
				},
			fullName:
				{
					description: 'Полное имя водителя.',
					readOnly:    true
				},
			isReady:
				{
					description: 'Готовность водителя к работе. ' +
					             'При отключении водитель исчезает с карты как доступный исполнитель.' +
					             '\nсм. `is_ready`.'
				},
			role:
				{
					description: 'Роль водителя. Не используется',
					default:     '-1',
					readOnly:    true
				},
			email:
				{
					description: 'Почтовый электронный адрес водителя компании.',
					example:     'amadeus.cargo@mail.com',
					required:    false,
					uniqueItems: false
				},
			birthDate:
				{
					description: 'Дата рождения водителя компании.' +
					             '\nсм. `date_of_birth`.',
					example:     '2001-05-15',
					format:      'date'
				},
			passportSerialNumber:
				{
					description: 'Серийный номер паспорта водителя компании.' +
					             '\nсм. `passport_serial_number`.',
					example:     '4218 555555',
					required:    true
				},
			passportSubdivisionCode:
				{
					description: 'Код подразделения органа выдавшего паспорт.' +
					             '\nсм. `passport_subdivision_code`.',
					required:    true
				},
			passportGivenDate:
				{
					description: 'Дата выдачи паспорта.' +
					             '\nсм. `passport_date`.',
					example:     '2005-09-22',
					format:      'date',
					required:    true
				},
			passportRegistrationAddress:
				{
					description: 'Адрес регистрации в паспорте.' +
					             '\nсм. `passport_registration_address`',
					example:     'Москва, 117312, ул. Вавилова, д. 19',
					format:      'string',
					required:    true
				},
			passportIssuedBy:
				{
					description: 'Орган выдавший паспорт.' +
					             '\nсм. `passport_issued_by`.',
					example:     'УМВД России по Липецкой области'
				},
			phone:
				{
					description: 'Телефонный номер водителя компании.',
					examples:    ['+7 123 456 78 90', '+71234567890']
				},
			taxpayerNumber:
				{
					description: 'Идентификационный номер налогоплательщика (ИНН) водителя.' +
					             '\nсм. `inn`.',
					example:     '7707083893'
				},
			registrationAddress:
				{
					description: 'Адрес регистрации водителя.' +
					             '\nсм. `registration_address`.',
					example:     'Москва, 117312, ул. Вавилова, д. 19'
				},
			status:
				{
					description: 'Статус водителя. Имеет значения "на пути", "на месте", "загрузка документов".' +
					             'Во время выполнения МП меняет его значение в зависимости от геопараметров.',
					enum:        {
						'NONE':     0,
						'ON_WAY':   1,
						'ON_POINT': 2,
						'DOC_LOAD': 3
					}
				},
			licenseNumber:
				{
					description: 'Серийный номер водительского удостоверения.' +
					             '\nсм. `license`',
					examples:    ['12 34 567890', '1234567890']
				},
			licenseDate:
				{
					description: 'Конечная дата действительности водительского удостоверения.' +
					             '\nсм. `license_date`.',
					example:     '2019-09-22',
					format:      'date'
				},
			address:
				{
					description: 'Адрес фактического проживания водителя.' +
					             '\nсм. `physical_address`.',
					example:     'Москва, 117312, ул. Вавилова, д. 19 '
				},
			phoneSecond:
				{
					description: 'Дополнительный телефон водителя компании.' +
					             '\nсм. `phone_second`.',
					examples:    ['+7 123 456 78 90', '+71234567890', '71234567890']
				},
			latitude:
				{
					description: 'Географическая широта местонахождения водителя.',
					format:      'float',
					example:     37.617617
				},
			longitude:
				{
					description: 'Географическая долгота местонахождения водителя.',
					format:      'float',
					example:     55.755799
				},
			currentPoint:
				{
					description: 'Текущая точка на карте исполнения заказа. '
					             + 'Определяется водительским приложением.' +
					             '\nсм. `current_point`.'
				},
			currentAddress:
				{
					description: 'Текущий адрес карте исполнения заказа. ' +
					             'Определяется бекэндом на основе значений `longitude` и `latitude`.' +
					             '\nсм. `current_address`.',
					readOnly:    true
				},
			operation:
				{
					description: 'Данные об операции выполняемый водителем. '
					             + 'Поля `loaded`, `unloaded`'
				},
			payloadCity:
				{
					description: 'Город разгрузки догруза.' +
					             '\nсм. `payload_city`.'
				},
			payloadRegion:
				{
					description: 'Регион разгрузки догруза.' +
					             '\nсм. `payload_region`.'
				},
			payloadDate:
				{
					description: 'Дата разгрузки догруза.' +
					             '\nсм. `payload_date`.'
				},
			avatarLink:
				{
					description: 'URI аватара водителя' +
					             '\nсм. `avatar_link`.',
					readOnly:    true
				},
			licenseFrontLink:
				{
					description: 'Передняя фото водительского удостоверения (URI).' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `link_front`.',
					readOnly:    true,
					format:      'url'
				},
			licenseBackLink:
				{
					description: 'Задняя фото водительского удостоверения (URI).' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `link_back`.',
					readOnly:    true,
					format:      'url'
				},
			passportPhotoLink:
				{
					description: 'Паспорт. Разворот. ' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `passport_photo_link`.',
					readOnly:    true,
					format:      'url'
				},
			passportSignLink:
				{
					description: 'Паспорт. Фото прописки.' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `passport_sign_link`.',
					readOnly:    true,
					format:      'url'
				},
			passportSelfieLink:
				{
					description: 'Селфи с паспортом.' +
					             'Менять значение можно только по соответствующим запросам.' +
					             '\nсм. `passport_selfie_link`.',
					readOnly:    true,
					format:      'url'
				},
			info:
				{
					description: 'Дополнительная информация о водителе',
					example:     'Работаю только с пн. до пт. от 09:00 до 18:00. В другое время не беспокоить'
				},
			cargo:
				{
					description: 'Компания к которой принадлежит водитель. (Юрлицо)'
					             + 'Получается при `?full=true`',
					readOnly:    true
				},
			order:
				{
					description: 'Выполняемый заказ водителем'
					             + 'Получается при `?full=true`',
					readOnly:    true
				},
			cargoinn:
				{
					description: 'Компания к которой принадлежит водитель (ИП/Физлицо). '
					             + 'Получается при `?full=true`',
					readOnly:    true
				},
			transports:
				{
					description: 'Список транспортов водителя. Получается при `?full=true`',
					isArray:     true,
					readOnly:    true
				}
		},
	gatewayEvent:
		{
			...base,
			eventData: {},
			eventName: {},
			source:    {},
			hasSeen:   {},
			message:   {}
		},
	image:
		{
			...base,
			cargoId:
				{
					description: 'Идентификатор компании к транспорту которой принадлежит фото.'
					             + ' (Юрлицо)',
					format:      'uuid'
				},
			cargoinnId:
				{
					description: 'Идентификатор компании к транспорту которой принадлежит фото. '
					             + '(ИП/Физлицо)',
					format:      'uuid'
				},
			transportId:
				{
					description: 'Идентификатор транспорта к которой принадлежит фото. '
					             + '',
					format:      'uuid'
				},
			url:
				{
					description: 'Ссылка на сетевое хранилище ранее загруженного фото.' +
					             'Менять значение можно только по соответствующим запросам.',
					readOnly:    true,
					format:      'url'
				},
			cargo:
				{ readOnly: true },
			cargoinn:
				{ readOnly: true },
			transport:
				{ readOnly: true }
		},
	offer:
		{
			...base,
			orderId:
				{
					description: 'Идентификатор предложенного заказа на выполнение.'
					             + '',
					format:      'uuid',
					required:    true
				},
			driverId:
				{
					description: 'Идентификатор водителя к которому предложена заказ на'
					             + ' выполнение.',
					required:    true,
					format:      'uuid'
				},
			status:
				{
					description: 'Статус предложения. Определяется как логистом так и водителем.'
					             + '',
					enum:        {
						'NONE':      0,
						'SENT':      1,
						'SEEN':      2,
						'RESPONDED': 3,
						'DECLINED':  4,
						'CANCELLED': 5,
						'NO_MATCH':  6
					},
					required:    true,
					format:      'integer'
				},
			orderStatus:
				{
					description: 'Статус заказа.'
					             + 'После выбора логистом водителя на заказ статус заказа меняется '
					             + 'глобально для других водителей, к которым она была предложена.',
					required:    true,
					enum:        {
						'PENDING':          0,
						'ACCEPTED':         1,
						'PROCESSING':       2,
						'CANCELLED':        3,
						'FINISHED':         4,
						'CANCELLED_BITRIX': 5
					}
				},
			bidComment:
				{
					description: 'Комментарий к торгу.'
					             + '',
					nullable:    true
				},
			bidPrice:
				{
					description: 'Цена торга (без НДС)'
					             + '',
					format:      'integer',
					nullable:    true
				},
			bidPriceVat:
				{
					description: 'Цена торга (с НДС)'
					             + '',
					format:      'integer',
					nullable:    true
				},
			order:
				{
					description: 'Предложенный заказ.'
					             + '',
					readOnly:    true
				},
			driver:
				{
					description: 'Водитель к которому предложили заказ.'
					             + '',
					readOnly:    true
				},
			transports:
				{
					description: 'Идентификатор транспот выбранный водителем по умолчанию '
					             + 'подходящий под заказ.',
					readOnly:    true
				}
		},
	order:
		{
			...base,
			cargoId:           {
				description: 'Id of cargo company.',
				format:      'uuid'
			},
			cargoinnId:        {
				description: 'Id of cargo company (private).',
				format:      'uuid'
			},
			driverId:          {
				description: 'Id of driver assigned to the order.',
				format:      'uuid'
			},
			crmId:             {
				description: 'Идентификатор заказа на Битрикс24.\n'
				             + 'см. `crm_id`'
			},
			title:             {
				description: 'Заголовок заказа.'
				             + '',
				example:     'Сделка #01'
			},
			price:             {
				description: 'Price of order for payment to driver.',
				example:     '10.000|RUB'
			},
			date:              {
				description: 'Дата создания заказа в системе Битрикс24.'
				             + '\nсм. `dateAt`',
				format:      'date'
			},
			status:            {
				description: 'Статус заказа',
				enum:        {
					'PENDING':          0,
					'ACCEPTED':         1,
					'PROCESSING':       2,
					'CANCELLED':        3,
					'FINISHED':         4,
					'CANCELLED_BITRIX': 5
				},
				required:    true
			},
			stage:             {
				description: 'Стадия выполнения заказа.\n' +
				             'По ней можно например понять, что договор с водителем подписан (зн. 4).\n'
				             + 'Заказы появляются в системе если мин. значение = 2',
				enum:        {
					'NEW':              0,
					'PREPARATION':      1,
					'AGREED_LOGIST':    2,
					'AGREED_OWNER':     3,
					'SIGNED_DRIVER':    4,
					'SIGNED_OWNER':     5,
					'CARRYING':         6,
					'HAS_PROBLEM':      7,
					'CONTINUE':         8,
					'DELIVERED':        9,
					'DOCUMENT_SENT':    10,
					'PAYMENT_FORMED':   11,
					'PAYMENT_RECEIVED': 12,
					'FINISHED':         13
				}
			},
			dedicated:         {
				description: 'Выделенная машина или догруз',
				example:     'Не важно',
				enum:        ['Выделенная машина', 'Догруз', 'Не важно']
			},
			weight:            {
				description: 'Вес груза (т).',
				format:      'float'
			},
			volume:            {
				description: 'Обьём груза (куб. м).',
				format:      'float'
			},
			length:            {
				description: 'Длина груза (м).',
				format:      'float'
			},
			height:            {
				description: 'Высота груза (м).',
				format:      'float'
			},
			width:             {
				description: 'Ширина груза (м).',
				format:      'float'
			},
			number:            { description: 'Номер заказа.' },
			mileage:           { description: '' },
			pallets:           {
				description: 'Количество паллет требуемая грузом.'
				             + '\nсм. `palets`',
				format:      'integer'
			},
			loadingTypes:      {
				description: 'Требуемые типы загрузок авто для заказа.'
				             + '\nсм. `loading_types`',
				enum:        {
					'Задняя':  1,
					'Верхняя': 2,
					'Боковая': 3
				}
			},
			transportTypes:    {
				description: 'Требуемые типы авто для заказа.'
				             + '\nсм. `transport_types`'
			},
			isOpen:            {
				description: 'Заказ открытая для взятия.'
				             + '\nсм. `is_open`'
			},
			isFree:            {
				description: 'Заказ доступна.'
				             + '\nсм. `is_free`'
			},
			isCanceled:        {
				description: 'Отмена логистом.'
				             + '\nсм. `is_cancel`'
			},
			isBid:             {
				description: 'Торг доступен.'
				             + '\nсм. `is_bid`'
			},
			hasProblem:        {
				description: 'Появились проблемы при выполнении заказа.'
				             + '\nсм. `has_problem`'
			},
			cancelCause:       { description: 'Причина отказа.\nсм. `cancel_cause`' },
			payload:           {
				description: 'Тип груза',
				examples:    ['Бумага', 'Алкогольные напитки']
			},
			payloadRiskType:   {
				description: 'Класс опасности груза.'
				             + '\nсм. `payload_type`',
				examples:    ['Не опасный', 'ADR1']
			},
			paymentType:       {
				description: 'Тип оплаты для заказа.'
				             + '\nсм. `payment_type`',
				examples:    ['НДС 20%', 'Без НДС', 'Карта', 'Наличными']
			},
			bidInfo:           {
				description: 'Комментарий насчет торга.'
				             + '\nсм. `bid_info`'
			},
			bidPrice:          {
				description: 'Предлагаемая цена торга (без НДС).'
				             + '\nсм. `bid_price`',
				example:     '15000',
				format:      'float'
			},
			bidPriceVat:       {
				description: 'Предлагаемая цена торга (с НДС).'
				             + '\nсм. `bid_price_max`',
				example:     '18000',
				format:      'float'
			},
			onPayment:         {
				description: 'Статус заказа на оплате.\nсм. `on_payment`',
				default:     false
			},
			destinations:      {
				description: 'Массив точек назначения для исполнения заказа.'
				             + ''
			},
			filter:            {
				description: 'Поисковый фильтр для заказа.'
				             + ''
			},
			priority:          {
				description: 'Приоритетность заказа для выполнения по близости даты начала исполнения.'
				             + ''
			},
			driverDeferralConditions:
			                   {
				                   description: 'Условия отсрочки водителя.'
				                                + '\nсм. `driver_deferral_conditions`'
			                   },
			ownerDeferralConditions:
			                   {
				                   description: 'Условия отсрочки грузовладельца.'
				                                + '\nсм. `owner_deferral_conditions`'
			                   },
			paymentPhotoLinks: {
				description: 'Ссылка на фото счета оплаты. Множественный файл.\n' +
				             'Менять значение можно только по соответствующим запросам.'
				             + '\nсм. `payment_link`',
				format:      'url'
			},
			receiptPhotoLinks: {
				description: 'Ссылка на фото квитанции об отправке документов. Множественный файл.\n' +
				             'Менять значение можно только по соответствующим запросам.'
				             + '\nсм. `receipt_link`',
				format:      'url'
			},
			contractPhotoLink: {
				description: 'Ссылка на фото подписанного договора.\n' +
				             'Менять значение можно только по соответствующим запросам.'
				             + '\nсм. `contract_link`',
				format:      'url'
			},
			cargo:             {
				description: 'Cargo company which order is assigned to',
				readOnly:    true
			},
			cargoinn:          {
				description: 'Cargo company (individual/private) which order is assigned to',
				readOnly:    true
			},
			driver:            {
				description: 'Cargo company driver which order is assigned to',
				readOnly:    true
			}
		},
	payment:
		{
			...base,
			cargoId:
				{
					description: 'Id of cargo company for payments.',
					format:      'uuid'
				},
			cargoinnId:
				{
					description: 'Id of individual cargo company for payments.',
					format:      'uuid',
					example:     ''
				},
			correspondentAccount:
				{
					description: 'Номер корреспондентского счета в банке.'
					             + '\nсм. `ks`',
					example:     '30101643600000000957'
				},
			currentAccount:
				{
					description: 'Номер рассчетного счета в банке.'
					             + '\nсм. `rs`',
					example:     '40817810099910004312'
				},
			ogrnip:
				{
					description: 'ОГРНИП',
					example:     '321244848332114'
				},
			ogrnipPhotoLink:
				{
					description: 'Ссылка на фото ОГРНИП.'
					             + '\nсм. `ogrnip_link`',
					format:      'url'
				},
			bankName:
				{
					description: 'Имя банка.\nсм. `bank`',
					example:     'ПАО "Сбербанк"'
				},
			bankBic:
				{
					description: 'Банковский идентификационный код (БИК).'
					             + '\nсм. `bankbik`',
					example:     '869049586'
				},
			info:
				{
					description: 'Дополнительная информация о банковских реквизитах компании.'
					             + ''
				},
			cargo:
				{
					description: 'Компания (Юрлицо).',
					readOnly:    true
				},
			cargoinn:
				{
					description: 'Компания (ИП/Физлицо).',
					readOnly:    true
				}
		},
	transport:
		{
			...base,
			crmId:
				{
					description: 'Идентификационный номер crm в Битрикс24.'
					             + '',
					format:      'integer'
				},
			cargoId:
				{
					description: 'Id компании (Юрлицо) к которой принадлежит транспорт.'
					             + '',
					format:      'uuid'
				},
			cargoinnId:
				{
					description: 'Id компании (ИП/Физлицо) к которой принадлежит транспорт.'
					             + '',
					format:      'uuid'
				},
			driverId:
				{
					description: 'Id водителя к которому принадлежит транспорт.'
					             + '',
					required:    true,
					format:      'uuid'
				},
			status:
				{
					description: 'Статус транспорта.'
					             + '',
					enum:        {
						'NONE':        0,
						'ACTIVE':      1,
						'HAS_PROBLEM': 2
					}
				},
			comments:
				{
					description: 'Комментарии о транспорте.'
					             + ''
				},
			diagnosticsNumber:
				{
					description: 'Номер диагностической карты транспорта.'
					             + '\nсм. `diag_num`'
				},
			diagnosticsExpiryDate:
				{
					description: 'Дата истечения действительности диагностической карты транспорта'
					             + '\nсм. `diag_date`',
					format:      'date',
					example:     '2030-05-09'
				},
			diagnosticsPhotoLink:
				{
					description: 'Ссылка на фото сертификата диагностической карты транспорта.' +
					             'Менять значение можно только по соответствующим запросам.'
					             + '\nсм. `diag_link`',
					readOnly:    true
				},
			info:
				{ description: 'Доп. инфо о транспорте.' },
			volumeExtra:
				{
					description: 'Свободный объем в транспорте для взятия догруза.'
					             + '\nсм. `volume_extra`',
					format:      'float'
				},
			weightExtra:
				{
					description: 'Свободный вес в транспорте для взятия догруза.'
					             + '\nсм. `weight_extra`',
					format:      'float'
				},
			volume:
				{
					description: 'Макс. объем груза, который транспорт может вести.',
					format:      'float'
				},
			weight:
				{
					description: 'Макс. вес груза, который транспорт может вести.',
					format:      'float'
				},
			length:
				{
					description: 'Макс. длина груза, который транспорт может вести.',
					format:      'float'
				},
			width:
				{
					description: 'Макс. ширина груза, который транспорт может вести.',
					format:      'float'
				},
			height:
				{
					description: 'Макс. высота груза, который транспорт может вести.',
					format:      'float'
				},
			loadingTypes:
				{
					description: 'Типы загрузки транспорта.',
					isArray:     true
				},
			brand:
				{
					description: 'Brand of the transport producer.',
					examples:    ['Scania', 'Dasan', 'Dogan Yildiz', 'Daewoo']
				},
			model:
				{
					description: 'Model of the transport.',
					example:     'R 730 V8 6x2'
				},
			osagoNumber:
				{
					description: 'Certificate number of Compulsory insurance '
					             + 'of civil liability of vehicle owners (ОСАГО).'
				},
			osagoExpiryDate:
				{
					description: 'ОСАГО транспорта.\nсм. `osago_date`'
				},
			osagoPhotoLink:
				{
					description: 'Link to the photo of OSAGO certificate.',
					format:      'url'
				},
			payload:
				{
					description: 'Тип груза для транспорта.',
					example:     ['Бумага', 'ГСМ']
				},
			payloadExtra:
				{
					description: 'Транспорт берет только догрузы. '
					             + 'Значение автоматически меняется в зависимости от '
					             + 'параметров `volumeExtra` и `weightExtra` и обратное от `isDedicated`.'
					             + '\nсм.`payload_extra`'
				},
			isTrailer:
				{ description: 'Транспорт является прицепом.\nсм. `is_trailer`' },
			isDedicated:
				{
					description: 'Транспорт выделен только для одного заказа. Обратное от `payloadExtra`.'
					             + '\nсм. `is_dedicated`.'
				},
			pallets:
				{
					description: 'Макс количество паллет груза который может нести транспорт.'
					             + '\nсм. `polets`',
					required:    false,
					format:      'integer'
				},
			prodYear:
				{
					description: 'Год производства транспорта.'
					             + '\nсм. `prod_year`',
					format:      'integer',
					examples:    [2012, 2015]
				},
			registrationNumber:
				{
					description: 'Регистрационный номер транспорта.'
					             + '\nсм. `registr_num`',
					example:     'но 181 к 881'
				},
			certificateNumber:
				{
					description: 'Номер сертификата регистрации транспорта.'
					             + '\nсм. `sts`',
					example:     '8 181 81 881'
				},
			riskClasses:
				{
					description: 'Классы опасности груза который транспорт может работать.'
					             + '\nсм. `risk_classes`',
					isArray:     true
				},
			type:
				{
					description: 'Тип транспорта.',
					examples:    ['Тентованный', 'Контейнер 40фт']
				},
			fixtures:
				{
					description: 'Дополнительные приспособления транспорта.'
					             + '\nсм. `extra_fixtures`',
					isArray:     true,
					examples:    ['Аппарели', 'Без ворот', 'Со снятием стоек']
				},
			cargo:
				{
					description: 'Cargo company that transport belongs to.',
					readOnly:    true
				},
			cargoinn:
				{
					description: 'Cargo company (INN) that transport belongs to.',
					readOnly:    true
				},
			driver:
				{
					description: 'Driver of the transport',
					readOnly:    true
				},
			images:
				{
					description: 'List of transport images.',
					readOnly:    true
				}
		},
	user:
		{
			...base,
			phone:  {
				description: 'Уникальный номер телефона для регистрации '
				             + 'пользователя и его/ее компаний.'
			},
			role:   {
				description: 'User role.',
				nullable:    false,
				readOnly:    true,
				enum:        { 'LOGIST': 0, 'CARGO': 1, 'ADMIN': 2 }
			},
			verify: {
				description: 'Registration verification code.',
				example:     '1234'
			}
		}
};

/**@ignore*/
export default entityConfig;
