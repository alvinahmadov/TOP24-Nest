import { Includeable }        from 'sequelize';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	ICargoCompanyInn,
	ICargoCompanyInnFilter,
	ICompanyTransportFilter,
	IDriver,
	IRepositoryOptions,
	ITransport,
	IListFilter
}                             from '@common/interfaces';
import { convertBitrix }      from '@common/utils';
import {
	CargoCompanyInn,
	Driver,
	Image,
	Order,
	Payment,
	Transport
}                             from '@models/index';
import GenericRepository      from './generic';

export default class CargoInnCompanyRepository
	extends GenericRepository<CargoCompanyInn, ICargoCompanyInn> {
	protected override readonly model = CargoCompanyInn;
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
		{ model: Order },
		{ model: Payment },
		{
			model:   Transport,
			include: [{ model: Image }]
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
	): Promise<CargoCompanyInn[]> {
		if(filter === null)
			return [];

		const { from: offset = 0, full = false, count: limit } = listFilter ?? {};
		const { sortOrder: order = DEFAULT_SORT_ORDER, ...rest } = filter ?? {};

		return this.log(
			() => this.model.findAll(
				{
					where:   this.whereClause()
					             .fromFilter(rest)
						         .query,
					order,
					offset,
					limit,
					include: full ? this.include : undefined
				}
			),
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
	): Promise<CargoCompanyInn | null> {
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
		filter?: ICompanyTransportFilter
	): Promise<CargoCompanyInn[]> {
		const {
			from:  offset = 0,
			count: limit
		} = listFilter;

		let {
			sortOrder: order = DEFAULT_SORT_ORDER,
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

		return this.log(
			() => this.model.findAll(
				{
					where:   this.whereClause('and')
					             .eq('id', rest?.cargoinnId)
					             .eq('isDefault', true)
					             .inArray('paymentType', paymentTypes, true)
						         .query,
					offset,
					limit,
					order,
					include: [
						{
							model:   Transport,
							where:   this.whereClause<ITransport>('and')
							             .notNull('driverId', !!hasDriver)
							             .inArray('type', types, true)
							             .eq('payloadExtra', rest?.payloadExtra)
								         .query,
							order:   DEFAULT_SORT_ORDER,
							include: [
								{
									model:    Driver,
									where:    this.whereClause<IDriver>()
									              .eq('isReady', true)
									              .iLike('payloadCity', payloadCity)
									              .iLike('payloadRegion', payloadRegion)
									              .lte('payloadDate', payloadDate)
										          .query,
									required: false,
									include:  [{ model: Order }]
								},
								{ model: Image }
							]
						}
					]
				}
			),
			{ id: 'getTransports' },
			{ listFilter, filter }
		);
	}
}
