import { getTranslation } from '@common/utils';

/**
 * Type of the company.
 * */
export enum CompanyType {
	/**
	 * Company is of commercial organisation type.
	 * */
	ORG = 0,
	/**
	 * Company is of individual entrepreneur (ИП) type.
	 * */
	IE = 1,
	/**
	 * Company is of individual person (Физ. лицо/ФЛ) type.
	 * */
	PI = 2
}

/**@ignore*/
export const companyTypeToStr = (companyType: CompanyType) =>
	getTranslation('ENUM', 'COMPANY', 'TYPE', CompanyType[companyType]);
