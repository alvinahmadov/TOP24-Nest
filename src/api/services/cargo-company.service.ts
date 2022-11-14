import * as uuid                  from 'uuid';
import { Injectable }             from '@nestjs/common';
import { BitrixUrl }              from '@common/constants';
import { AxiosStatic }            from '@common/classes';
import {
	IApiResponse,
	IApiResponses,
	IService,
	TAsyncApiResponse
}                                 from '@common/interfaces';
import {
	cargoToBitrix,
	deleteEntityImages,
	filterDirections,
	filterTransports,
	formatArgs,
	getTranslation
}                                 from '@common/utils';
import {
	CargoCompany,
	Transport
}                                 from '@models/index';
import { CargoCompanyRepository } from '@repos/index';
import {
	CompanyCreateDto,
	CompanyFilter,
	CompanyTransportFilter,
	CompanyUpdateDto,
	ListFilter
}                                 from '@api/dto';
import { EventsGateway }          from '@api/events';
import Service                    from './service';
import AddressService             from './address.service';
import PaymentService             from './payment.service';

const TRANSLATIONS = getTranslation('REST', 'COMPANY');
const EVENT_TRANSLATIONS = getTranslation('EVENT', 'COMPANY');

@Injectable()
export default class CargoCompanyService
	extends Service<CargoCompany, CargoCompanyRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		NOT_FOUND:       { statusCode: 404, message: TRANSLATIONS['NOT_FOUND'] },
		NOT_ACCEPTABLE:  { statusCode: 406, message: TRANSLATIONS['NOT_ACCEPTABLE'] },
		ACCESS_DENIED:   { statusCode: 401, message: TRANSLATIONS['ACCESS_DENIED'] },
		INCORRECT_TOKEN: { statusCode: 400, message: TRANSLATIONS['INCORRECT_TOKEN'] },
		INCORRECT_PASSW: { statusCode: 403, message: TRANSLATIONS['INCORRECT_PASSW'] },
		INCORRECT_CODE:  { statusCode: 403, message: TRANSLATIONS['INCORRECT_CODE'] },
		INCORRECT_PHONE: { statusCode: 403, message: TRANSLATIONS['INCORRECT_PHONE'] },
		CRM_ERROR:       { statusCode: 500, message: TRANSLATIONS['CRM_ERROR'] }
	};

	constructor(
		protected readonly addressService: AddressService,
		protected readonly paymentsService: PaymentService,
		protected readonly gateway: EventsGateway
	) {
		super();
		this.repository = new CargoCompanyRepository();
	}

	/**
	 * @summary Get list of cargo companies
	 *
	 * @description Get cargos by applying list and model filters.
	 * Send filter to get concrete cargo or leave emtpy to get full list.
	 *
	 * @param {ListFilter} listFilter Filter for range and data fullness
	 * @param {CompanyFilter} filter Field filters for cargo company
	 * */
	public async getList(
		listFilter: ListFilter = {},
		filter: CompanyFilter = {}
	): TAsyncApiResponse<CargoCompany[]> {
		const data = await this.repository.getList(listFilter, filter);
		const message: string = formatArgs(TRANSLATIONS['LIST'], data?.length);

		return {
			statusCode: 200,
			data,
			message
		} as IApiResponse<CargoCompany[]>;
	}

	/**
	 * @summary Get cargo company by id
	 *
	 * @param {String!} id Id of requested cargo company
	 * @param {Boolean!} full Get full properties
	 * */
	public async getById(id: string, full?: boolean)
		: TAsyncApiResponse<CargoCompany | null> {
		const company = await this.repository.get(id, full);

		if(!company)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       company,
			message:    formatArgs(TRANSLATIONS['GET'], company.name)
		} as IApiResponse<CargoCompany>;
	}

	/**
	 * @summary Get cargo company by id
	 *
	 * @param {Number!} crmId Id of requested cargo company crm
	 * @param {Boolean!} full Get full properties
	 * */
	public async getByCrmId(crmId: number, full?: boolean)
		: TAsyncApiResponse<CargoCompany | null> {
		const company = await this.repository.getByCrmId(crmId, full);

		if(!company)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       company,
			message:    formatArgs(TRANSLATIONS['GET'], company.name)
		} as IApiResponse<CargoCompany>;
	}

	/**
	 * @summary Create a new cargo company.
	 *
	 * @description Creates cargo company by provided data with required fields.
	 *
	 * @param {ICargoCompany!} dto New data of cargo company.
	 * */
	public async create(dto: CompanyCreateDto)
		: TAsyncApiResponse<CargoCompany> {
		const company = await this.createModel(dto);

		if(!company)
			return this.repository.getRecord('create');

		this.gateway.sendCargoEvent(
			{
				id:      company.id,
				source:  'registration',
				message: EVENT_TRANSLATIONS['MODERATION']
			}
		);

		return {
			statusCode: 201,
			data:       company,
			message:    formatArgs(TRANSLATIONS['CREATE'], company.name)
		} as IApiResponse<CargoCompany>;
	}

	/**
	 * @summary Update cargo company.
	 *
	 * @description Updates cargo company by provided partial data.
	 *
	 * @param {String!} id Id of cargo company to update.
	 * @param {Partial<ICargoCompany>!} dto Partial new data about cargo company.
	 * */
	public async update(id: string, dto: CompanyUpdateDto)
		: TAsyncApiResponse<CargoCompany | null> {
		const company = await this.repository.update(id, dto);

		if(!company)
			return this.repository.getRecord('update');

		this.gateway.sendCargoEvent({ id, status: company.status });

		return {
			statusCode: 200,
			data:       company,
			message:    formatArgs(TRANSLATIONS['UPDATE'], company.name)
		} as IApiResponse<CargoCompany>;
	}

	/**
	 * @summary Delete cargo company record
	 *
	 * @description Deletes all related data to cargo company and itself
	 *
	 * @param {String!} id Id of cargo company to delete
	 * */
	public async delete(id: string)
		: TAsyncApiResponse<{ [k: string]: number }> {
		const company = await this.repository.get(id, true);

		if(!company)
			return this.responses['NOT_FOUND'];

		if(company.crmId) {
			await AxiosStatic.get(`${BitrixUrl.COMPANY_DEL_URL}?ID=${company.crmId}`);
		}

		const companyImages = await company.deleteImages();
		const transportImages = await deleteEntityImages(company.transports);
		const driverImages = await deleteEntityImages(company.drivers);
		const { data: { affectedCount: pays = 0 } } = await this.paymentsService.deleteByCompany(
			{ cargoId: id }
		);
		const { affectedCount = 0 } = await this.repository.delete(id);

		return {
			statusCode: 200,
			data:       {
				affectedCount,
				pays,
				companyImages,
				transportImages,
				driverImages
			},
			message:    formatArgs(TRANSLATIONS['DELETE'], company.name)
		} as IApiResponse<{ [k: string]: number }>;
	}

	/**
	 * @summary Get transports
	 *
	 * @description Get matching transports by filter and physical parameters by order details.
	 * */
	public async getTransports(
		listFilter: ListFilter = {},
		filter: CompanyTransportFilter = {}
	): TAsyncApiResponse<Transport[]> {
		const transports: Transport[] = [];
		let { riskClass, fromDate, toDate, ...rest } = filter;
		let companies: CargoCompany[] = [];

		try {
			companies = await this.repository.getTransports(listFilter, rest);
		} catch(e) {
			this.logger.error(e);
			return {
				statusCode: 500,
				message:    e.message
			};
		}

		if(rest && rest.directions) {
			if(rest.directions.every(d => uuid.validate(d))) {
				let directions: string[] = [];
				for(const directionId of rest.directions) {
					const { data: address } = await this.addressService.getById(directionId);

					if(address) {
						directions.push(address.city, address.region);
					}
				}
				rest.directions = directions;
			}

			companies = companies.filter(cargo => filterDirections(cargo, rest.directions));
		}

		companies.forEach(
			c => transports.push(
				...c.transports?.filter(
					t =>
					{
						if(t.driver !== null) {
							if(t.driver.order === null) {
								return true;
							}
							else {
								if(!fromDate || !toDate)
									return true;
								const order = t.driver.order;
								return (
									(order.date >= fromDate) && (order.date <= toDate)
								);
							}
						}
						return false;
					}
				)
			)
		);
		const data = filterTransports(transports, filter);
		const message = formatArgs(TRANSLATIONS['TRANSPORTS'], transports.length);

		return {
			statusCode: 200,
			data,
			message
		} as IApiResponse<Transport[]>;
	}

	/**
	 * @summary Send company info into Bitrix CRM service
	 *
	 * @description Updates and sends cargo company data with all related data
	 * (transports, drivers) into the Bitrix CRM service and updates cargo
	 * crm_id from result.
	 *
	 * @param {String!} id Id of cargo company
	 * */
	public async send(id: string): TAsyncApiResponse<number> {
		const company = await this.repository.get(id, true);
		if(!company) {
			return this.responses['NOT_FOUND'];
		}
		return cargoToBitrix(company);
	}
}
