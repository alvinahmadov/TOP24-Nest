import { Injectable, PipeTransform } from '@nestjs/common';
import env                           from '@config/env';
import { CompanyType }               from '@common/enums';
import { ICompany }                  from '@common/interfaces';
import {
	convertBitrix,
	formatPhone,
	isNumber
}                                    from '@common/utils';
import {
	transformToCargoCompany,
	transformToCargoInnCompany
}                                    from '@common/utils/compat/transformer-functions';
import {
	CargoCompanyRepository,
	CargoInnCompanyRepository
}                                    from '@repos/index';

class CompanyValidator {
	protected cargoCompanyRepo: CargoCompanyRepository;
	protected cargoCompanyInnRepo: CargoInnCompanyRepository;

	constructor() {
		this.cargoCompanyRepo = new CargoCompanyRepository();
		this.cargoCompanyInnRepo = new CargoInnCompanyRepository();
	}

	protected checkPaymentType(company: ICompany) {
		if(company.paymentType) {
			if(!isNumber(company.paymentType))
				throw Error('Значение типа оплаты должно быть числовым значением, взятым из справочника!');

			company.paymentType = convertBitrix('paymentType', company.paymentType, true);
		}
		else throw Error('Не указан тип оплаты!');
	}

	protected async checkPhoneNumber(phone: string, name: string) {
		if(phone !== undefined) {
			const company = await this.cargoCompanyRepo.getByPhone(phone) ||
			                await this.cargoCompanyInnRepo.getByPhone(phone);

			if(company && company.name !== name) {
				throw Error('This Phone is already taken.');
			}
		}
		else {
			throw Error('No Phone number!');
		}
	}
}

@Injectable()
export class CompanyCreatePipe
	extends CompanyValidator
	implements PipeTransform<ICompany> {
	async transform(data: any) {
		if(data) {
			let value: ICompany;
			const companyType = env.api.compatMode ? data['company_type'] : data['type'];
			if(companyType === CompanyType.ORG) {
				value = !env.api.compatMode ? data : transformToCargoCompany(data);
			}
			else {
				value = !env.api.compatMode ? data : transformToCargoInnCompany(data);
			}
			const { phone, name } = value;
			await this.checkPhoneNumber(phone, name);
			this.checkPaymentType(value);
			return value;
		}

		return data;
	}
}

@Injectable()
export class CompanyUpdatePipe
	extends CompanyValidator
	implements PipeTransform {
	async transform(data: any) {
		const { phone } = data;
		if(phone !== undefined) {
			const company = await this.cargoCompanyRepo.getByPhone(phone) ||
			                await this.cargoCompanyInnRepo.getByPhone(phone);

			if(company !== null) {
				throw Error('Указанный номер занят другим пользователем!');
			}
		}
		return data;
	}
}
