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

	public async getByEntityId(entityId: string) {
		return this.log(
			() => this.model.findOne(
				{
					where:         this.whereClause()
					                   .eq('entityId', entityId)
						               .query,
					rejectOnEmpty: false
				}
			),
			{ id: 'getByEntityId' },
			{ entityId }
		);
	}
}
