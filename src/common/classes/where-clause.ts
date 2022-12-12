import { validate }             from 'uuid';
import { Op, WhereOptions }     from 'sequelize';
import { MAX_FLOAT, MIN_FLOAT } from '@common/constants';
import { IModel, TModelFilter } from '@common/interfaces';

type TWhereOptionType = 'eq' |
                        'in' |
                        'notEq' |
                        'iLike' |
                        'nullOrEq' |
                        'notNullEq' |
                        'lteOrNull' |
                        'gteOrNull' |
                        'iLikeOrNull';

type TOpType = 'and' | 'or';

export default class WhereClause<T extends IModel> {
	protected constructor(
		private _conjunct: TOpType = 'or',
		public debug: boolean = false
	) {}

	private _query: any = {};

	get query(): WhereOptions<T> {
		return this._conjunct
		       ? this._conjunct === 'or'
		         ? { [Op.or]: this._query }
		         : { [Op.and]: this._query }
		       : this._query;
	}

	static get<T extends IModel>(
		opType: TOpType = null,
		debug: boolean = false
	) {
		return new WhereClause<T>(opType, debug);
	}

	public any(
		key: keyof T,
		value: string
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'any', conj: this._conjunct, key, value });
				this._query[key] = { [Op.any]: value };
			}
		);
	}

	/**
	 * Check operator ILIKE
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * @param {Boolean} full Use text wildcard from both side or from end.
	 * */
	public iLike(
		key: keyof T,
		value: string,
		full: boolean = true
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'iLike', conj: this._conjunct, key, value });
				this._query[key] = {
					[Op.iLike]: full
					            ? `%${value}%`
					            : `${value}%`
				};
			}
		);
	}

	/**
	 * Check operator IN
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} values List of value to search in.
	 * */
	public in<V>(
		key: keyof T,
		values: V[]
	): this {
		return this._exec(
			key,
			() =>
			{
				if(values === undefined || values.every(v => v === undefined) || values.length === 0) return;
				if(this.debug)
					console.debug({ name: 'in', conj: this._conjunct, key, values });

				this._query[key] = { [Op.in]: values.filter(v => v !== undefined) };
			}
		);
	}

	/**
	 * Check operator IN
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} values List of value to search in.
	 * @param {Boolean} ignoreCase Use iLike in ops.
	 * */
	public inArray<V>(
		key: keyof T,
		values: V[],
		ignoreCase: boolean = false
	): this {
		return this._exec(
			key,
			() =>
			{
				if(values === undefined ||
				   !Array.isArray(values)) return;
				if(this.debug)
					console.debug({ name: 'inArray', conj: this._conjunct, key, values });
				if(values && values.length > 0) {
					const isUUID = values.every(v => validate(typeof (v) === 'string' ? v : v.toString()));
					this._query[key] = {
						[Op.or]: values.map(
							value =>
							{
								if(typeof value === 'string' && !isUUID) {
									return ignoreCase ? { [Op.iLike]: value }
									                  : { [Op.like]: value };
								}
								else {
									return { [Op.eq]: value };
								}
							}
						)
					};
				}
			}
		);
	}

	public contains<V>(
		key: keyof T,
		value: V
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined)
					return;
				if(this.debug)
					console.debug({ name: 'contains', conj: this._conjunct, key, value });

				this._query[key] = { [Op.contains]: value };
			}
		);
	}

	/**
	 * Check operator ILIKE or IS NULL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * @param {Boolean} full Use text wildcard from both side or from end.
	 * */
	public iLikeOrNull(
		key: keyof T,
		value: string,
		full: boolean = true
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'iLikeOrNull', conj: this._conjunct, key, value });
				this._query[key] = {
					[Op.or]: [
						{ [Op.iLike]: full ? `%${value}%` : `${value}%` },
						{ [Op.is]: null }
					]
				};
			}
		);
	}

	/**
	 * Check operator EQUAL or IS NULL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * */
	public nullOrEq<V>(
		key: keyof T,
		value: V
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'nullOrEq', conj: this._conjunct, key, value });
				this._query[key] = { [Op.or]: [{ [Op.is]: null }, { [Op.eq]: value }] };
			}
		);
	}

	/**
	 * Check operator EQUAL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * */
	public eq<V>(
		key: keyof T,
		value: V
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'eq', conj: this._conjunct, key, value });

				this._query[key] = { [Op.eq]: value };
			}
		);
	}

	/**
	 * Check operator IS NOT NULL and EQUAL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * */
	public notNullEq<V>(
		key: keyof T,
		value: V
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'notNullEq', conj: this._conjunct, key, value });
				this._query[key] = {
					[Op.and]: [
						{ [Op.not]: null },
						{ [Op.eq]: value }
					]
				};
			}
		);
	}

	/**
	 * Check operator IS NOT NULL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {Boolean} condition Ignore condition
	 * */
	public notNull(
		key: keyof T,
		condition: boolean = true
	): this {
		return this._exec(
			key,
			() =>
			{
				if(this.debug)
					console.debug({ name: 'notNull', conj: this._conjunct, key, condition });
				if(condition)
					this._query[key] = { [Op.not]: null };
			}
		);
	}

	public notEq<V>(
		key: keyof T,
		value: V
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'notEq', conj: this._conjunct, key, value });
				this._query[key] = { [Op.ne]: value };
			}
		);
	}

	/**
	 * Check field value is between two values in range, inclusive.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} valueMin Upper value to check against.
	 * @param {String!} valueMax Lower value to check against.
	 * */
	public between(
		key: keyof T,
		valueMin?: number,
		valueMax?: number
	): this {
		return this._exec(
			key,
			() =>
			{
				if(valueMin === undefined && valueMax === undefined)
					return;
				this._query[key] = {
					[Op.between]: [
						valueMin ?? MIN_FLOAT,
						valueMax ?? MAX_FLOAT
					]
				};
				if(this.debug)
					console.debug({ name: 'between', conj: this._conjunct, key, valueMin, valueMax });
			}
		);
	}

	/**
	 * Check operator LESS THAN or IS NULL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * @param {Boolean!} equal Check for equality.
	 * */
	public lt<V>(
		key: keyof T,
		value: V,
		equal: boolean = false
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: equal ? 'lte' : 'lt', conj: this._conjunct, key, value });
				this._query[key] = equal ? { [Op.lte]: value }
				                         : { [Op.lt]: value };
			}
		);
	}

	/**
	 * Check operator GREATER THAN.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * @param {Boolean!} equal Check for equality.
	 * */
	public gt<V>(
		key: keyof T,
		value: V,
		equal: boolean = false
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: equal ? 'gte' : 'gt', conj: this._conjunct, key, value });
				this._query[key] = equal ? { [Op.gte]: value }
				                         : { [Op.gt]: value };
			}
		);
	}

	/**
	 * Check operator LESS THAN or IS NULL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * */
	public lte<V>(
		key: keyof T,
		value: V
	): this {
		return this.lt(key, value, true);
	}

	/**
	 * Check operator GREATER THAN.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * */
	public gte<V>(
		key: keyof T,
		value: V
	): this {
		return this.gt(key, value, true);
	}

	/**
	 * Check operator LESS THAN or IS NULL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * */
	public lteOrNull<V>(
		key: keyof T,
		value: V
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'lteOrNull', conj: this._conjunct, key, value });
				this._query[key] = { [Op.or]: [{ [Op.is]: null }, { [Op.lte]: value }] };
			}
		);
	}

	/**
	 * Check operator GREATER THAN or IS NULL.
	 *
	 * @param {String!} key Model field name as a key.
	 * @param {String!} value Value to check against.
	 * */
	public gteOrNull<V>(
		key: keyof T,
		value: V
	): this {
		return this._exec(
			key,
			() =>
			{
				if(value === undefined) return;
				if(this.debug)
					console.debug({ name: 'gteOrNull', conj: this._conjunct, key, value });
				this._query[key] = { [Op.or]: [{ [Op.is]: null }, { [Op.gte]: value }] };
			}
		);
	}

	public fromFilter<F extends TModelFilter<T>, K extends keyof T = keyof T>
	(filter: F, method: TWhereOptionType = 'eq'): this {
		if(filter === undefined) {
			this._conjunct = null;
			return this;
		}

		if(Object.keys(filter).length == 0) {
			this._conjunct = null;
			return this;
		}

		for(const entry of Object.entries(filter)) {
			const key = <any>entry[0];
			const value = <any>entry[1];
			if(
				(key in this._query && this._query[key] !== undefined) ||
				(key === 'term' || key === 'strict')
			)
				continue;

			if(value === undefined)
				continue;

			if(this.debug)
				console.debug({ name: 'fromFilter', conjunct: this._conjunct, key, value });
			if(Array.isArray(value))
				this.inArray(key, value);
			else
				this[method](key, value);
		}

		return this;
	}

	private _exec(
		key: keyof T,
		cb: () => void
	): this {
		try {
			if(this._query) {
				if(key in this._query || this._query[key] !== undefined)
					return this;
			}
			cb();
		} catch(e) {
			console.error(e);
		}
		return this;
	}
}
