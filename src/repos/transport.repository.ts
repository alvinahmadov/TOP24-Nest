import { Includeable }        from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	IListFilter,
	IRepository,
	IRepositoryOptions,
	ITransport,
	ITransportFilter
}                             from '@common/interfaces';
import {
	CargoCompany,
	CargoInnCompany,
	Driver,
	Image,
	Transport
}                             from '@models/index';
import GenericRepository      from './generic';

export default class TransportRepository
	extends GenericRepository<Transport, ITransport>
	implements IRepository {
	protected override readonly model = Transport;
	protected override readonly include: Includeable[] = [
		{ model: CargoCompany },
		{ model: CargoInnCompany },
		{ model: Driver },
		{ model: Image }
	];

	constructor(
		protected override options: IRepositoryOptions = { log: true }
	) {
		super(TransportRepository.name);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: ITransportFilter
	): Promise<Transport[]> {
		return this.log(
			() =>
			{
				const {
					from: offset = 0,
					full = false,
					count: limit
				} = listFilter ?? {};
				const {
					sortOrder = DEFAULT_SORT_ORDER,
					...rest
				} = filter ?? {};

				return this.model.findAll(
					{
						where:   this.whereClause()
						             .fromFilter<ITransportFilter>(rest)
							         .query,
						order:   sortOrder,
						include: full ? this.include : [{ model: Image }],
						offset,
						limit
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}

	public async getByDriverId(
		driverId: string,
		listFilter: IListFilter,
		filter?: ITransportFilter
	): Promise<Transport[]> {
		return this.log(
			() =>
			{
				const {
					from: offset = 0,
					full = false,
					count: limit
				} = listFilter ?? {};
				const {
					sortOrder = DEFAULT_SORT_ORDER,
					weightMin, weightMax,
					volumeMin, volumeMax,
					lengthMin, lengthMax,
					widthMin, widthMax,
					heightMin, heightMax,
					pallets,
					payload,
					types,
					status,
					...rest
				} = filter ?? {};

				return this.model.findAll(
					{
						where: this.whereClause('and')
						           .eq('driverId', driverId)
						           .between('weight', weightMin, weightMax)
						           .between('volume', volumeMin, volumeMax)
						           .between('length', lengthMin, lengthMax)
						           .between('width', widthMin, widthMax)
						           .between('height', heightMin, heightMax)
						           .lteOrNull('pallets', pallets)
						           .iLike('payload', payload)
						           .inArray('type', types)
						           .eq('status', status)
						           .fromFilter<ITransportFilter>(rest)
							       .query
						,
						offset,
						limit,
						order:   sortOrder,
						include: full ? this.include : []
					}
				);
			},
			{ id: 'getByDriverId' },
			{ driverId, listFilter, filter }
		);
	}

	public override async delete(id: string) {
		return this.log(
			async() => ({ affectedCount: await this.model.destroy({ where: { id } }) }),
			{ id: 'delete' },
			{ id }
		);
	}
}
