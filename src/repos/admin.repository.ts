import {
	IAdmin,
	IRepository,
	IRepositoryOptions
}                        from '@common/interfaces';
import { formatPhone }   from '@common/utils';
import { Admin }         from '@models/index';
import GenericRepository from './generic';

export default class AdminRepository
	extends GenericRepository<Admin, IAdmin>
	implements IRepository {
	protected override readonly model = Admin;

	constructor(
		protected override options: IRepositoryOptions = { log: true }
	) {
		super(AdminRepository.name);
	}

	public async getByPhone(phone: string): Promise<Admin | null> {
		return this.log(
			() => this.model.findOne(
				{
					where:         this.whereClause()
					                   .in('phone', [phone, formatPhone(phone)])
						               .query,
					rejectOnEmpty: false
				}
			),
			{ id: 'getByPhone' },
			{ phone }
		);
	}

	public async getByEmail(email: string): Promise<Admin | null> {
		return this.log(
			() => this.model.findOne(
				{
					where:         { email },
					rejectOnEmpty: false
				}
			),
			{ id: 'getByEmail' },
			{ email }
		);
	}
}
