import { Includeable, Op }    from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	OfferStatus,
	OrderStatus,
	TransportStatus
}                             from '@common/enums';
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
	TAffectedRows,
	TOfferTransportFilter,
	TUpdateAttribute
}                             from '@common/interfaces';
import {
	CargoCompany,
	CargoCompanyInn,
	Driver,
	Image,
	Offer,
	Order,
	Transport
}                             from '@models/index';
import GenericRepository      from './generic';

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

		const {
			from:  offset = 0,
			count: limit,
			full = false
		} = listFilter ?? {};
		const {
			sortOrder = DEFAULT_SORT_ORDER,
			strict = false,
			orderStatus,
			driverIds,
			driverStatus,
			transportStatus,
			hasComment,
			orderStatuses,
			statuses,
			...rest
		} = filter ?? {};

		return this.log(
			() =>
			{
				return this.model.findAll(
					{
						where:   {
							...this.whereClause('and')
							       .eq('driverId', rest?.driverId)
							       .eq('orderId', rest?.orderId)
							       .eq('status', rest?.status)
							       .eq('orderStatus', orderStatus)
							       .in('driverId', driverIds)
							       .in('orderStatus', orderStatuses)
							       .in('status', statuses)
								   .query ?? {}
						},
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
									{ model: CargoCompanyInn }
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
		filter?: TOfferTransportFilter
	): Promise<Offer[]> {
		const {
			from:  offset,
			count: limit
		} = listFilter;

		const {
			sortOrder: order = DEFAULT_SORT_ORDER,
			transportStatus,
			orderStatuses,
			offerStatuses
		} = filter ?? {};

		return this.log(
			() => this.model.findAll(
				{
					where:   {
						orderId: { [Op.eq]: orderId },
						[Op.or]: [
							{ orderStatus: { [Op.in]: orderStatuses } },
							{ status: { [Op.in]: offerStatuses } }
						]
					},
					offset,
					limit,
					order,
					include: [
						{
							model:    Driver,
							order:    DEFAULT_SORT_ORDER,
							required: true,
							include:  [
								{ model: CargoCompany },
								{ model: CargoCompanyInn },
								{
									model:   Transport,
									where:   this.whereClause<ITransport>()
									             .eq('status', transportStatus)
										         .query,
									order:   DEFAULT_SORT_ORDER,
									include: [{ model: Image }]
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
		filter?: IOfferFilter & Omit<IOrderFilter, 'status' | 'statuses'>
	): Promise<Offer[]> {
		return this.log(
			() =>
			{
				const {
					from:  offset = 0,
					count: limit
				} = listFilter;
				const {
					sortOrder: order = [['order_status', 'ASC'], ['status', 'ASC']],
					orderId,
					driverStatus,
					status,
					orderStatus,
					statuses = [
						OfferStatus.SENT,
						OfferStatus.SEEN,
						OfferStatus.RESPONDED,
						OfferStatus.CANCELLED
					],
					orderStatuses,
					hasComment,
					...rest
				} = filter;

				return this.model.findAll(
					{
						where:   this.whereClause('and')
						             .eq('driverId', driverId)
						             .eq('status', status)
						             .in('status', statuses)
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
								           .in('status', orderStatuses)
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
	): Promise<TAffectedRows> {
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
