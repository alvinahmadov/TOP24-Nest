import {
	IAddress,
	IAdmin,
	ICargoCompany,
	ICargoInnCompany,
	IDriver,
	IImage,
	IModel,
	IOffer,
	IOrder,
	IPayment,
	ITransport,
	TApiProperty
} from '@common/interfaces';

/**@ignore*/
type TCompanyAssociates = {
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
	image: TApiProperty<IImage & TImageAssociates>;
	offer: TApiProperty<IOffer & TOfferAssociates>;
	order: TApiProperty<IOrder & TOrderAssociates>;
	payment: TApiProperty<IPayment & TPaymentAssociates>;
	transport: TApiProperty<ITransport & TTransportAssociates>;
};

/**@ignore*/
const base: TApiProperty<IModel> = {
	id:        {
		description: 'Id of entity',
		example:     'afbb564b-b7ba-495d-8c66-a2020fbb80c2',
		readOnly:    true,
		required:    false,
		format:      'uuid'
	},
	createdAt: {
		description: 'Timestamp of creation of entity. Automatic when entity created.',
		example:     '2021-12-27 15:05:21.275000 +00:00',
		readOnly:    true,
		required:    false
	},
	updatedAt: {
		description: 'Timestamp of entity update. Automatic when entity changed.',
		example:     '2021-12-27 15:05:21.275000 +00:00',
		readOnly:    true,
		required:    false
	}
};

export const entityConfig: TEntityConfigList = {
	base,
	admin:      {
		...base,
		name:      {
			description: 'Admin name.',
			example:     'Иван'
		},
		email:     {
			description: 'Admin email.',
			example:     'logist.cargo@mail.com'
		},
		phone:     {
			description: 'Admin phone number.',
			examples:    ['+7 000 000 00 00', '+7 (000) 000 00 00', '+70000000000']
		},
		role:      {
			description: 'Admin role.',
			nullable:    false,
			readOnly:    true,
			enum:        { 'LOGIST': 0, 'CARGO': 1, 'ADMIN': 2 }
		},
		confirmed: {
			description: 'Admin confirmed registration.',
			default:     false,
			readOnly:    true
		},
		privilege: {
			description: 'Admin has privilege as super admin.',
			default:     false,
			readOnly:    true
		},
		verify:    {
			description: 'Verificaton code to complete registration.',
			default:     '',
			readOnly:    true
		}
	},
	address:    {
		...base,
		country:         {
			description: 'Country of address'
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
	company:    {
		...base,
		crmId:          {
			description: 'CRM id of company from bitrix server.'
		},
		name:           {
			description: 'Full name of the cargo company.',
			example:     'ООО "Борис и КО"'
		},
		taxpayerNumber: {
			description: 'Taxpayer Identification Number for the cargo company.',
			example:     '7707083893'
		},
		shortName:      {
			description: 'Short name of the cargo company.',
			example:     '"Борис и КО"'
		},
		email:          {
			description: 'Official email of cargo company.',
			example:     'amadeus.cargo@mail.com'
		},
		type:           {
			description: 'Type of company',
			enum:        { ORG: 0, IE: 1, PI: 2 },
			enumName:    'CompanyType'
		},
		role:           {
			description: 'User role.',
			nullable:    false,
			readOnly:    true,
			enum:        { 'LOGIST': 0, 'CARGO': 1, 'ADMIN': 2 }
		},
		phone:          {
			description: 'Phone number of cargo company.',
			examples:    ['+7 000 000 00 00', '+70000000000']
		},
		taxReasonCode:  {
			description: 'Tax Registration Reason Code for the cargo company.',
			example:     '773601001'
		},
		registrationNumber:
		                {
			                description: 'The body of state fire supervision code (ОГРН).',
			                example:     '025850'
		                },
		passportSerialNumber:
		                {
			                description: 'Passport Serial Number.',
			                example:     '4218 555555'
		                },
		passportSubdivisionCode:
		                {
			                description: 'Code of subdivision of passport given place.'
		                },
		passportGivenDate:
		                {
			                description: 'Passport given date.',
			                example:     '22.09.2005'
		                },
		passportRegistrationAddress:
		                {
			                description: 'Given address in the passport.',
			                example:     'Москва, 117312, ул. Вавилова, д. 19'
		                },
		passportIssuedBy:
		                {
			                description: 'Passport given place.',
			                example:     'УМВД России по Липецкой области'
		                },
		director:       {
			description: 'Name of the CEO of the cargo company.'
		},
		directions:     {
			description: 'Directions where cargo company can work.',
			examples:    ['Москва', 'Санкт-Петербург']
		},
		paymentType:    {
			description: 'Payment type that company accepts.',
			examples:    ['20% НДС', 'Без НДС', 'Карта']
		},
		contactPhone:   {
			description: 'Second additional contact phone number',
			examples:    ['+7 000 000 00 00', '+70000000000']
		},
		legalAddress:   {
			description: 'Legal address of the cargo company.',
			example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
		},
		postalAddress:  {
			description: 'Postal address of the cargo company.',
			example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
		},
		contact:        {
			description: 'Main contact data of the cargo company.',
			example:     'Константинопольский К. К.'
		},
		contactSecond:  {
			description: '2nd additional contact data of the cargo company.',
			example:     'Иванов И. И.'
		},
		contactThird:   {
			description: '3rd additional contact data of the cargo company.',
			example:     'Иванов И. И.'
		},
		confirmed:      {
			description: 'Cargo company completed registration.'
		},
		verify:         {
			description: 'Registration verification code.',
			example:     '1234'
		},
		info:           {
			description: 'Additional information about cargo company'
		},
		status:         {
			description: 'Status of cargo company.'
		},
		avatarLink:     {
			description: 'Avatar image link.'
		},
		certificatePhotoLink:
		                {
			                description: 'Link to photo of certificate of cargo company.'
		                },
		passportPhotoLink:
		                {
			                description: 'Link to photo of CEO\'s passport'
		                },
		directorOrderPhotoLink:
		                {
			                description: 'Link to photo of director\'s order'
		                },
		attorneySignLink:
		                {
			                description: 'Link to photo of attorney sign'
		                },
		payment:        {
			description: 'List of associated payment data of the cargo company.',
			readOnly:    true
		},
		drivers:        {
			description: 'List of associated drivers of the cargo company.',
			readOnly:    true
		},
		images:         {
			description: 'List of associated images of the cargo company.',
			readOnly:    true
		},
		orders:         {
			description: 'List of associated orders of the cargo company.',
			readOnly:    true
		},
		transports:     {
			description: 'List of associated transport vehicles of the cargo company.',
			readOnly:    true
		}
	},
	companyinn: {
		...base,
		name:               {
			description: 'Full name of the cargo company.',
			example:     'ООО "Борис и КО"'
		},
		patronymic:         {
			description: 'Middlename of individual cargo company owner.',
			example:     ['Vladimirovych', 'Осипович']
		},
		lastName:           {
			description: 'Lastname of individual cargo company owner.',
			examples:    ['Boshirov', 'Иванов']
		},
		type:               {
			description: 'Type of company',
			enum:        { ORG: 0, IE: 1, PI: 2 },
			enumName:    'CompanyType'
		},
		role:               {
			description: 'User role.',
			nullable:    false,
			readOnly:    true,
			enum:        { 'LOGIST': 0, 'CARGO': 1, 'ADMIN': 2 }
		},
		taxpayerNumber:     {
			description: 'Taxpayer Identification Number for the cargo company (ИНН).',
			example:     '7707083893'
		},
		phone:              {
			description: 'Phone number of cargo company.',
			example:     ['+7 000 000 00 00', '+70000000000']
		},
		email:              {
			description: 'Official email of cargo company.',
			example:     'amadeus.cargo@mail.com'
		},
		crmId:              {
			description: 'CRM id of company from bitrix server.'
		},
		birthDate:          {
			description: 'Cargo company\'s individual owner\'s date of birth.',
			example:     '22.09.2001'
		},
		passportSerialNumber:
		                    {
			                    description: 'Passport Serial Number.',
			                    example:     '4218 555555'
		                    },
		passportSubdivisionCode:
		                    {
			                    description: 'Code of subdivision of passport given place.'
		                    },
		passportGivenDate:
		                    {
			                    description: 'Passport given date.',
			                    example:     '22.09.2005'
		                    },
		passportRegistrationAddress:
		                    {
			                    description: 'Given address in the passport.',
			                    example:     'Москва, 117312, ул. Вавилова, д. 19'
		                    },
		passportIssuedBy:
		                    {
			                    description: 'Passport given place.',
			                    example:     'УМВД России по Липецкой области'
		                    },
		paymentType:        {
			description: 'Payment type that company accepts.',
			examples:    ['20% НДС', 'Без НДС', 'Карта']
		},
		directions:         {
			description: 'Directions where cargo company can work.',
			examples:    ['Москва', 'Санкт-Петербург']
		},
		info:               {
			description: 'Additional information about cargo company'
		},
		status:             {
			description: 'Status of cargo company.'
		},
		confirmed:          {
			description: 'Cargo company completed registration.'
		},
		verify:             {
			description: 'Verificaton code to complete registration.',
			default:     '',
			readOnly:    true
		},
		address:            {
			description: 'Main address of the cargo company.',
			example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
		},
		postalAddress:      {
			description: 'Postal address of the cargo company.',
			example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
		},
		actualAddress:      {
			description: 'Actual address of the cargo company (Физлицо).',
			example:     'Россия, Москва, 117312, ул. Вавилова, д. 19'
		},
		contactPhone:       {
			description: 'Contact phone number.',
			examples:    ['+7 000 000 00 00', '+70000000000']
		},
		personalPhone:      {
			description: 'Personal phone number of company owner.',
			examples:    ['+7 000 000 00 00', '+70000000000']
		},
		avatarLink:         {
			description: 'Avatar image link.'
		},
		passportPhotoLink:  {
			description: 'Link to photo of passport'
		},
		passportSignLink:   { description: 'Passport sign image link.' },
		passportSelfieLink: {
			description: 'Selfie with passport image link.'
		},
		payment:            {
			description: 'List of associated payment data of the cargo company.',
			readOnly:    true
		},
		drivers:            {
			description: 'List of associated drivers of the cargo company.',
			readOnly:    true
		},
		images:             {
			description: 'List of associated images of the cargo company.',
			readOnly:    true
		},
		orders:             {
			description: 'List of associated orders of the cargo company.',
			readOnly:    true
		},
		transports:         {
			description: 'List of associated transport vehicles of the cargo company.',
			readOnly:    true
		}
	},
	driver:     {
		...base,
		cargoId:             {
			description: 'Id of cargo company which driver is assigned.'
		},
		cargoinnId:          {
			description: 'Id of cargo company (individual) which driver is assigned.'
		},
		crmId:               {
			description: 'CRM id of driver in bitrix service.'
		},
		name:                {
			description: 'Name of the driver.',
			example:     'Дмитрий'
		},
		patronymic:          {
			description: 'Patronymic of the driver.',
			example:     'Сергеевич'
		},
		lastName:            {
			description: 'Lastname of the driver.',
			example:     'Иванов'
		},
		fullName:            {},
		isReady:             { description: 'Readiness of driver to transport cargo.' },
		role:                { description: 'Role of driver', default: '-1', readOnly: true },
		email:               {
			description: 'Additional email of cargo company driver.',
			example:     'test@example.com'
		},
		birthDate:           {
			description: 'Date of birth of the driver.',
			example:     '12.04.1990'
		},
		passportDate:        {
			description: 'Passport given date.',
			example:     '22.09.2019'
		},
		passportIssuedBy:    {
			description: 'Passport given place.',
			example:     'УМВД России по Липецкой области'
		},
		passportSerialNumber:
		                     {
			                     description: 'Passport Serial Number.',
			                     example:     '4218 555555'
		                     },
		passportSubdivisionCode:
		                     {
			                     description: 'Passport given place\'s subdivision code.',
			                     example:     'УМВД России по Липецкой области'
		                     },
		passportRegistrationAddress:
		                     {
			                     description: 'Given address in the passport.',
			                     example:     'Москва, 117312, ул. Вавилова, д. 19'
		                     },
		phone:               {
			description: 'Phone number of driver.',
			examples:    ['+7 123 456 78 90', '+71234567890', '71234567890']
		},
		taxpayerNumber:      {
			description: 'Taxpayer identification number (ИНН)'
		},
		registrationAddress: {
			description: 'Registration address of driver.',
			example:     'Москва, 117312, ул. Вавилова, д. 19'
		},
		status:              {
			description: 'Status of driver for order fulfillment.'
		},
		licenseNumber:       {
			description: 'Cargo company driver\'s license serial number.',
			examples:    ['12 34 567890', '1234567890']
		},
		licenseDate:         {
			description: 'Driver license given date.',
			example:     '22.09.2019'
		},
		address:             {
			description: 'Physical address of driver.',
			example:     'Москва, 117312, ул. Вавилова, д. 19 '
		},
		phoneSecond:         {
			description: 'Additional phone number of cargo company driver.',
			examples:    ['+7 123 456 78 90', '+71234567890', '71234567890']
		},
		latitude:            {
			description: 'Latitude of driver coordinates.',
			example:     37.617617
		},
		longitude:           {
			description: 'Longitude of driver coordinates.',
			example:     55.755799
		},
		currentPoint:        {
			description: 'Destination point for driver for order implementation.'
		},
		currentAddress:      {
			description: 'Current address of location of the driver. '
			             + 'Null when driver doesn\'t have an active order',
			readOnly:    true
		},
		operation:           {
			description: 'Operational data for mobile use.'
		},
		payloadCity:         { description: 'City for unloading of additional payload.' },
		payloadRegion:       { description: 'Region for unloading of additional payload.' },
		payloadDate:         { description: 'Date for unloading of additional payload.' },
		avatarLink:          { description: 'Avatar image link.' },
		licenseFrontLink:    { description: 'Driver license front scan image link.' },
		licenseBackLink:     { description: 'Driver license back scan image link.' },
		passportPhotoLink:   { description: 'Passport image link.' },
		passportSignLink:    { description: 'Passport sign image link.' },
		passportSelfieLink:  { description: 'Selfie with passport image link.' },
		info:                {
			description: 'Additional information about cargo company driver.',
			example:     'Работаю только с пн. до пт. от 09:00 до 18:00. В другое время не беспокоить'
		},
		cargo:               {
			description: 'Company which driver belongs to.',
			readOnly:    true
		},
		order:               {
			description: 'Order assigned to driver',
			readOnly:    true
		},
		cargoinn:            {
			description: 'Company which driver belongs to.',
			readOnly:    true
		},
		transports:          {
			description: 'List of transports of the driver',
			readOnly:    true
		}
	},
	image:      {
		...base,
		cargoId:     {
			description: 'Id of cargo company.',
			format:      'uuid'
		},
		cargoinnId:  {
			description: 'Id of individual cargo company.',
			format:      'uuid'
		},
		transportId: {
			description: 'Id of transport.',
			format:      'uuid'
		},
		url:         {
			description: 'Link to the image in drive/disk.',
			format:      'url'
		},
		cargo:       {
			description: 'Cargo company which image belongs to.',
			readOnly:    true
		},
		cargoinn:    {
			description: 'Cargo company (individual) which image belongs to.',
			readOnly:    true
		},
		transport:   {
			description: 'Cargo company transport which image belongs to.',
			readOnly:    true
		}
	},
	offer:      {
		...base,
		orderId:     { description: 'Order id sent to driver for fullfilment.' },
		driverId:    {
			description: 'Driver identifier to whom the order is sent for fullfilment.',
			format:      'uuid'
		},
		status:      {
			description: 'Status of order offer',
			format:      'integer'
		},
		orderStatus: { description: 'Status of the order from driver\'s actions.' },
		bidComment:  { description: 'Comments about bidding.' },
		bidPrice:    {
			description: 'Bid price w/o VAT (value-added tax)',
			format:      'integer'
		},
		bidPriceVat: {
			description: 'Bid price with VAT (value-added tax)',
			format:      'integer'
		},
		order:       {
			description: 'Associated order.',
			readOnly:    true
		},
		driver:      {
			description: 'Associated driver.',
			readOnly:    true
		},
		transports:  {
			description: 'Available transports fitting order requirements.',
			readOnly:    true
		}
	},
	order:      {
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
		crmId:             { description: 'CRM id of order from bitrix.' },
		title:             {
			description: 'Title of the order.',
			example:     'Сделка #01'
		},
		price:             {
			description: 'Price of order for payment to driver.',
			example:     '10.000|RUB'
		},
		date:              { description: 'Date of order creation in bitrix.' },
		status:            { description: 'Status of the order' },
		stage:             { description: 'Stage of the order implementation.' },
		dedicated:         {
			description: 'Transport must be dedicated for one order or can carry additional payload.',
			example:     'Не важно',
			enum:        ['Выделенная машина', 'Догруз', 'Не важно']
		},
		weight:            {
			description: 'Weight of the cargo.',
			format:      'float'
		},
		volume:            {
			description: 'Volume of the cargo.',
			format:      'float'
		},
		length:            {
			description: 'Length of the cargo.',
			format:      'float'
		},
		height:            {
			description: 'Height of the cargo.',
			format:      'float'
		},
		width:             {
			description: 'Width of the cargo.',
			format:      'float'
		},
		number:            { description: 'Number of order.' },
		mileage:           { description: '' },
		pallets:           {
			description: 'Number of pallets needed for order cargo.',
			format:      'integer'
		},
		loadingTypes:      { description: 'Cargo loading types available in transport for order.' },
		transportTypes:    { description: 'Types of transport that fits for cargo' },
		isOpen:            { description: 'Order is not finished by assigned driver.' },
		isFree:            { description: 'Order is not assigned to any driver.' },
		isCanceled:        { description: 'Cancel status.' },
		isBid:             {
			description: 'Is price bargain/bidding available for the cargo order fullfilment.'
		},
		hasProblem:        { description: 'Driver has problems with order fullfilment.' },
		cancelCause:       { description: 'Cancel comment/reason.' },
		payload:           {
			description: 'Cargo payload.',
			examples:    ['Бумага', 'Алкогольные напитки']
		},
		payloadRiskType:   {
			description: 'Risk type of cargo payload.',
			examples:    ['Не опасный', 'ADR1']
		},
		paymentType:       {
			description: 'Type of payment for cargo order fullfilment.',
			examples:    ['НДС 20%', 'Без НДС', 'Карта', 'Наличными']
		},
		bidInfo:           {
			description: 'Information about bargain/bid for the cargo order.'
		},
		bidPrice:          {
			description: 'Price for bargain/bid for the cargo order w/o tax.',
			example:     '',
			format:      'float'
		},
		bidPriceVat:       {
			description: 'Price for bargain/bid for the cargo order with tax.',
			format:      'float'
		},
		destinations:      { description: 'Load/unload destination points for order.' },
		filter:            {
			description: 'Filter parameters on search for saving.'
		},
		driverDeferralConditions:
		                   {
			                   description: 'Driver\'s deferral conditions for order execution'
		                   },
		ownerDeferralConditions:
		                   {
			                   description: 'Cargo owner\'s deferral conditions for order execution'
		                   },
		paymentPhotoLink:  {
			description: 'Link to the payment document scan sent after order completion.',
			format:      'url'
		},
		receiptPhotoLink:  {
			description: 'Link to the receipt scan sent after order completion.',
			format:      'url'
		},
		contractPhotoLink: {
			description: 'Link to the offer agreement scan by driver sent before start of order fulfillment.',
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
	payment:    {
		...base,
		cargoId:         {
			description: 'Id of cargo company for payments.',
			format:      'uuid'
		},
		cargoinnId:      {
			description: 'Id of individual cargo company for payments.',
			format:      'uuid',
			example:     ''
		},
		correspondentAccount:
		                 {
			                 description: 'Cargo company correspondent account number',
			                 example:     '30101643600000000957'
		                 },
		currentAccount:  {
			description: 'Cargo company giro transfer account number.',
			example:     '40817810099910004312'
		},
		ogrnip:          {
			description: 'The main state registration number of an individual entrepreneur.',
			example:     '321244848332114'
		},
		ogrnipPhotoLink: {
			description: 'Url to the main state registration number of an individual entrepreneur scan.'
		},
		bankName:        {
			description: 'Name of the Bank of cargo company.',
			example:     'ПАО "Сбербанк"'
		},
		bankBic:         {
			description: 'Bank identification code for cargo company.',
			example:     '869049586'
		},
		info:            {
			description: 'Additional information about cargo company payments.'
		},
		cargo:           {
			description: 'Cargo company entity that payment belongs to.',
			readOnly:    true
		},
		cargoinn:        {
			description: 'Cargo company (individual) entity that payment belongs to.',
			readOnly:    true
		}
	},
	transport:  {
		...base,
		crmId:              { description: 'CRM id of transport from bitrix server.' },
		cargoId:            {
			description: 'Id of cargo company transport belongs to.',
			format:      'uuid'
		},
		cargoinnId:         {
			description: 'Id of cargo company (individual) transport belongs to.',
			format:      'uuid'
		},
		driverId:           {
			description: 'Id of driver transport belongs to.',
			format:      'uuid'
		},
		status:             { description: 'Status of the transport.' },
		comments:           { description: 'Additional comments about the transport.' },
		diagnosticsNumber:  { description: 'Transport diagnostics certificate number.' },
		diagnosticsDate:    { description: 'Transport diagnostics certificate given date.' },
		diagnosticsPhotoLink:
		                    { description: 'Link to the transport diagnostics certificate photo.' },
		info:               { description: 'Additional information about the transport.' },
		volumeExtra:        {
			description: 'Additional volume for cargo that transport can take for another order when has ongoing order.',
			format:      'float'
		},
		weightExtra:        {
			description: 'Additional weight for cargo that transport can take for another order when has ongoing order.',
			format:      'float'
		},
		volume:             {
			description: 'Volume of cargo that transport can carry.',
			format:      'float'
		},
		weight:             {
			description: 'Weight of cargo that transport can carry.',
			format:      'float'
		},
		length:             {
			description: 'Length of cargo that transport can carry.',
			format:      'float'
		},
		width:              {
			description: 'Width of cargo that transport can carry.',
			format:      'float'
		},
		height:             {
			description: 'Height of cargo that transport can carry.',
			format:      'float'
		},
		loadingTypes:       { description: 'Cargo loading modes for transport.' },
		brand:              {
			description: 'Brand of the transport producer.',
			examples:    ['Scania', 'Dasan', 'Dogan Yildiz', 'Daewoo']
		},
		model:              {
			description: 'Model of the transport.',
			example:     'R 730 V8 6x2'
		},
		osagoNumber:        {
			description: 'Certificate number of Compulsory insurance '
			             + 'of civil liability of vehicle owners (ОСАГО).'
		},
		osagoExpiryDate:    {
			description: 'Compulsory insurance of civil liability '
			             + 'of vehicle owners (ОСАГО) certificate given date.'
		},
		osagoPhotoLink:     {
			description: 'Link to the photo of OSAGO certificate.',
			format:      'url'
		},
		payload:            { description: 'Payload that transport may carry.' },
		payloadExtra:       { description: 'Transport can carry additional cargo.\nOpposite of isDedicated.' },
		isTrailer:          { description: 'Transport is trailer.' },
		isDedicated:        {
			description: 'Transport is dedicated for execution of only one order.\nOpposite of payloadExtra'
		},
		pallets:            {
			description: 'Number of cargo pallets that transport is available to carry.',
			format:      'integer'
		},
		prodYear:           {
			description: 'Year of production of transport.',
			format:      'integer',
			examples:    [2012, 2015]
		},
		registrationNumber: {
			description: 'Transport registration number.',
			example:     'но 181 к 881'
		},
		certificateNumber:  {
			description: 'Transport registration certificate number.',
			example:     '8 181 81 881'
		},
		riskClasses:        { description: 'Transport risk class for cargo.' },
		type:               {
			description: 'Type of the transport.',
			examples:    ['Тентованный', 'Контейнер 40фт']
		},
		fixtures:           {
			description: 'Extra fixtures of transport.',
			examples:    ['Аппарели', 'Без ворот', 'Со снятием стоек']
		},
		cargo:              {
			description: 'Cargo company that transport belongs to.',
			readOnly:    true
		},
		cargoinn:           {
			description: 'Cargo company (INN) that transport belongs to.',
			readOnly:    true
		},
		driver:             {
			description: 'Driver of the transport',
			readOnly:    true
		},
		images:             {
			description: 'List of transport images.',
			readOnly:    true
		}
	}
};

/**@ignore*/
export default entityConfig;
