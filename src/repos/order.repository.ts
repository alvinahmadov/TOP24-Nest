import { Includeable }        from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	OrderStatus,
	TransportStatus
}                             from '@common/enums';
import {
	IListFilter,
	IOrder,
	IOrderFilter,
	IRepository,
	IRepositoryOptions,
	ITransport
}                             from '@common/interfaces';
import {
	CargoCompany,
	CargoInnCompany,
	Driver,
	Image,
	Order,
	Transport
}                             from '@models/index';
import GenericRepository      from './generic';

export default class OrderRepository
	extends GenericRepository<Order, IOrder>
	implements IRepository {
	protected override readonly model = Order;
	protected override readonly include: Includeable[] = [
		{
			model:   CargoCompany,
			include: [
				{
					model:   Transport,
					include: [
						{ model: Image },
						{ model: Driver }
					]
				},
				{ model: Driver }
			]
		},
		{
			model:   CargoInnCompany,
			include: [
				{
					model:   Transport,
					include: [
						{ model: Image },
						{ model: Driver }
					]
				},
				{ model: Driver }
			]
		},
		{
			model:   Driver,
			include: [{ model: Transport }]
		}
	];

	constructor(
		protected override options: IRepositoryOptions = { log: true }
	) {
		super(OrderRepository.name);
	}

	/**
	 * @link GenericRepository.get
	 * */
	public override async get(
		id: string,
		full?: boolean
	): Promise<Order | null> {
		return this.log(
			() => this.model.findOne(
				{
					where:   { id },
					include: full ? this.include : []
				}
			),
			{ id: 'get' },
			{ id }
		);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: IOrderFilter
	): Promise<Order[]> {
		return this.log(
			() =>
			{
				const {
					from: offset = 0,
					full = false,
					count: limit
				} = listFilter ?? {};
				const {
					sortOrder: order = DEFAULT_SORT_ORDER,
					statuses,
					weightMin, weightMax,
					volumeMin, volumeMax,
					lengthMin, lengthMax,
					heightMin, heightMax,
					...rest
				} = filter ?? {};
				if(statuses) {
					if(
						rest?.status !== undefined &&
						!statuses.includes(rest.status)
					)
						statuses.push(rest?.status);
					rest.status = undefined;
				}

				return this.model.findAll(
					{
						where:   this.whereClause('and', true)
						             .nullOrEq('cargoId', rest?.cargoId)
						             .nullOrEq('cargoinnId', rest?.cargoinnId)
						             .nullOrEq('driverId', rest?.driverId)
						             .inArray('status', statuses)
						             .between('weight', weightMin, weightMax)
						             .between('volume', volumeMin, volumeMax)
						             .between('length', lengthMin, lengthMax)
						             .between('height', heightMin, heightMax)
						             .eq('isFree', rest?.isFree)
						             .eq('isOpen', rest?.isOpen)
						             .eq('isBid', rest?.isBid)
						             .eq('date', rest?.date)
						             .nullOrEq('price', rest?.price)
						             .between('pallets', 0, rest?.pallets)
						             .gteOrNull('bidPrice', rest?.bidPrice)
						             .lteOrNull('bidPriceVat', rest?.bidPriceVat)
						             .iLikeOrNull('payload', rest?.payload)
						             .iLikeOrNull('paymentType', rest?.paymentType)
						             .fromFilter<IOrderFilter>(rest, 'eq')
							         .query,
						offset,
						order,
						limit,
						include: full ? this.include : []
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}

	public async getWithDriver(id: string): Promise<Order> {
		return this.log(
			() => this.model.findOne(
				{
					where:         this.whereClause('and')
					                   .eq('driverId', id)
					                   .inArray('status', [
						                   OrderStatus.ACCEPTED,
						                   OrderStatus.PROCESSING
					                   ])
						               .query,
					order:         DEFAULT_SORT_ORDER,
					include:       [
						{
							model:   Driver,
							include: [
								{
									model:   Transport,
									where:   this.whereClause<ITransport>()
									             .eq('status', TransportStatus.ACTIVE)
										         .query,
									include: [{ model: Image }]
								}
							]
						}
					],
					rejectOnEmpty: false
				}
			),
			{ id: 'getWithDriver' },
			{ id }
		);
	}

	/**
	 * Get list of orders.
	 *
	 * @description Get list of orders that belong to cargo company with specified id.
	 *
	 * @param {String!} cargoId Id of cargo to get orders of.
	 * @param {IListFilter} listFilter List filters.
	 *
	 * @return {Array<Order>} list of orders of company.
	 * */
	public async getCargoList(
		cargoId: string,
		listFilter: IListFilter
	): Promise<Order[]> {
		return this.log(
			() =>
			{
				const {
					from: offset = 0,
					full = false,
					count: limit
				} = listFilter ?? {};

				return this.model.findAll(
					{
						where:   this.whereClause('and')
						             .nullOrEq('cargoId', cargoId)
						             .nullOrEq('cargoinnId', cargoId)
							         .query,
						offset,
						limit,
						include: full ? this.include : []
					}
				);
			},
			{ id: 'getCargoList' },
			{ cargoId }
		);
	}
}
