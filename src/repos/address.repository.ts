import {
	FindAttributeOptions,
	QueryTypes
}                        from 'sequelize';
import {
	DEFAULT_SORT_ORDER,
	GEO_DISTANCE_FN
}                        from '@common/constants';
import {
	IAddress,
	IAddressFilter,
	IListFilter,
	IRepository,
	IRepositoryOptions,
	TGeoCoordinate
}                        from '@common/interfaces';
import { Address }       from '@models/index';
import GenericRepository from './generic';

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
		if(filter === null)
			return [];

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
			async() =>
			{
				term = term?.toLowerCase() ?? '';
				const {
					from:  offset,
					count: limit
				} = listFilter ?? {};

				if(onlyRegions) {
					return this.model.sequelize.query<Address>(
						`SELECT DISTINCT ON(region) * FROM addresses WHERE region ILIKE '${term}%'`,
						{ type: QueryTypes.SELECT }
					);
				}

				return this.model.findAll(
					{
						where: this.whereClause('or')
						           .iLike('city', `${term}%`, false)
						           .iLike('region', `${term}%`, false)
						           .iLike('settlement', `${term}%`, false)
							       .query,
						order: [['region', 'ASC']],
						offset,
						limit
					}
				);
			},
			{ id: 'find' },
			{ info: term, listFilter }
		);
	}

	public async findByCoordinates(coordinates: TGeoCoordinate, distance: number = 60.0) {
		const latitude = coordinates[0];
		const longitude = coordinates[1];

		return this.log(
			async() =>
			{
				return this.model.sequelize.query<Address>(
					`SELECT * FROM addresses 
				WHERE geo_distance(
					point(:latitude, :longitude),
					point(latitude, longitude)
				) <= :distance;`,
					{
						replacements: { latitude, longitude, distance },
						type:         QueryTypes.SELECT
					});
			},
			{ id: 'findByCoordinates' },
			{ coordinates, distance }
		);
	}
}
