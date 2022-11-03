import { Kind, ValueNode }      from 'graphql';
import { CustomScalar, Scalar } from '@nestjs/graphql';

/**@ignore*/
@Scalar('Date', () => Date)
export default class DateScalar
	implements CustomScalar<number | string, Date> {
	description = 'Date custom scalar type';

	public parseValue(value: unknown): Date {
		if(typeof value === 'number' ||
		   typeof value === 'string')
			return new Date(value);

		throw new Error('Invalid date number');
	}

	public serialize(value: unknown): number {
		if(value instanceof Date)
			return value.getTime();
		throw new Error('Invalid date');
	}

	public parseLiteral(ast: ValueNode): Date {
		if(ast.kind === Kind.INT)
			return new Date(ast.value);
		return null;
	}
}
