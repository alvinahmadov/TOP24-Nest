import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { CompanyType }               from '@common/enums';
import { ICompany }                  from '@common/interfaces';
import {
	convertBitrix,
	isNumber
}                                    from '@common/utils';
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
