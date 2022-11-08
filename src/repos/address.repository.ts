import { FindAttributeOptions } from 'sequelize';
import { DEFAULT_SORT_ORDER }   from '@common/constants';
import {
	IAddress,
	IAddressFilter,
	IListFilter,
	IRepository,
	IRepositoryOptions
}                               from '@common/interfaces';
import { Address }              from '@models/index';
import GenericRepository        from './generic';

export default class AddressRepository
	extends GenericRepository<Address, IAddress>
	implements IRepository {
	protected override readonly model = Address;

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(AddressRepository.name);
	}

	/**
	 * @link GenericRepository.get
	 * */
	public override async get(
		id: string,
		short?: boolean
	): Promise<Address> {
		return this.log(
			() =>
			{
				const attributes: FindAttributeOptions = short
				                                         ? { include: ['id', 'region', 'city'] }
				                                         : undefined;
				return this.model.findByPk(
					id,
					{ attributes, rejectOnEmpty: false }
				);
			}
		);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter & { short?: boolean },
		filter?: IAddressFilter
	): Promise<Address[]> {
		return this.log(
			() =>
			{
				const {
					from: offset = 0,
					short = false,
					count: limit
				} = listFilter ?? {};
				const { sortOrder: order = DEFAULT_SORT_ORDER } = filter ?? {};
				const attributes: FindAttributeOptions = short ? ['id', 'region', 'city']
				                                               : undefined;

				return this.model.findAll(
					{
						where: this.whereClause('or')
						           .nullOrEq('latitude', filter?.latitude)
						           .nullOrEq('longitude', filter?.longitude)
						           .fromFilter(filter, 'eq')
							       .query,
						offset,
						limit,
						order,
						attributes
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}

	/**
	 * Find address by term from database.
	 *
	 * @param term {String} Part of text to search for address.
	 * @param listFilter {IListFilter} List filter for returning results.
	 * @param onlyRegions Return only region field of address.
	 *
	 * @returns Address[]
	 * */
	public async find(
		term: string,
		listFilter?: IListFilter,
		onlyRegions: boolean = false
	): Promise<Address[]> {
		return this.log(
			() =>
			{
				term = term?.toLowerCase() ?? '';
				const {
					from:  offset = 0,
					count: limit
				} = listFilter ?? {};
				const term1 = term ? term.replace(term[0], term[0].toUpperCase()) : '';
				return this.model.findAll(
					{
						where: (
							       onlyRegions ? this.whereClause('or')
							                         .inArray('region', [`${term}%`, `${term1}%`])
							                   : this.whereClause('or')
							                         .inArray('city', [`${term}%`, `${term1}%`])
							                         .inArray('region', [`${term}%`, `${term1}%`])
							                         .inArray('settlement', [`${term}%`, `${term1}%`])
						       )
							       .query,
						order: [['region', 'DESC']],
						offset,
						limit
					}
				);
			},
			{ id: 'find' },
			{ info: term, listFilter }
		);
	}
}
