import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	IDestination,
	IDestinationFilter,
	IListFilter,
	IRepository,
	IRepositoryOptions
}                             from '@common/interfaces';
import { Destination }        from '@models/index';
import GenericRepository      from './generic';

export default class DestinationRepository
	extends GenericRepository<Destination, IDestination>
	implements IRepository {
	protected override readonly model = Destination;

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(DestinationRepository.name);
	}

	/**
	 * @link GenericRepository.get
	 * */
	public override async get(
		id: string
	): Promise<Destination | null> {
		return this.log(
			() => this.model.findOne({ where: { id }, rejectOnEmpty: false }),
			{ id: 'get' },
			{ id }
		);
	}

	public async getByPoint(point: string) {
		return this.log(
			() => this.model.findOne({ where: { point }, rejectOnEmpty: false }),
			{ id: 'getByPoint' },
			{ point }
		);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: IDestinationFilter
	): Promise<Destination[]> {
		if(filter === null)
			return [];

		const {
			from:  offset,
			count: limit
		} = listFilter ?? {};
		const {
			sortOrder: order = DEFAULT_SORT_ORDER,
			fromDate, toDate,
			distanceMin, distanceMax,
			...rest
		} = filter ?? {};

		return this.log(
			() => this.model.findAll(
				{
					where: this.whereClause('and')
					           .eq('orderId', rest?.orderId)
					           .eq('point', rest?.point)
					           .eq('fulfilled', rest?.fulfilled)
					           .eq('date', rest?.date)
					           .period('date', fromDate, toDate)
					           .between('distance', distanceMin, distanceMax)
					           .iLike('contact', rest?.contact)
					           .fromFilter<IDestinationFilter>(rest, 'eq')
						       .query,
					offset,
					order,
					limit
				}
			),
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}

	public async getOrderDestination(
		orderId: string,
		filter: IDestinationFilter
	): Promise<Destination> {
		const {
			fromDate, toDate,
			distanceMin, distanceMax,
			...rest
		} = filter;

		return this.log(
			() => this.model.findOne(
				{
					where: this.whereClause('and')
					           .eq('orderId', orderId)
					           .period('date', fromDate, toDate)
					           .between('distance', distanceMin, distanceMax)
					           .fromFilter(rest, 'eq')
						       .query
				}
			),
			{ id: 'getOrderDestination' },
			{ orderId, filter }
		);
	}
}
