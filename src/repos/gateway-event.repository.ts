import {
	IGatewayEvent,
	IGatewayEventFilter,
	IListFilter,
	IRepository,
	IRepositoryOptions
}                        from '@common/interfaces';
import { GatewayEvent }  from '@models/index';
import GenericRepository from './generic';

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
					count: limit
				} = listFilter;
				const {
					sortOrder = [['created_at', 'ASC'], ['updated_at', 'ASC']],
					sources,
					events,
					message,
					source,
					...rest
				} = filter ?? {};

				return this.model.findAll(
					{
						where: this.whereClause('and')
						           .in('eventName', events)
						           .in('source', sources)
						           .eq('hasSeen', rest.hasSeen)
							       .query,
						offset,
						limit
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}
}
