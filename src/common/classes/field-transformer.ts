import { IModel }      from '@common/interfaces';
import * as attributes from '@common/interfaces/attributes';

export type TOmitTimestamp<T extends attributes.IModel> = Omit<T, 'createdAt' | 'updatedAt'>;

export default class FieldTransformer<T extends TOmitTimestamp<IModel> | any,
	R extends TOmitTimestamp<IModel> | any> {
	private model: Partial<R> = {};
	private keysCount: number = 0;

	constructor(
		private readonly transformData: any
	) {}

	public set(
		defaultKey: keyof R,
		...keys: (keyof T)[]
	): this {
		if(
			defaultKey in this.transformData ||
			keys.includes(defaultKey as any)
		) {
			if(
				this.transformData[defaultKey] !== undefined ||
				this.transformData[defaultKey] !== ''
			) {
				this.model[defaultKey] = this.transformData[defaultKey];
				++this.keysCount;
			}
		}
		else if(keys && keys.length > 0) {
			for(const key of keys) {
				if(key in this.transformData && (
					this.transformData[key] !== undefined ||
					this.transformData[key] !== ''
				)) {
					this.model[defaultKey] = this.transformData[key];
					++this.keysCount;
				}
			}
		}
		return this;
	};

	public get(): R | null {
		if(this.keysCount === 0)
			return null;

		return this.model as R;
	}
}
