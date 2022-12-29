import {
	IEntityFCM,
	IEntityFCMFilter,
	IRepository,
	IRepositoryOptions
}                        from '@common/interfaces';
import { EntityFCM }     from '@models/index';
import GenericRepository from '@repos/generic';

export default class EntityFCMRepository
	extends GenericRepository<EntityFCM, IEntityFCM>
	implements IRepository {
	protected override readonly model = EntityFCM;

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(EntityFCMRepository.name);
	}

	public async getByEntityId(entityId: string, filter?: IEntityFCMFilter) {
		const {
			passed24H,
			passed6H,
			passed1H,
			passedDistance,
			notPassed24H,
			notPassed6H,
			notPassed1H,
			notPassedDistance
		} = filter ?? {};

		return this.log(
			() => this.model.findOne(
				{
					where: this.whereClause()
					           .eq('entityId', entityId)
					           .eq('passed24H', passed24H)
					           .eq('passed6H', passed6H)
					           .eq('passed1H', passed1H)
					           .eq('passedDistance', passedDistance)
					           .notEq('passed24H', notPassed24H)
					           .notEq('passed6H', notPassed6H)
					           .notEq('passed1H', notPassed1H)
					           .notEq('passedDistance', notPassedDistance)
						       .query
				}
			),
			{ id: 'getByEntityId' },
			{ entityId }
		);
	}
}
