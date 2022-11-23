import { Injectable }        from '@nestjs/common';
import {
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

	public async getList(filter: ListFilter & { short?: boolean })
		: TAsyncApiResponse<Address[]> {
		const addresses = await this.repository.getList(filter);

		return {
			statusCode: 200,
			data:       addresses,
			message:    formatArgs(TRANSLATIONS['LIST'], addresses.length)
		} as IApiResponse<Address[]>;
	}

	public async filter(
		listFilter: ListFilter,
		filter: IAddressFilter
	): TAsyncApiResponse<Address[]> {
		const addresses = await this.repository.getList(listFilter, filter);

		return {
			statusCode: 200,
			data:       addresses,
			message:    formatArgs(TRANSLATIONS['LIST'], addresses.length)
		} as IApiResponse<Address[]>;
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
		} as IApiResponse<Address>;
	}

	public async search(
		term: string,
		listFilter: ListFilter = {},
		onlyRegions: boolean = false
	): TAsyncApiResponse<Address[]> {
		const addresses = await this.repository.find(term, listFilter, onlyRegions);

		return {
			statusCode: 200,
			data:       addresses,
			message:    formatArgs(TRANSLATIONS['LIST'], addresses.length)
		} as IApiResponse<Address[]>;
	}

	public async searchByApi(
		term: string,
		minLength: number = 2,
		listFilter: IListFilter & {
			search?: string;
			provider?: string;
		} = { from: 0, count: 50 }
	): TAsyncApiResponse<any> {
		if(term === undefined ||
		   term.length < minLength) {
			return this.responses['NOT_FOUND'];
		}
		const { provider = 'osm' } = listFilter;

		const encoded = encodeURI(term);

		const fullAddresses = await (
			provider === 'osm' ? searchAddressByOSM(encoded, listFilter.from, listFilter.count)
			                   : searchAddressByKladr(encoded, listFilter.from, listFilter.count)
		);

		return {
			statusCode: 200,
			data:       fullAddresses,
			message:    formatArgs(TRANSLATIONS['LIST'], fullAddresses.length)
		} as IApiResponse<any>;
	}
}
