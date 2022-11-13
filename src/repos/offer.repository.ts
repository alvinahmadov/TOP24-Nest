import { Includeable, Op }              from 'sequelize';
import { DEFAULT_SORT_ORDER }           from '@common/constants';
import { OrderStatus, TransportStatus } from '@common/enums';
import {
	IDriver,
	IDriverFilter,
	IListFilter,
	IOffer,
	IOfferFilter,
	IOrder,
	IOrderFilter,
	IRepository,
	IRepositoryOptions,
	ITransport,
	TUpdateAttribute
}                                       from '@common/interfaces';
import {
	CargoCompany,
	CargoInnCompany,
	Driver,
	Offer,
	Order,
	Transport
}                                       from '@models/index';
import GenericRepository                from './generic';

export default class OfferRepository
	extends GenericRepository<Offer, IOffer>
	implements IRepository {
	protected override readonly model = Offer;
	protected override readonly include: Includeable[] = [
		{
			model:   Driver,
			include: [{ model: Transport, include: [{ all: true }] }]
		},
		{
			model:   Order,
			include: [{ model: Driver }]
		}
	];

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(OfferRepository.name);
	}

	/**
	 * @link GenericRepository.get
	 * */
	public override async get(
		id: string,
		full?: boolean
	): Promise<Offer | null> {
		return this.log(
			() => this.model.findByPk(
				id,
				{ include: full ? this.include : [] }
			),
			{ id: 'get' },
			{ id }
		);
	}

	public async getByAssociation(
		orderId: string,
		driverId: string
	): Promise<Offer | null> {
		return this.log(
			() => this.model.findOne(
				{
					where:   this.whereClause()
					             .eq('orderId', orderId)
					             .eq('driverId', driverId)
						         .query,
					order:   DEFAULT_SORT_ORDER,
					include: [
						{
							model:   Driver,
							include: [
								{
									model: Transport,
									where: this.whereClause<ITransport>()
									           .eq('status', TransportStatus.ACTIVE)
										       .query
								},
								{
									model:    Order,
									required: false,
									where:    this.whereClause<IOrder>()
									              .eq('status', OrderStatus.PROCESSING)
										          .query
								}
							]
						},
						{ model: Order }
					]
				}
			),
			{ id: 'getByAssociation' },
			{ orderId, driverId }
		);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: IOfferFilter
	): Promise<Offer[]> {
		if(filter === null)
			return [];

		return this.log(
			() =>
			{
				const {
					from:  offset = 0,
					count: limit,
					full = false
				} = listFilter ?? {};
				const {
					sortOrder = DEFAULT_SORT_ORDER,
					strict = false,
					orderStatus,
					driverStatus,
					transportStatus,
					hasComment,
					...rest
				} = filter ?? {};

				return this.model.findAll(
					{
						where:   this.whereClause()
						             .fromFilter(rest)
							         .query,
						offset,
						order:   sortOrder,
						include: full ? [
							{
								model:   Driver,
								where:   this.whereClause<IDriver>()
								             .eq('status', driverStatus)
									         .query,
								include: [
									{
										model: Transport,
										where: this.whereClause<ITransport>()
										           .eq('status', transportStatus)
											       .query
									},
									{ model: CargoCompany },
									{ model: CargoInnCompany }
								]
							},
							{
								model:   Order,
								include: [{ model: Driver }]
							}
						] : [],
						limit
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}

	public async getOrderDrivers(
		orderId: string,
		listFilter: IListFilter = {},
		filter?: IOfferFilter & IDriverFilter
	): Promise<Offer[]> {
		const {
			from:  offset = 0,
			count: limit
		} = listFilter ?? {};
		const {
			sortOrder: order = DEFAULT_SORT_ORDER,
			driverStatus,
			statuses,
			orderStatus,
			...rest
		} = filter ?? {};

		return this.log(
			() => this.model.findAll(
				{
					where:   this.whereClause('and')
					             .eq('orderId', orderId)
					             .eq('orderStatus', orderStatus)
						         .query,
					offset,
					limit,
					order,
					include: [
						{
							model:   Driver,
							where:   this.whereClause<IDriver>('or')
							             .eq('status', driverStatus)
							             .in('status', statuses)
								         .query,
							include: [
								{
									model: Transport,
									where: this.whereClause<ITransport>()
									           .eq('status', rest?.transportStatus)
										       .query
								}
							]
						}
					]
				}
			),
			{ id: 'getOrderDrivers' },
			{ orderId, listFilter, filter }
		);
	}

	public async getOrderTransports(
		orderId: string,
		listFilter: IListFilter = {},
		filter?: Pick<IOfferFilter, 'transportStatus'> & IDriverFilter
	): Promise<Offer[]> {
		const {
			from:  offset = 0,
			count: limit
		} = listFilter;

		const {
			sortOrder: order = DEFAULT_SORT_ORDER,
			orderStatus,
			transportStatus
		} = filter ?? {};

		return this.log(
			() => this.model.findAll(
				{
					where:   this.whereClause('and')
					             .eq('orderId', orderId)
					             .eq('orderStatus', orderStatus)
						         .query,
					offset,
					limit,
					order,
					include: [
						{
							model:    Driver,
							order:    DEFAULT_SORT_ORDER,
							required: true,
							include:  [
								{
									model:   Transport,
									where:   this.whereClause<ITransport>()
									             .eq('status', transportStatus)
										         .query,
									order:   DEFAULT_SORT_ORDER,
									include: [{ all: true }]
								}
							]
						},
						{
							model: Order,
							order: DEFAULT_SORT_ORDER
						}
					]
				}
			),
			{ id: 'getOrderTransports' },
			{ orderId, listFilter, filter }
		);
	}

	public async getDriverOrders(
		driverId: string,
		listFilter: IListFilter,
		filter?: IOfferFilter & IOrderFilter
	): Promise<Offer[]> {
		return this.log(
			() =>
			{
				const {
					from:  offset = 0,
					count: limit
				} = listFilter;
				const {
					sortOrder: order = DEFAULT_SORT_ORDER,
					orderId,
					driverStatus,
					status,
					orderStatus,
					statuses,
					hasComment,
					...rest
				} = filter;

				return this.model.findAll(
					{
						where:   this.whereClause('and')
						             .eq('driverId', driverId)
						             .eq('orderStatus', orderStatus)
							         .query,
						offset,
						limit,
						order,
						include: [
							{
								model: Order,
								order: DEFAULT_SORT_ORDER,
								where: this.whereClause<IOrder>('and')
								           .eq('id', orderId)
								           .nullOrEq('cargoId', rest?.cargoId)
								           .nullOrEq('cargoinnId', rest?.cargoinnId)
								           .between('weight', rest?.weightMin, rest?.weightMax)
								           .between('volume', rest?.volumeMin, rest?.volumeMax)
								           .between('length', rest?.lengthMin, rest?.lengthMax)
								           .between('height', rest?.heightMin, rest?.heightMax)
								           .between('pallets', 0, rest?.pallets)
								           .gteOrNull('bidPrice', rest?.bidPrice)
								           .lteOrNull('bidPriceVat', rest?.bidPriceVat)
								           .inArray('status', statuses)
								           .fromFilter<IOrderFilter>(rest)
									       .query
							},
							{
								model:    Driver,
								required: false,
								include:  [{ model: Transport }]
							}
						]
					}
				);
			},
			{ id: 'getDriverOrders' },
			{ driverId, listFilter, filter }
		);
	}

	public async updateDrivers(
		offers: TUpdateAttribute<IOffer>[]
	): Promise<{ affectedCount: number }> {
		return this.log(
			async() =>
			{
				const [affectedCount = 0] = await Promise.all(
					offers.map(
						(offer) =>
						{
							const {
								orderId,
								driverId,
								orderStatus,
								bidPrice,
								bidPriceVat,
								bidComment
							} = offer;

							return this.model.update(
								offer,
								{
									where: {
										[Op.and]: [
											{ orderId },
											{ driverId },
											{
												[Op.or]: [
													{ orderStatus: { [Op.ne]: orderStatus } },
													{ bidPrice: { [Op.ne]: bidPrice } },
													{ bidPriceVat: { [Op.ne]: bidPriceVat } },
													{ bidComment: { [Op.notLike]: bidComment } }
												]
											}
										]
									}
								}
							);
						}
					)
				).then(
					affected => affected.reduce(
						(p, c) =>
						{
							const prev = p[0];
							const curr = c[0];
							return [prev + curr];
						}, [0]
					)
				);

				return { affectedCount };
			},
			{ id: 'updateDrivers' },
			{ data: offers }
		);
	}
}
