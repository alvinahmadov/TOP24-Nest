import { DEFAULT_SORT_ORDER } from '@common/constants';
import {
	IListFilter,
	IPayment,
	IPaymentFilter,
	IRepository,
	IRepositoryOptions,
	TAffectedRows,
	TCompanyIdOptions
}                             from '@common/interfaces';
import { Payment }            from '@models/index';
import GenericRepository      from './generic';

export default class PaymentsRepository
	extends GenericRepository<Payment, IPayment>
	implements IRepository {
	protected override readonly model = Payment;

	constructor(
		protected options: IRepositoryOptions = { log: true }
	) {
		super(PaymentsRepository.name);
	}

	/**
	 * @link GenericRepository.getList
	 * */
	public override async getList(
		listFilter: IListFilter,
		filter?: IPaymentFilter
	) {
		return this.log(
			async() =>
			{
				const {
					from: offset = 0,
					full = false,
					count: limit
				} = listFilter ?? {};
				const {
					sortOrder = DEFAULT_SORT_ORDER,
					...rest
				} = filter ?? {};

				return this.model.findAll(
					{
						where:   this.whereClause('and')
						             .fromFilter<IPaymentFilter>(rest)
							         .query,
						offset,
						limit,
						include: full ? [{ all: true }] : []
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}

	/**
	 * Get payment data by company id.
	 *
	 * @param companyIdOptions {Object} Object of id for company types.
	 * Only one allowed at a time.
	 * @param companyIdOptions.cargoId {String} Id of org. company.
	 * @param companyIdOptions.cargoinnId {String} Id of individual company.
	 *
	 * */
	public async getByCompany(companyIdOptions: TCompanyIdOptions)
		: Promise<Payment | null> {
		const { cargoId, cargoinnId } = companyIdOptions;
		return this.log(
			() => this.model.findOne<any>(
				{
					where: this.whereClause('or')
					           .nullOrEq('cargoId', cargoId)
					           .nullOrEq('cargoinnId', cargoinnId)
						       .query
				}),
			{ id: 'getByCompany' },
			{ companyIdOptions }
		);
	}

	public async deleteCompanyPayments(companyIdOptions: TCompanyIdOptions)
		: Promise<TAffectedRows> {
		const { cargoId, cargoinnId } = companyIdOptions;
		return this.log(
			async() => ({
				affectedCount: await this.model.destroy<any>(
					{
						where: this.whereClause('or')
						           .nullOrEq('cargoId', cargoId)
						           .nullOrEq('cargoinnId', cargoinnId)
							       .query
					})
			}),
			{ id: 'deleteCompanyPayments' },
			{ cargoId }
		);
	}
}
