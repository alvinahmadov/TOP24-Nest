import { Includeable }        from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	IUser,
	IRepository,
	IRepositoryOptions,
	IListFilter,
	IUserFilter
}                             from '@common/interfaces';
import {
	CargoCompany,
	CargoCompanyInn,
	Driver,
	Image,
	Order,
	Payment,
	Transport,
	User
}                             from '@models/index';
import GenericRepository      from './generic';

export default class UserRepository
	extends GenericRepository<User, IUser>
	implements IRepository {
	protected override readonly model = User;
	protected readonly include: Includeable[] = [
		{ model: CargoCompany },
		{ model: CargoCompanyInn }
	];
	protected readonly fullInclude: Includeable[] = [
		{
			model:   CargoCompany,
			include: [
				{
					model:   Driver,
					include: [
						{
							model:   Transport,
							include: [{ model: Image }]
						}
					]
				},
				{ model: Order },
				{ model: Payment },
				{
					model:   Transport,
					include: [{ model: Image }]
				}
			]
		},
		{
			model:   CargoCompanyInn,
			include: [
				{
					model:   Driver,
					include: [
						{
							model:   Transport,
							include: [{ model: Image }]
						}
					]
				},
				{ model: Order },
				{ model: Payment },
				{
					model:   Transport,
					include: [{ model: Image }]
				}
			]
		}
	];

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(UserRepository.name);
	}

	public override async get(
		id: string,
		full?: boolean
	) {
		return this.log(
			async() => this.model.findByPk(
				id,
				{
					rejectOnEmpty: false,
					include:       full ? this.fullInclude
					                    : this.include
				}
			),
			{ id: 'get' },
			{ id, full }
		);
	}

	public async getByPhone(phone: string, full?: boolean): Promise<User | null> {
		return this.log(
			() => this.model.findOne(
				{
					where:         this.whereClause()
					                   .eq('phone', phone)
						               .query,
					include:       !!full ? this.fullInclude
					                      : this.include,
					rejectOnEmpty: false
				}
			),
			{ id: 'getByPhone' },
			{ phone }
		);
	}

	public override async getList(
		listFilter?: IListFilter,
		filter?: IUserFilter
	): Promise<User[]> {
		return this.log(
			() =>
			{
				const {
					from: offset,
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
						include: full ? this.fullInclude
						              : this.include
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}
}
