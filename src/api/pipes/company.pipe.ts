import { Injectable, PipeTransform } from '@nestjs/common';
import { ICompany }                  from '@common/interfaces';
import {
	convertBitrix,
	formatPhone,
	isNumber
}                                    from '@common/utils';
import {
	CargoCompanyRepository,
	CargoInnCompanyRepository
}                                    from '@repos/index';

const cargoCompanyRepo = new CargoCompanyRepository();
const cargoCompanyInnRepo = new CargoInnCompanyRepository();

class CompanyValidator {
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
			const company = await cargoCompanyRepo.getByPhone(phone) ||
			                await cargoCompanyInnRepo.getByPhone(phone);

			if(company.name !== name) {
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
	async transform(value: ICompany) {
		const { phone, name } = value;
		await this.checkPhoneNumber(phone, name);
		this.checkPaymentType(value);
		value.phone = formatPhone(value.phone);
		return value;
	}
}

@Injectable()
export class CompanyUpdatePipe
	extends CompanyValidator
	implements PipeTransform<ICompany> {
	async transform(value: ICompany) {
		const { phone, id } = value;
		if(phone !== undefined) {
			const company = await cargoCompanyRepo.getByPhone(phone) ||
			                await cargoCompanyInnRepo.getByPhone(phone);

			if(company !== null) {
				if(id && company.id !== id) {
					throw Error('Указанный номер занят другим пользователем!');
				}
				return value;
			}
		}
		return value;
	}
}
