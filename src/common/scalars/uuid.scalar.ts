import {
	GraphQLScalarType,
	StringValueNode
}                                   from 'graphql';
import { validate as validateUuid } from 'uuid';

/**@ignore*/
function validate(uuid: unknown | string): string | never {
	if(typeof uuid !== 'string' && !validateUuid(uuid as string)) {
		throw new Error('Invalid uuid');
	}
	return uuid as string;
}

/**@ignore*/
const UuidScalar = new GraphQLScalarType(
	{
		name:         'UUID',
		description:  'A simple UUID parser',
		serialize:    value => validate(value),
		parseValue:   value => validate(value),
		parseLiteral: ast => validate((ast as StringValueNode).value)
	}
);

/**@ignore*/
export default UuidScalar;
