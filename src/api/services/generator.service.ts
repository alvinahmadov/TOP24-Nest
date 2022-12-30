import { Injectable }         from '@nestjs/common';
import faker                  from '@faker-js/faker';
import {
	CompanyType,
	companyTypeToStr,
	TransportStatus
}                             from '@common/enums';
import {
	IApiResponse,
	ICompany,
	IService
}                             from '@common/interfaces';
import {
	formatArgs,
	getTranslation,
	isSuccessResponse
}                             from '@common/utils';
import * as generator         from '@common/utils/generators';
import Destination            from '@models/destination.entity';
import Order                  from '@models/order.entity';
import * as dto               from '@api/dto';
import CargoCompanyService    from './cargo-company.service';
import CargoCompanyInnService from './cargoinn-company.service';
import DriverService          from './driver.service';
import ImageService           from './image.service';
import OrderService           from './order.service';
import PaymentService         from './payment.service';
import TransportService       from './transport.service';

const TRANSLATIONS = getTranslation('REST', 'GENERATOR');

@Injectable()
export default class GeneratorService
	implements IService {
	constructor(
		protected readonly cargoService: CargoCompanyService,
		protected readonly cargoinnService: CargoCompanyInnService,
		protected readonly driverService: DriverService,
		protected readonly orderService: OrderService,
		protected readonly paymentService: PaymentService,
		protected readonly transportService: TransportService,
		protected readonly imageService: ImageService
	) {}

	/**
	 * Generates company data depending on args
	 * */
	public async generateCompanies(count?: number, companyType?: number) {
		try {
			const imageWidth = 500, imageHeight = 500;
			const data = await generator.generateCompany(count, companyType);
			const companies: ICompany[] = [];

			for(const companyData of data) {
				const { company: companyDto, payment } = companyData;
				let companyItem: ICompany;
				let cargoId: string = null,
					cargoinnId: string = null;

				let apiRes: IApiResponse<any>;
				if(companyDto.type === CompanyType.ORG) {
					apiRes = await this.cargoService.create(companyDto as dto.CompanyCreateDto);
					if(apiRes.data) {
						cargoId = apiRes.data.id;
						companyItem = apiRes.data;
					}
				}
				else {
					apiRes = await this.cargoinnService.create(companyDto as dto.CompanyInnCreateDto);
					if(apiRes.data) {
						cargoinnId = apiRes.data.id;
						companyItem = apiRes.data;
					}
				}

				if(!apiRes.data) {
					return apiRes;
				}

				payment.cargoId = cargoId;
				payment.cargoinnId = cargoinnId;
				if(companyItem)
					await this.paymentService.create(payment);

				const { driver: driverData, transports } = await generator.generateDriver([companyItem]);
				const driverResponse = await this.driverService.create(driverData);

				if(driverResponse.data) {
					const { data: driver } = driverResponse;
					for(let index = 0; index < transports.length; ++index) {
						transports[index].cargoId = cargoId;
						transports[index].cargoinnId = cargoinnId;
						transports[index].driverId = driver.id;
						if(index == 0)
							transports[index].status = TransportStatus.ACTIVE;
						const transportResponse = await this.transportService.create(transports[index]);
						if(transportResponse.data) {
							const { data: transport } = transportResponse;
							for(let i = 0; i < 5; i++) {
								await this.imageService.create(
									{
										transportId: transport.id,
										cargoId:     transport.cargoId,
										cargoinnId:  transport.cargoinnId,
										url:         faker.image.transport(imageWidth, imageHeight, false)
									}
								);
							}
						}
					}
				}

				companies.push(companyItem);
			}

			const message = formatArgs(
				TRANSLATIONS['COMPANY'],
				companies?.length,
				companies.map(c => companyTypeToStr(c.type)).join(', ')
			);

			return {
				statusCode: 201,
				data:       companies,
				message
			};
		} catch(e) {
			return {
				statusCode: 400,
				stack:      e.stack,
				message:    e
			};
		}
	}

	public async generateOrders(count?: number, maxDestination: number = 10) {
		const orderDtos = await generator.generateOrders(count, maxDestination);
		const orders: Array<Order> = await Promise.all(
			orderDtos.map(
				async dto =>
				{
					const destinations = dto.destinations;
					dto.destinations = null;

					const apiResponse = await this.orderService.create(dto);
					if(isSuccessResponse(apiResponse)) {
						const { data: order } = apiResponse;

						for(const destination of destinations) {
							destination.orderId = order.id;
							const dest = await Destination.create(destination);
							if(order.destinations) order.destinations.push(dest);
						}
						return order;
					}
					return null;
				}
			)
		);
		const message = formatArgs(TRANSLATIONS['ORDER'], orders?.length);
		return {
			statusCode: 201,
			data:       orders,
			message
		};
	}
}
