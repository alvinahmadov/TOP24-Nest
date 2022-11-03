import { Kind, ValueNode }      from 'graphql';
import { CustomScalar, Scalar } from '@nestjs/graphql';

/**@ignore*/
@Scalar('TupleScalar', () => TupleScalar)
export default class TupleScalar
	implements CustomScalar<any, [number, number]> {
	description = 'Tuple custom scalar type';

	public parseValue(value: unknown): [number, number] {
		if(typeof value === 'number' ||
		   typeof value === 'string')
			return [Number(value), Number(value)];

		throw new Error('Invalid tuple number');
	}

	public serialize(value: unknown): [number, number] {
		if(value instanceof Array && value.length == 2)
			return [value[0], value[1]];
		else if(typeof value === 'number')
			return [value, value];
		throw new Error('Invalid tuple');
	}

	public parseLiteral(ast: ValueNode): any {
		if(ast.kind === Kind.INT)
			return [ast.value, ast.value];
		return null;
	}
}
