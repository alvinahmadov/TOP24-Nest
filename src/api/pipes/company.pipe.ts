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
			if(!isNumber(company.paymentType))
				throw Error('Значение типа оплаты должно быть числовым значением, взятым из справочника!');

			company.paymentType = convertBitrix('paymentType', company.paymentType, true);
		}
		else throw Error('Не указан тип оплаты!');
	}
}

@Injectable()
export class CompanyCreatePipe
	extends CompanyValidator
	implements PipeTransform<ICompany> {
	async transform(data: any) {
		if(data) {
			let value: ICompany;
			const companyType = data[env.api.compatMode ? 'company_type' : 'type'];
			if(companyType === CompanyType.ORG) {
				value = !env.api.compatMode ? data : transformToCargoCompany(data);
			}
			else {
				value = !env.api.compatMode ? data : transformToCargoInnCompany(data);
			}
			this.checkPaymentType(value);
			delete value.confirmed;
			delete value.userId;

			return value;
		}

		return data;
	}
}
