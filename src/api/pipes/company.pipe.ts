import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { CompanyType }               from '@common/enums';
import { ICompany }                  from '@common/interfaces';
import { convertBitrix }             from '@common/utils';
import {
	transformToCargoCompany,
	transformToCargoInnCompany
}                                    from '@common/utils/compat/transformer-functions';
import {
	CargoCompanyRepository,
	CargoInnCompanyRepository,
	UserRepository
}                                    from '@repos/index';

class CompanyValidator {
	protected cargoCompanyRepo: CargoCompanyRepository;
	protected cargoCompanyInnRepo: CargoInnCompanyRepository;
	protected userRepo: UserRepository;

	constructor() {
		this.cargoCompanyRepo = new CargoCompanyRepository();
		this.cargoCompanyInnRepo = new CargoInnCompanyRepository();
		this.userRepo = new UserRepository();
	}

	protected checkPaymentType(company: ICompany) {
		if(company.paymentType) {
			company.paymentType = convertBitrix('paymentType', company.paymentType, true) || company.paymentType;
		}
	}

	protected checkPassportData(company: ICompany) {
		if(!company.passportSerialNumber)
			company.passportSerialNumber = '';

		if(!company.passportSubdivisionCode)
			company.passportSubdivisionCode = '';

		if(!company.passportGivenDate)
			company.passportGivenDate = new Date();

		if(!company.passportRegistrationAddress)
			company.passportRegistrationAddress = '';

		if(!company.passportIssuedBy)
			company.passportIssuedBy = '';
	}
}

@Injectable()
export class CompanyCreatePipe
	extends CompanyValidator
	implements PipeTransform<ICompany> {
	async transform(data: any) {
		if(data) {
			let value: ICompany & { user?: string };
			const companyType = data[env.api.compatMode ? 'company_type' : 'type'];
			if(companyType === CompanyType.ORG) {
				value = !env.api.compatMode ? data : transformToCargoCompany(data);
			}
			else {
				value = !env.api.compatMode ? data : transformToCargoInnCompany(data);
			}
			if(!value)
				throw new Error('DTO data is null');

			this.checkPaymentType(value);
			this.checkPassportData(value);
			value.user = data.user;

			delete value.id;
			delete value.userId;
			delete value.confirmed;
			delete value.createdAt;
			delete value.updatedAt;

			return value;
		}

		return data;
	}
}
