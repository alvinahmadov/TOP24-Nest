import { faker }              from '@faker-js/faker';
import * as interfaces        from '@common/interfaces';
import * as enums             from '@common/enums';
import * as dto               from '@api/dto';
import * as common            from './common';
import { generateTransports } from './transport';

type TDriverGeneratorResult = {
	driver: dto.DriverCreateDto,
	transports: dto.TransportCreateDto[]
};

/**@ignore*/
const randomDriverStatus = () => faker.helpers.arrayElement(common.DRIVER_STATUSES);

export async function generateDriver(companies: interfaces.ICompany[])
	: Promise<TDriverGeneratorResult> {
	const company = faker.helpers.arrayElement(companies);
	const name = faker.name.firstName('male');
	const patronymic = faker.name.middleName('male');
	const lastName = faker.name.lastName('male');
	const email = faker.internet.email();

	const lat = () => Number(faker.address.latitude(65.0, 30.0, 5)),
		lng = () => Number(faker.address.longitude(65.0, 30.0, 5));

	const driver: dto.DriverCreateDto = {
		cargoId:                     company.type === enums.CompanyType.ORG
		                             ? company.id : null,
		cargoinnId:                  company.type !== enums.CompanyType.ORG
		                             ? company.id : null,
		crmId:                       null,
		name,
		patronymic,
		lastName,
		email,
		avatarLink:                  faker.image.avatar(),
		birthDate:                   faker.date.past(30),
		licenseNumber:               common.generateSerialNumber([2, 2, 7]),
		licenseDate:                 faker.date.future(5),
		licenseBackLink:             faker.image.technics(),
		licenseFrontLink:            faker.image.technics(),
		passportDate:                faker.date.future(10),
		passportIssuedBy:            common.generateAddress(),
		passportPhotoLink:           faker.image.imageUrl(),
		passportRegistrationAddress: common.generateAddress(),
		passportSelfieLink:          faker.image.imageUrl(),
		passportSerialNumber:        common.generateSerialNumber([3, 4]),
		passportSignLink:            faker.image.imageUrl(),
		passportSubdivisionCode:     common.generateSerialNumber([3, 3]),
		phone:                       company.phone,
		phoneSecond:                 company.contactPhone,
		address:                     common.generateAddress(),
		registrationAddress:         common.generateAddress(),
		status:                      randomDriverStatus(),
		isReady:                     true,
		latitude:                    lat(),
		longitude:                   lng(),
		info:                        `Сгенерированный водитель компании '${company.name}'`
	};
	const transports: dto.TransportCreateDto[] = await generateTransports(
		faker.datatype.number({ min: 1, max: 2 }),
		driver
	);
	return { driver, transports };
}
