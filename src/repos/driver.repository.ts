import { Includeable }        from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	IDriver,
	IDriverFilter,
	IListFilter,
	IOrder,
	IRepository,
	IRepositoryOptions,
	ITransport,
	ITransportFilter
}                             from '@common/interfaces';
import { formatPhone }        from '@common/utils';
import {
	CargoCompany,
	CargoCompanyInn,
	Driver,
	Image,
	Order,
	Transport
}                             from '@models/index';
import GenericRepository      from './generic';

const driverDefaultIncludeables: Includeable[] = [
	{
		model:      CargoCompany,
		attributes: ['name', 'legalName', 'userPhone', 'avatarLink']
	},
	{
		model:      CargoCompanyInn,
		attributes: ['name', 'patronymic', 'lastName', 'userPhone', 'avatarLink']
	}
];

export default class DriverRepository
	extends GenericRepository<Driver, IDriver>
	implements IRepository {
	protected override readonly model = Driver;
	protected override include: Includeable[] = [
		{ model: CargoCompany },
		{ model: CargoCompanyInn },
		{ model: Order },
		{
			model:   Transport,
			include: [{ model: Image }]
		}
	];

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(DriverRepository.name);
	}

	public override async get(id: string, full?: boolean): Promise<Driver | null> {
		return this.log(
			async() => this.model.findByPk(
				id,
				{
					rejectOnEmpty: false,
					include:       full ? this.include : driverDefaultIncludeables
				}
			),
			{ id: 'get' },
			{ id, full }
		);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: IDriverFilter
	): Promise<Driver[]> {
		if(filter === null)
			return [];

		let {
			from: offset = 0,
			full = false,
			count: limit
		} = listFilter ?? {};

		let {
			term,
			strict = true,
			sortOrder = DEFAULT_SORT_ORDER,
			orderStatus,
			name,
			patronymic,
			lastName,
			registrationAddress,
			currentAddress,
			address,
			statuses,
			payloadDate,
			isReady,
			...rest
		} = filter ?? {};
		let hasTerm: boolean = term !== undefined && term !== '';

		if(hasTerm) {
			full = true;
			strict = false;
		}
		const conjunct: 'and' | 'or' | null = (strict === undefined || strict === true) ? 'and' : 'or';

		const includables: Includeable[] = [...driverDefaultIncludeables];

		if(orderStatus !== undefined)
			includables.push({
				model:    Order,
				required: false,
				where:    this.whereClause<IOrder>().eq('status', orderStatus).query
			});

		return this.log(
			() => this.model.findAll(
				{
					where:   hasTerm
									 ? this.whereClause(conjunct)
												 .eq('cargoId', rest?.cargoId)
												 .eq('cargoinnId', rest?.cargoinnId)
												 .eq('isReady', isReady)
												 .lte('payloadDate', payloadDate)
												 .in('status', statuses)
										 .query
									 : this.whereClause(conjunct)
												 .eq('isReady', isReady)
												 .in('phone', [rest?.phone, formatPhone(rest?.phone)])
												 .iLike('name', name)
												 .iLike('patronymic', patronymic)
												 .iLike('lastName', lastName)
												 .iLike('address', address)
												 .iLike('registrationAddress', registrationAddress)
					               .iLike('currentAddress', currentAddress)
					               .lte('payloadDate', payloadDate)
					               .in('status', statuses)
					               .fromFilter(rest as IDriverFilter, 'eq')
						         .query,
					offset,
					limit,
					include: (!!full) ? [
						{ model: CargoCompany },
						{ model: CargoCompanyInn },
						{
							model:   Transport,
							include: [{ model: Image }]
						},
						{
							model:    Order,
							required: false,
							where:    this.whereClause<IOrder>().eq('status', orderStatus).query
						}
					] : includables
				}
			),
			{ id: 'getList' },
			{
				listFilter,
				filter
			}
		);
	}

	public async getByTransports(
		filter: ITransportFilter & { driverIds?: string[] } = {}
	): Promise<Driver[]> {
		return this.log(
			async() =>
			{
				let drivers: Driver[] = [];

				try {
					drivers = await this.model.findAll(
						{
							where:   this.whereClause('and')
							             .eq('isReady', true)
							             .inArray('id', filter?.driverIds)
								         .query,
							include: [
								...driverDefaultIncludeables,
								{
									model:    Transport,
									required: true,
									where:    this.whereClause<ITransport>()
									              .between('weight', filter?.weightMin, filter?.weightMax)
									              .between('volume', filter?.volumeMin, filter?.volumeMax)
									              .between('length', filter?.lengthMin, filter?.lengthMax)
									              .between('width', filter?.widthMin, filter?.widthMax)
									              .between('height', filter?.heightMin, filter?.heightMax)
									              .gte('pallets', filter?.pallets)
									              .inArray('payloads', filter?.payloads, true)
									              .inArray('type', filter?.types, true)
									              .eq('status', filter?.status)
									              .eq('isDedicated', filter?.isDedicated)
										          .query
								}
							]
						}
					);
				} catch(e) {
					this.logger.error(e);
				}
				return drivers;
			},
			{ id: 'getByTransports' },
			{ filter }
		);
	}
}
