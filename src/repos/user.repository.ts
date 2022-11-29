import {
	IUser,
	IRepository,
	IRepositoryOptions
}                                              from '@common/interfaces';
import { formatPhone }                         from '@common/utils';
import { CargoCompany, CargoInnCompany, User } from '@models/index';
import GenericRepository                       from './generic';
import { Includeable }                         from 'sequelize';

export default class UserRepository
	extends GenericRepository<User, IUser>
	implements IRepository {
	protected override readonly model = User;
	protected override readonly include: Includeable[] = [
		{ model: CargoCompany },
		{ model: CargoInnCompany }
	];

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(UserRepository.name);
	}

	public async getByPhone(phone: string, full?: boolean): Promise<User | null> {
		return this.log(
			() => this.model.findOne(
				{
					where:         this.whereClause()
					                   .eq('phone', phone)
						               .query,
					include:       !!full ? this.include : [],
					rejectOnEmpty: false
				}
			),
			{ id: 'getByPhone' },
			{ phone }
		);
	}
}
