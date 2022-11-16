import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	IGatewayEvent,
	IGatewayEventFilter,
	IListFilter,
	IRepository,
	IRepositoryOptions
}                             from '@common/interfaces';
import { GatewayEvent }       from '@models/index';
import GenericRepository      from './generic';

export default class GatewayEventRepository
	extends GenericRepository<GatewayEvent, IGatewayEvent>
	implements IRepository {
	protected override readonly model = GatewayEvent;

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(GatewayEventRepository.name);
	}

	public async getList(
		listFilter?: IListFilter,
		filter?: IGatewayEventFilter
	): Promise<GatewayEvent[]> {
		return this.log(
			() =>
			{
				const {
					from: offset = 0,
					full = false,
					count: limit
				} = listFilter;
				const {
					sortOrder = DEFAULT_SORT_ORDER,
					...rest
				} = filter ?? {};

				return this.model.findAll(
					{
						where:   this.whereClause()
						             .fromFilter(<any>rest)
							         .query,
						offset,
						limit,
						include: full ? this.include
						              : undefined
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}
}
