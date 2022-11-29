import faker, { GenderType } from '@faker-js/faker';
import * as enums            from '@common/enums';
import * as utils            from '@common/utils';
import * as dto              from '@api/dto';
import * as common           from './common';
import { generatePayment }   from './payment';

/**@ignore*/
type CompanyData = { company: dto.CompanyCreateDto, payment: dto.PaymentCreateDto };
/**@ignore*/
type CompanyInnData = { company: dto.CompanyInnCreateDto, payment: dto.PaymentCreateDto };

async function generateCargoCompany(): Promise<CompanyData> {
	const gender1 = faker.name.gender(true).toLowerCase() as GenderType;
	const gender2 = faker.name.gender(true).toLowerCase() as GenderType;
	const gender3 = faker.name.gender(true).toLowerCase() as GenderType;
	const name = faker.company.companyName();
	const phone = faker.phone.phoneNumber('+7 999 ### ## ##');
	let email = faker.internet.email(name, undefined, undefined, { allowSpecialCharacters: false });

	if(email.split('@')[0].length < 2) {
		email = faker.internet.email(name, undefined, undefined, { allowSpecialCharacters: false });
	}

	const cargoCompanyData: dto.CompanyCreateDto = {
		name,
		phone,
		email,
		user:                        phone,
		type:                        enums.CompanyType.ORG,
		isDefault:                   false,
		confirmed:                   false,
		contact:                     faker.name.findName(
			faker.name.firstName(gender1),
			faker.name.lastName(gender1),
			gender1
		),
		contactSecond:               faker.name.findName(
			faker.name.firstName(gender2),
			faker.name.lastName(gender2),
			gender2
		),
		contactThird:                faker.name.findName(
			faker.name.firstName(gender3),
			faker.name.lastName(gender3),
			gender3
		),
		avatarLink:                  faker.internet.avatar(),
		directions:                  faker.helpers.arrayElements(common.DIRECTIONS),
		director:                    faker.name.findName(),
		taxpayerNumber:              faker.finance.account(12),
		taxReasonCode:               faker.finance.account(12),
		registrationNumber:          faker.finance.account(12),
		paymentType:                 faker.helpers.arrayElement(['НДС 20%', 'Без НДС', ' Наличными']),
		legalAddress:                common.generateAddress(),
		postalAddress:               common.generateAddress(),
		passportGivenDate:           common.dateBetween(2000, 2020),
		passportPhotoLink:           faker.image.business(300, 300, true),
		passportRegistrationAddress: common.generateAddress(),
		passportSerialNumber:        faker.finance.account(12),
		passportIssuedBy:            common.generateAddress(),
		passportSubdivisionCode:     common.generateSerialNumber([3, 4]),
		contactPhone:                faker.phone.phoneNumber('+7 998 ### ## ##'),
		shortName:                   faker.company.catchPhrase(),
		attorneySignLink:            faker.image.business(),
		certificatePhotoLink:        faker.image.business(),
		directorOrderPhotoLink:      faker.image.business()
	};
	const payment = await generatePayment(cargoCompanyData);

	return { company: cargoCompanyData, payment };
}

async function generateCargoInnCompany(companyType?: enums.CompanyType) {
	const gender = faker.name.gender(true).toLowerCase() as GenderType;
	const name = faker.name.firstName(gender);
	const middle_name = faker.name.middleName(gender);
	const lastName = faker.name.lastName(gender);
	const phone = faker.phone.phoneNumber('+7 ### ### ## ##');
	let email = faker.internet.email(name, undefined, undefined, { allowSpecialCharacters: false });

	if(email.split('@')[0].length < 2) {
		email = faker.internet.email(name, undefined, undefined, { allowSpecialCharacters: false });
	}

	if(companyType === undefined)
		companyType = faker.helpers.arrayElement([enums.CompanyType.IE, enums.CompanyType.PI]);
	const cargoCompanyInnData: dto.CompanyInnCreateDto = {
		name,
		lastName,
		patronymic:                  middle_name,
		phone,
		email,
		user:                        phone,
		type:                        companyType,
		isDefault:                   false,
		taxpayerNumber:              faker.finance.account(12),
		paymentType:                 utils.randomOf('НДС 20%', 'Без НДС', ' Наличными'),
		info:                        'Сгенерированная компания',
		birthDate:                   faker.date.past(40),
		passportPhotoLink:           faker.internet.avatar(),
		passportIssuedBy:            faker.address.streetAddress(true),
		passportSelfieLink:          faker.image.imageUrl(),
		passportSignLink:            faker.image.imageUrl(),
		status:                      '',
		address:                     common.generateAddress(),
		postalAddress:               common.generateAddress(),
		actualAddress:               common.generateAddress(),
		confirmed:                   false,
		directions:                  faker.helpers.arrayElements(common.DIRECTIONS, 3),
		passportGivenDate:           common.dateBetween(2000, 2020),
		passportRegistrationAddress: common.generateAddress(),
		passportSerialNumber:        faker.random.alphaNumeric(7),
		passportSubdivisionCode:     common.generateSerialNumber([3, 4]),
		contactPhone:                faker.phone.phoneNumber('+7 ### ### ## ##'),
		personalPhone:               faker.phone.phoneNumber('+7 ### ### ## ##')
	};

	const payment = await generatePayment(cargoCompanyInnData);
	return { company: cargoCompanyInnData, payment };
}

async function generateCompanies(count?: number) {
	if(count === undefined)
		count = faker.datatype.number({ min: 3, max: 10 });
	const createdData: CompanyData[] = [];

	for(let step = 0; step < count; step++) {
		const data = await generateCargoCompany();
		createdData.push(data);
	}

	return createdData;
}

async function generateInnCompanies(count?: number, companyType?: enums.CompanyType) {
	if(!count)
		count = faker.datatype.number({ min: 3, max: 10 });
	const createdData: CompanyInnData[] = [];

	for(let step = 0; step < count; step++) {
		const data = await generateCargoInnCompany(companyType);
		createdData.push(data);
	}

	return createdData;
}

export async function generateCompany(count?: number, companyType?: enums.CompanyType) {
	if(companyType === undefined) {
		companyType = faker.helpers.arrayElement(
			[
				enums.CompanyType.ORG,
				enums.CompanyType.IE,
				enums.CompanyType.PI
			]
		);
	}

	if(companyType === enums.CompanyType.ORG) {
		return generateCompanies(count);
	}
	else {
		return generateInnCompanies(count, companyType);
	}
}
