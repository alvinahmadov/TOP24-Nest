import { Includeable }        from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	ICargoInnCompany,
	ICargoCompanyInnFilter,
	ICompanyTransportFilter,
	IDriver,
	IRepositoryOptions,
	ITransport,
	IListFilter
}                             from '@common/interfaces';
import {
	convertBitrix,
	formatPhone
}                             from '@common/utils';
import {
	CargoInnCompany,
	Driver,
	Image,
	Order,
	Payment,
	Transport
}                             from '@models/index';
import GenericRepository      from './generic';

export default class CargoInnCompanyRepository
	extends GenericRepository<CargoInnCompany, ICargoInnCompany> {
	protected override readonly model = CargoInnCompany;
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
			include: [{ all: true }]
		}
	];

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(CargoInnCompanyRepository.name);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: ICargoCompanyInnFilter
	): Promise<CargoInnCompany[]> {
		return this.log(
			() =>
			{
				const {
					from: offset = 0,
					full = false,
					count: limit
				} = listFilter ?? {};

				const {
					sortOrder: order = DEFAULT_SORT_ORDER,
					...        rest
				} = filter ?? {};

				return this.model.findAll(
					{
						where:   this.whereClause()
						             .fromFilter(rest)
							         .query,
						order,
						offset,
						limit,
						include: full ? this.include : []
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
	): Promise<CargoInnCompany | null> {
		return this.log(
			() => this.model.findByPk(
				id,
				{ include: full ? this.include : [] }
			),
			{ id: 'get' },
			{ id }
		);
	}

	public async getTransports(
		listFilter: IListFilter,
		filter?: ICompanyTransportFilter
	): Promise<CargoInnCompany[]> {
		return this.log(
			() =>
			{
				const {
					from:  offset = 0,
					count: limit
				} = listFilter;
				let {
					sortOrder = DEFAULT_SORT_ORDER,
					hasDriver,
					types,
					paymentTypes,
					isDedicated,
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
						             .eq('id', rest?.cargoinnId)
						             .inArray('paymentType', paymentTypes, true)
							         .query,
						offset,
						limit,
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
								order:    sortOrder,
								required: true,
								include:  [
									{ model: Image },
									{ model: Driver }
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
	): Promise<CargoInnCompany | null> {
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
