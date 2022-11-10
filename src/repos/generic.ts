import { Model }              from 'sequelize-typescript';
import {
	FindOrCreateOptions,
	Includeable,
	WhereOptions,
	ModelStatic
}                             from 'sequelize';
import { Logger }             from '@nestjs/common';
import { DEFAULT_SORT_ORDER } from '@common/constants';
import { WhereClause }        from '@common/classes';
import {
	IApiResponse,
	IModel,
	IListFilter,
	ILoggable,
	IRepository,
	IRepositoryOptions,
	TAffectedRows,
	TCreationAttribute,
	TLoggerCallback,
	TLogIdentifier,
	TModelFilter,
	TUpdateAttribute
}                             from '@common/interfaces';

/**@ignore*/
type TResponseKey = 'create' | 'update' | 'delete' | string;

/**@ignore*/
function expandModel(model: Model | any) {
	if(model instanceof Model)
		return model.get({ plain: true, clone: false });
	return model;
}

/**
 * Base generic repository class.
 *
 * @implements IRepository
 * @implements ILoggable
 * */
export class GenericRepository<M extends Model, Attribute extends IModel>
	implements IRepository, ILoggable {
	protected options?: IRepositoryOptions = { log: true };
	/**
	 * @ignore
	 * */
	declare attributes: Attribute;
	public readonly logger: Logger;
	protected readonly model: ModelStatic<M>;
	protected readonly include: Includeable[] = [];
	protected responseRecord: Record<string, IApiResponse<null>> = {};

	protected constructor(name: string = GenericRepository.name) {
		this.logger = new Logger(name, { timestamp: true });
	}

	public get count() {
		return this.model.count();
	}

	public get tableName() {
		return this.model.tableName;
	}

	/**
	 * Searches item by primary key
	 *
	 * @param {string} id: UUID identifier of item to be found.
	 * @param {boolean} full Include models.
	 * */
	public async get(id: string, full?: boolean): Promise<M | null> {
		return this.log(
			async() => this.model.findByPk(
				id,
				{
					rejectOnEmpty: false,
					include:       full ? this.include : []
				}
			),
			{ id: 'get' },
			{ id, full }
		);
	}

	/**
	 * Searches items by filters
	 *
	 * @param {IListFilter} listFilter Filter parameters. Default value: { from: 0, count: 10 }
	 * @param {TModelFilter} filter Filter for model fields
	 *
	 * @return Array<M> List of found and filtered items otherwise empty list
	 * */
	public async getList(
		listFilter?: IListFilter,
		filter?: TModelFilter<Attribute>
	): Promise<M[]> {
		return this.log(
			() =>
			{
				const {
					from: offset = 0,
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
						include: full ? this.include
						              : undefined
					}
				);
			},
			{ id: 'getList' },
			{ listFilter, filter }
		);
	}

	/**
	 * Searches item by CRM identifier.
	 *
	 * @param {Number!} crmId CRM identifier for item.
	 * @param {Boolean} full Inject also dependent childs.
	 *
	 * @return M | null Found model item.
	 * */
	public async getByCrmId(
		crmId: number,
		full?: boolean
	): Promise<M | null> {
		return this.log(
			() => this.model.findOne<any>(
				{
					where:         { crmId },
					rejectOnEmpty: false,
					include:       !!full ? this.include : []
				}
			),
			{ id: 'getByCrmId' },
			{ crmId }
		);
	}

	/**
	 * Creates a new item.
	 *
	 * @param dto {TCreationAttribute} DTO to save to database.
	 * */
	public async create(dto: TCreationAttribute<Attribute>)
		: Promise<M | null> {
		return this.log(
			() => this.model.create<any>(dto, { returning: true }),
			{ id: 'create' },
			{ dto }
		);
	}

	/**
	 * Bulk creation of objects in database.
	 *
	 * @param data {TCreationAttribute[]} List of objects to save in database.
	 * */
	public async bulkCreate(
		data: Array<TCreationAttribute<Attribute>>
	): Promise<M[]> {
		return this.log(
			() => this.model.bulkCreate<any>(data, { returning: true }),
			{ id: 'bulkCreate' },
			{ data }
		);
	}

	public async findOrCreate(
		options: FindOrCreateOptions<Attribute, M['_creationAttributes']>
	): Promise<[M, boolean]> {
		return this.log(
			async() =>
			{
				if(options.returning === undefined)
					options.returning = true;

				return this.model.findOrCreate<any>(options);
			},
			{ id: 'findOrCreate' },
			{ data: options }
		);
	}

	/**
	 * Update object with dto data.
	 *
	 * @param id {String!} Id of the item to update.
	 * @param dto {TUpdateAttribute} DTO to update from.
	 * */
	public async update(
		id: string,
		dto: TUpdateAttribute<Attribute>
	): Promise<M | null> {
		return this.log(
			async() =>
			{
				const result = await this.model.update(<any>dto, <any>{ where: { id }, returning: true });
				return result[0] > 0 ? result[1][0] : null;
			},
			{ id: 'update' },
			{ id, dto }
		);
	}

	public async bulkUpdate(
		dto: TUpdateAttribute<Attribute>,
		conditions?: WhereOptions<Attribute>
	): Promise<[affectedCount: number, affectedRows: M[]]> {
		if(!conditions) conditions = {};
		return this.log(
			() => this.model.update<any>(dto, { where: conditions, returning: true }),
			{ id: 'bulkUpdate' },
			{ dto, conditions }
		);
	}

	/**
	 * Permamently delete object from database.
	 *
	 * @param id {String!} Id of the item to delete.
	 *
	 * @returns TAffectedRows Number of affected rows.
	 * */
	public async delete(id: string): Promise<TAffectedRows> {
		return this.log(
			async() => ({ affectedCount: await this.model.destroy<any>({ where: { id } }) }),
			{ id: 'delete' },
			{ id }
		);
	}

	/**
	 * Bulk deletion of objects in database.
	 *
	 * @param conditions Conditions to meet to be deleted for objects.
	 * */
	public async bulkDelete(conditions?: WhereOptions<Attribute>)
		: Promise<TAffectedRows> {
		return this.log(
			async() => ({ affectedCount: await this.model.destroy<any>({ where: conditions ?? {} }) }),
			{ id: 'bulkDelete' },
			{ conditions }
		);
	}

	/**
	 * Method allows to log information about repository and model ops
	 *
	 * @param {TLoggerCallback} callback Callback function to call in logger
	 * @param {TLogIdentifier} identifier Holds information about function from which called log
	 * @param funcParams Additional information such as callers arguments
	 *
	 * @returns Promise<R> Callback's return result
	 * */
	public async log<R>(
		callback: TLoggerCallback<R>,
		identifier: TLogIdentifier = { method: 'info' },
		funcParams: { [k: string]: any } = null
	): Promise<R> {
		let result: R = null;
		const id = `.${identifier.id}()` ?? '';
		const errId = identifier.errorId ?? identifier.id ?? 'error';
		try {
			if(this.options?.log)
				this.logger.log(`${this.tableName}${id} IN`, funcParams ?? '');
			result = await callback();
			if(this.options?.log) {
				if(result !== null) {
					this.logger.log(
						`${this.tableName}${id} OK`,
						Array.isArray(result) ? { result: result.length }
						                      : { result: expandModel(result) }
					);
				}
				else
					this.logger.log(`${this.tableName}${id} NULL`);
			}
		} catch(error) {
			if(this.options?.log)
				this.logger.error(`${this.tableName}${id} ERR`, { error });
			this.setRecord(errId, { statusCode: 400, message: error.message });
			console.error(error);
		}
		return result;
	}

	public getRecord(key: TResponseKey | string)
		: IApiResponse<null> {
		if(key in this.responseRecord) {
			return this.responseRecord[key];
		}
		return undefined;
	}

	protected setRecord(
		key: TResponseKey,
		response: IApiResponse<null>
	): void {
		this.responseRecord[key] = response;
	}

	public whereClause<A extends IModel = Attribute>(
		op: 'and' | 'or' = null,
		debug: boolean = false
	): WhereClause<A> {
		return WhereClause.get<A>(op, debug);
	}
}

export default GenericRepository;
