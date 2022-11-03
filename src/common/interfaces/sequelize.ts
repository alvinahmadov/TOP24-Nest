import { ModelAttributeColumnOptions } from 'sequelize';
import { Column, DataType, Sequelize } from 'sequelize-typescript';

export type TAffectedRows = { affectedCount: number };

export type TDbOnOption = 'CASCADE' |
                          'RESTRICT' |
                          'SET NULL' |
                          'SET DEFAULT' |
                          'NO ACTION';

/**@ignore*/
type TColumnOptions = Partial<Omit<ModelAttributeColumnOptions, 'onDelete' | 'onUpdate'> & {
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
				defaultValue:  Sequelize.literal('gen_random_uuid()')
			}
		)
	);
};

export const IntColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.INTEGER });

export const SmallIntColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.SMALLINT });

export const IntArrayColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.ARRAY(DataType.INTEGER) });

export const FloatColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.FLOAT, validate: { isFloat: true } });

export const BooleanColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.BOOLEAN, defaultValue: false });

export const DateColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.DATE });

export const StringColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.STRING });

export const JsonbColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.JSONB });

export const StringArrayColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.ARRAY(DataType.STRING) });

export const UrlColumn = (options: TColumnOptions = {}): Function =>
	MergeColumnOptions(options, { type: DataType.STRING, defaultValue: null, validate: { isUrl: true } });
