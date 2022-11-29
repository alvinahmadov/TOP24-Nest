import { ModelAttributeColumnOptions } from 'sequelize';
import { snakeCase }                   from 'lodash';
import { TABLE_OPTIONS }               from '../constants';
import {
	annotateModelWithIndex,
	Column,
	DataType,
	IndexFieldOptions,
	IndexOptions,
	Sequelize
}                                      from 'sequelize-typescript';

type IndexDecoratorOptions = IndexOptions &
                             Pick<IndexFieldOptions, Exclude<keyof IndexFieldOptions, 'name'>>;
type AnnotationFunction = <T>(
	target: T,
	propertyName: string
) => void;

export type TAffectedRows = { affectedCount: number };

export type TDbOnOption = 'CASCADE' |
                          'RESTRICT' |
                          'SET NULL' |
                          'SET DEFAULT' |
                          'NO ACTION';

/**@ignore*/
type TColumnOptions = Partial<Omit<ModelAttributeColumnOptions, 'onDelete' | 'onUpdate' | 'type'> & {
	onDelete?: TDbOnOption;
	onUpdate?: TDbOnOption;
}>;

const MergeColumnOptions = (obj1: object, obj2?: TColumnOptions): Function =>
	Column(Object.assign(obj1, obj2));

export const VirtualColumn = (options?: TColumnOptions): Function =>
	MergeColumnOptions({ type: DataType.VIRTUAL }, options);

export const UuidColumn = (options?: TColumnOptions): Function =>
	MergeColumnOptions({ type: DataType.UUID }, options);

export const IdColumn = (options?: TColumnOptions): Function =>
{
	if(!options) options = {};
	return UuidColumn(
		Object.assign(
			options,
			{
				allowNull:     false,
				autoIncrement: false,
				primaryKey:    true,
				defaultValue:  () => Sequelize.literal('gen_random_uuid()')
			}
		)
	);
};

export const IntColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions({ type: DataType.INTEGER }, options);

export const SmallIntColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions({ type: DataType.SMALLINT }, options);

export const IntArrayColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions({ type: DataType.ARRAY(DataType.INTEGER) }, options);

export const FloatColumn = (options: Omit<TColumnOptions, 'validate'> = {}): Function =>
	MergeColumnOptions({ type: DataType.FLOAT, validate: { isFloat: true } }, options);

export const BooleanColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions({ type: DataType.BOOLEAN }, options);

export const DateColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions({ type: DataType.DATE, validate: { isDate: true } }, options);

export const StringColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions({ type: DataType.STRING }, options);

export const JsonbColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions({ type: DataType.JSONB }, options);

export const StringArrayColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions({ type: DataType.ARRAY(DataType.STRING) }, options);

export const UrlColumn = (options: TColumnOptions = {}): Function =>
	(target: Object, propertyKey: string) =>
		MergeColumnOptions({ type: DataType.STRING, defaultValue: null, validate: { isUrl: { msg: propertyKey } } }, options);

export function Index(name: string): AnnotationFunction;
export function Index(indexOptions: IndexOptions): AnnotationFunction;
export function Index<T>(target: T, propertyName: string, indexDecoratorOptions?: IndexDecoratorOptions): void;
export function Index<T>(...args: unknown[]): AnnotationFunction | void {
	if(arguments.length >= 2) {
		const type: T = <T>args[0];
		const key: string = <string>args[1];
		const indexDecoratorOptions: IndexDecoratorOptions = <IndexDecoratorOptions>args[2];
		annotateModelWithIndex(
			type,
			TABLE_OPTIONS.underscored ? snakeCase(key)
			                          : key,
			indexDecoratorOptions
		);
	}
	else {
		return <Type>(target: Type, propertyName: string) =>
		{
			const indexDecoratorOptions: IndexDecoratorOptions = <IndexDecoratorOptions>args[0];
			annotateModelWithIndex(
				target,
				TABLE_OPTIONS.underscored ? snakeCase(propertyName)
				                          : propertyName,
				indexDecoratorOptions
			);
		};
	}
}
