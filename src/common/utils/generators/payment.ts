import faker    from '@faker-js/faker';
import * as dto from '@api/dto';

export const generatePayment = async(
	company: dto.CompanyCreateDto |
	         dto.CompanyInnCreateDto
): Promise<dto.PaymentCreateDto> => ({
	bankName:             faker.company.companyName(),
	bankBic:              faker.finance.bic(),
	info:                 `Сгенерированная счет компании '${company.name}'`,
	correspondentAccount: faker.finance.account(15),
	currentAccount:       faker.finance.account(15),
	ogrnip:               faker.finance.account(10),
});
