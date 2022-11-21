import { Includeable }        from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	ICargoCompany,
	ICargoCompanyFilter,
	ICompanyTransportFilter,
	IDriver,
	IListFilter,
	IRepositoryOptions,
	ITransport
}                             from '@common/interfaces';
import {
	convertBitrix,
	formatPhone
}                             from '@common/utils';
import {
	CargoCompany,
	CargoInnCompany,
	Driver,
	Image,
	Order,
	Payment,
	Transport
}                             from '@models/index';
import GenericRepository      from './generic';

export default class CargoCompanyRepository
	extends GenericRepository<CargoCompany, ICargoCompany> {
	protected override readonly model = CargoCompany;
	protected override readonly include: Includeable[] = [
		{
			model:   Driver,
			include: [
				{
					model:   Transport,
					include: [{ model: Image }]
				}
			]
		},
		{ model: Image },
		{ model: Payment },
		{ model: Order },
		{
			model:   Transport,
			include: [{ model: Image }]
		}
	];

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(CargoCompanyRepository.name);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: ICargoCompanyFilter
	): Promise<CargoCompany[]> {
		if(filter === null)
			return [];

		return this.log(
			async() =>
			{
				const { from: offset, count: limit, full } = listFilter;
				const { sortOrder, ...rest } = filter ?? {};

				return this.model.findAll(
					{
						where:   this.whereClause('or')
						             .fromFilter<ICargoCompanyFilter>(rest)
							         .query,
						order:   sortOrder ?? ['shortName'],
						offset,
						limit,
						include: full ? this.include : undefined
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}

	/**
	 * @link GenericRepository.get
	 * */
	public override async get(
		id: string,
		full?: boolean
	): Promise<CargoCompany | null> {
		return this.log(
			() => this.model.findByPk(
				id,
				{ include: full ? this.include : undefined }
			),
			{ id: 'get' },
			{ id, full }
		);
	}

	public async getTransports(
		listFilter: IListFilter,
		filter: ICompanyTransportFilter
	): Promise<CargoCompany[]> {
		return this.log(
			async() =>
			{
				const {
					from:  offset = 0,
					count: limit
				} = listFilter;

				let {
					sortOrder: order = DEFAULT_SORT_ORDER,
					hasDriver,
					isDedicated,
					types,
					paymentTypes,
					payloadCity,
					payloadRegion,
					payloadDate,
					...rest
				} = filter ?? {};

				if(types) {
					const transportTypes = types.map(t => convertBitrix('transportType', t, true));
					if(transportTypes.every(tt => tt !== undefined))
						types = transportTypes as string[];
				}

				if(paymentTypes) {
					const paymentTypesLocal = paymentTypes.map(pt => convertBitrix('paymentType', pt, true));
					if(paymentTypesLocal.every(pt => pt !== undefined)) {
						paymentTypes = paymentTypesLocal as string[];
					}
				}

				if(!!isDedicated) {
					switch(rest?.dedicated) {
						case 'Да':
							isDedicated = true;
							break;
						default:
							isDedicated = false;
							break;
					}
				}

				return this.model.findAll(
					{
						where:   this.whereClause('and')
						             .eq('id', rest?.cargoId)
						             .inArray('paymentType', paymentTypes, true)
							         .query,
						offset,
						limit,
						order,
						include: [
							{
								model: Driver,
								where: this.whereClause<IDriver>()
								           .eq('isReady', true)
								           .eq('payloadCity', payloadCity)
								           .eq('payloadRegion', payloadRegion)
								           .lte('payloadDate', payloadDate)
									       .query
							},
							{ model: Image },
							{ model: Payment },
							{ model: Order },
							{
								model:    Transport,
								where:    this.whereClause<ITransport>('and')
								              .notNull('driverId', !!hasDriver)
								              .iLike('payload', rest?.payload)
								              .inArray('type', types, true)
								              .contains('riskClasses', rest?.riskClass)
								              .eq('isDedicated', isDedicated)
								              .eq('payloadExtra', rest?.payloadExtra)
									          .query,
								order:    DEFAULT_SORT_ORDER,
								required: true,
								limit,
								include:  [
									{ model: Image },
									{
										model:   Driver,
										include: [
											{ model: CargoCompany },
											{ model: CargoInnCompany }
										]
									}
								]
							}
						]
					}
				);
			},
			{ id: 'getTransports' },
			{ listFilter, filter }
		);
	}

	public async getByPhone(
		phone: string,
		full?: boolean
	): Promise<CargoCompany | null> {
		return this.log(
			() => this.model.findOne(
				{
					where:   this.whereClause()
					             .in('phone', [phone, formatPhone(phone)])
						         .query,
					include: full ? this.include : []
				}
			),
			{ id: 'getByPhone' },
			{ phone }
		);
	}
}
