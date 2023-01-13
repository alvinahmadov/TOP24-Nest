import { Injectable }        from '@nestjs/common';
import {
	IAddress,
	IAddressFilter,
	IApiResponse,
	IApiResponses,
	IListFilter,
	IService,
	TAsyncApiResponse
}                            from '@common/interfaces';
import {
	formatArgs,
	getTranslation,
	searchAddressByKladr,
	searchAddressByOSM
}                            from '@common/utils';
import { Address }           from '@models/index';
import { AddressRepository } from '@repos/index';
import { ListFilter }        from '@api/dto';
import Service               from './service';

const TRANSLATIONS = getTranslation('REST', 'ADDRESS');

@Injectable()
export default class AddressService
	extends Service<Address, AddressRepository>
	implements IService {
	public override readonly responses: IApiResponses<null> = {
		NOT_FOUND: { statusCode: 404, message: TRANSLATIONS['NOT_FOUND'] }
	};

	constructor() {
		super();
		this.repository = new AddressRepository();
	}

	public async getList(
		listFilter: ListFilter,
		filter: IAddressFilter
	): TAsyncApiResponse<Address[]> {
		const addresses = await this.repository.getList(listFilter, filter);

		return {
			statusCode: 200,
			data:       addresses,
			message:    formatArgs(TRANSLATIONS['LIST'], addresses.length)
		};
	}

	public async getById(id: string)
		: TAsyncApiResponse<Address> {
		const address = await this.repository.get(id);

		if(!address)
			return this.responses['NOT_FOUND'];

		return {
			statusCode: 200,
			data:       address,
			message:    formatArgs(TRANSLATIONS['GET'], address.value)
		};
	}

	public async search(
		term: string,
		listFilter: ListFilter = {},
		onlyRegions: boolean = false
	): TAsyncApiResponse<IAddress[]> {
		let addresses: IAddress[] = [];
		const results = await this.repository.find(term, listFilter, onlyRegions);

		if(onlyRegions && results.length > 0) {
			const regionAddress = results[0].get({ clone: true, plain: true });
			addresses = [
				regionAddress,
				...results.map(
					address =>
					{
						if(address.city) {
							address.region = address.city;
							address.regionType = address.cityType;
						} else return null;
						return address;
					}
				).filter(a => a !== null)
			];
		}

		return {
			statusCode: 200,
			data:       addresses,
			message:    formatArgs(TRANSLATIONS['LIST'], addresses.length)
		};
	}

	public async searchByApi(
		term: string,
		minLength: number = 2,
		filter: IAddressFilter = {},
		listFilter: IListFilter = {}
	): TAsyncApiResponse<any> {
		if(term === undefined ||
		   term.length < minLength) {
			return this.responses['NOT_FOUND'];
		}
		const { provider = 'osm' } = filter;

		const fullAddresses = await (
			provider === 'osm' ? searchAddressByOSM(term, listFilter)
			                   : searchAddressByKladr(term, listFilter)
		);

		return {
			statusCode: 200,
			data:       fullAddresses,
			message:    formatArgs(TRANSLATIONS['LIST'], fullAddresses.length)
		} as IApiResponse<any>;
	}

	public async searchByGeolocation(
		coordinates: { latitude: number; longitude: number },
		distance: number = 60.0
	): TAsyncApiResponse<Address[]> {
		const { latitude, longitude } = coordinates;

		const result = await this.repository.findByCoordinates([latitude, longitude], distance);

		return {
			statusCode: 200,
			data:       result
		};
	}
}
