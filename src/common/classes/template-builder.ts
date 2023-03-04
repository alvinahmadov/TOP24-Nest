import {
	readFileSync,
	writeFileSync
}                    from 'fs';
import { promisify } from 'util';
import PizZip        from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as libre    from 'libreoffice-convert';
import {
	CompanyType,
	companyTypeToStr,
	destinationTypeToStr,
	loadingTypeToStr,
	TransportStatus
}                    from '@common/enums';
import { BitrixUrl } from '@common/constants';
import {
	setMonthSuffixRussianLocale,
	toLocaleDateTime
}                    from '@common/utils';
import {
	ICompany
}                    from '@common/interfaces';
import {
	CargoCompany,
	CargoCompanyInn,
	Driver,
	Order,
	Payment
}                    from '@models/index';
import { Axios }     from '@common/classes/axios';

const convertPdfAsync = promisify(libre.convert);

export type TTemplateSaveFormat = 'pdf' | 'docx';

// noinspection JSUnusedGlobalSymbols
/**
 * Class to replace placeholders in job agreement
 * with actual data from backend and convert to send in response
 * or write to the disk.
 * */
export default class DocumentTemplateBuilder {
	private doc: Docxtemplater;
	private _buffer: Buffer;
	private config: any;
	protected httpClient: Axios;

	constructor(input: string) {
		const content = readFileSync(input, "binary");
		this.doc = new Docxtemplater(new PizZip(content), {
			paragraphLoop: true,
			linebreaks:    true
		});
		this.httpClient = new Axios();
		this.config = {};
	}

	public get docBuffer(): Buffer {
		return this._buffer;
	}

	public get pdfBuffer(): Promise<Buffer> {
		if(this._buffer)
			return convertPdfAsync(this._buffer, '.pdf', undefined);

		return null;
	}

	public async build(order: Order, driver: Driver, company: ICompany): Promise<this> {
		delete this._buffer;

		const date = new Date();

		const { crmId } = order;
		const localeMonth = date.toLocaleString('ru', { month: 'long' });
		this.config = {
			crmId,
			day:         date.getDate(),
			month:       setMonthSuffixRussianLocale(localeMonth),
			year:        date.getFullYear(),
			logist:      '',
			logistPhone: '',
		};
		this.replaceOrderPlacehoders(order);
		this.replaceDriverPlacehoders(driver);
		this.replaceCompanyPlacehoders(company);

		const ths = this;
		this.getLogistData(crmId).then(
			({ name, phone }) =>
			{
				if(name) ths.config['logist'] = name;
				if(phone) ths.config['logistPhone'] = phone;
			}
		);

		this.doc.render(this.config);

		this._buffer = this.doc.getZip()
		                   .generate(
			                   {
				                   type:        "nodebuffer",
				                   compression: "DEFLATE",
			                   }
		                   );

		return this;
	}

	public async save(output: string, format: TTemplateSaveFormat = 'pdf') {
		if(this._buffer) {
			if(format === 'pdf') {
				await libre.convert(this._buffer, '.' + format, undefined, (err, data) =>
				{
					if(!err)
						writeFileSync(output, data);
				});
			}
			else if(format === 'docx')
				writeFileSync(output, this._buffer);
		}
	}

	private async getLogistData(crmId: string | number) {
		const orderBitrixData = await this.httpClient.get<Record<string, any>>(`${BitrixUrl.ORDER_GET_URL}?ID=${crmId}`);
		if(orderBitrixData && orderBitrixData['CREATED_BY_ID']) {
			const logistCrmId = orderBitrixData['CREATED_BY_ID'];
			const contact = await this.httpClient.get<Record<string, any>>(`${BitrixUrl.CONTACT_GET_URL}?ID=${logistCrmId}`);
			if(contact) {
				const name: string = contact['NAME'];
				const patronymic: string = contact['SECOND_NAME'];
				const lastName: string = contact['LAST_NAME'];
				const phone: string = contact['PHONE'] ? contact['PHONE'][0] : '';

				return {
					name: `${lastName ? lastName + ', ' : ''}${name}${patronymic ? ' ' + patronymic : ''}`,
					phone
				};
			}
		}

		return {};
	}

	private replaceOrderPlacehoders(order: Order): void {
		this.addConfig('destinations', order.destinations.map(d => ({
			point:        d.num,
			address:      d.address,
			datetime:     toLocaleDateTime(d.date),
			opType:       destinationTypeToStr(d.type),
			contactInn:   d.inn,
			contactName:  d.contact,
			contactPhone: d.phone
		})))
		    .addConfig('deferralCondition', order.driverDeferralConditions)
		    .addConfig('payloadType', order.payload)
		    .addConfig('payloadWeight', order.weight)
		    .addConfig('payloadVolume', order.volume)
		    .addConfig('price', order.price)
		    .addConfig('payloadPallets', order.pallets ?? '-');
	}

	private replaceDriverPlacehoders(driver: Driver): void {
		if(!driver)
			return;

		const transport = driver.transports.find(t => !t.isTrailer && t.status === TransportStatus.ACTIVE);

		this.addConfig('driverLastname', driver.lastName)
		    .addConfig('driverName', driver.name)
		    .addConfig('driverPatronymic', driver.patronymic)
		    .addConfig('driverPhone', driver.phone)
		    .addConfig('driverPassportSerial', driver.passportSerialNumber)
		    .addConfig('driverPassportCode', driver.passportSubdivisionCode)
		    .addConfig('driverPassportDate', toLocaleDateTime(driver.passportGivenDate, 'date'))
		    .addConfig('driverLicenseNumber', driver.licenseNumber)
		    .addConfig('driverLicenseDate', toLocaleDateTime(driver.licenseDate, 'date'));

		if(transport)
			this.addConfig('transportBrand', transport?.brand)
			    .addConfig('transportModel', transport?.model)
			    .addConfig('transportType', transport?.type)
			    .addConfig('loadingType', transport?.loadingTypes
			                                       ?.map(l => loadingTypeToStr(l))
			                                       ?.join(', '))
			    .addConfig('transportWeight', transport.weight)
			    .addConfig('transportVolume', transport.volume)
			    .addConfig('transportSerial', transport.registrationNumber);
	}

	private replaceCompanyPlacehoders(company: ICompany): void {
		const cargoCompany = company.type === CompanyType.ORG ? <CargoCompany>company
		                                                      : null;
		const cargoCompanyInn = company.type !== CompanyType.ORG ? <CargoCompanyInn>company
		                                                         : null;

		this.addConfig('companyType', companyTypeToStr(company.type))
		    .addConfig('paymentType', company.paymentType);

		let payment: Payment;

		if(cargoCompany) {
			payment = cargoCompany.payment;
			const legalNameSanitized = cargoCompany.legalName
			                                       .replace('ООО', '')
			                                       .replace('ОАО', '')
			                                       .replace('ПАО', '');
			
			this.addConfig('companyName', cargoCompany.legalName)
			    .addConfig('companyLegalName', legalNameSanitized)
			    .addConfig('companyEmail', cargoCompany.email)
			    .addConfig('companyDirector', cargoCompany.director)
			    .addConfig('companyAddress', cargoCompany.legalAddress)
			    .addConfig('companyPostalAddress', cargoCompany.postalAddress)
			    .addConfig('companyPhone', cargoCompany.phone)
			    .addConfig('taxpayerNumber', cargoCompany.taxpayerNumber)
			    .addConfig('taxReasonCode', cargoCompany.taxReasonCode)
			    .addConfig('registrationNumber', cargoCompany.registrationNumber);
		}
		else if(cargoCompanyInn) {
			payment = cargoCompanyInn.payment;
			this.addConfig('companyName', cargoCompanyInn.name)
			    .addConfig('companyLastname', cargoCompanyInn.lastName)
			    .addConfig('companyPatronymic', cargoCompanyInn.patronymic)
			    .addConfig('companyPassportSerial', cargoCompanyInn.passportSerialNumber)
			    .addConfig('companyPassportCode', cargoCompanyInn.passportSubdivisionCode)
			    .addConfig('companyPassportDate', toLocaleDateTime(cargoCompanyInn.passportGivenDate, 'date'))
			    .addConfig('companyPassportIssue', cargoCompanyInn.passportIssuedBy)
			    .addConfig('companyEmail', cargoCompanyInn.email)
			    .addConfig('companyAddress', cargoCompanyInn.address)
			    .addConfig('companyPostalAddress', cargoCompanyInn.postalAddress)
			    .addConfig('companyPhone', cargoCompanyInn.contactPhone)
			    .addConfig('taxpayerNumber', cargoCompanyInn.taxpayerNumber);
		}

		if(payment) {
			this.addConfig('currentAccount', payment.currentAccount)
			    .addConfig('correspondentAccount', payment.correspondentAccount)
			    .addConfig('bankBic', payment.bankBic)
			    .addConfig('bankName', payment.bankName)
			    .addConfig('registrationNumber', payment.ogrnip);
		}
	}

	private addConfig(key: string, value: any): this {
		if(value !== undefined)
			this.config[key] = value;
		return this;
	}
}
