import { Includeable }        from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	IDriver,
	IDriverFilter,
	IListFilter,
	IRepository,
	IRepositoryOptions,
	ITransport,
	ITransportFilter
}                             from '@common/interfaces';
import { formatPhone }        from '@common/utils';
import {
	CargoCompany,
	CargoInnCompany,
	Driver,
	Image,
	Order,
	Transport
}                             from '@models/index';
import GenericRepository      from './generic';

export default class DriverRepository
	extends GenericRepository<Driver, IDriver>
	implements IRepository {
	protected override readonly model = Driver;
	protected override include: Includeable[] = [
		{ model: CargoCompany },
		{ model: CargoInnCompany },
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

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: IDriverFilter
	): Promise<Driver[]> {
		if(filter === null)
			return [];

		return this.log(
			async() =>
			{
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
					...rest
				} = filter ?? {};

				let hasTerm: boolean = term !== undefined && term !== '';

				if(statuses && statuses.includes(1)) {
					rest.isReady = true;
				}

				if(hasTerm) {
					full = true;
					strict = false;
					statuses = statuses.filter((s: number) => s !== 4);
				}

				const conjunct: 'and' | 'or' | null = (strict === undefined ||
				                                       strict === true) ? 'and' : 'or';

				return this.model.findAll(
					{
						where:   hasTerm
						         ? this.whereClause()
						               .eq('cargoId', rest?.cargoId)
						               .eq('cargoinnId', rest?.cargoinnId)
						               .lte('payloadDate', payloadDate)
						               .eq('isReady', rest?.isReady)
						               .in('status', statuses)
							         .query
						         : this.whereClause(conjunct)
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
							{ model: CargoInnCompany },
							{
								model:   Transport,
								include: [{ model: Image }]
							},
							{ model: Order }
						] : []
					}
				);
			},
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
									              .iLike('payload', filter?.payload)
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
