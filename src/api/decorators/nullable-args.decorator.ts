import { PipeTransform, Type } from '@nestjs/common';
import { Args, ArgsOptions }   from '@nestjs/graphql';

/**@ignore*/
type TPipeTransform = Type<PipeTransform> | PipeTransform;

/**
 * Resolver method parameter decorator. Extracts the arguments
 * object from the underlying platform and populates the decorated
 * parameter with the value of either all arguments or a single specified argument.
 * 
 * @ignore
 */
// @ts-ignore
function NullableArgs(...pipes: TPipeTransform[]): ParameterDecorator;
function NullableArgs(options: ArgsOptions, ...pipes: TPipeTransform[]): ParameterDecorator;
function NullableArgs(
	property: string,
	options: ArgsOptions,
	...pipes: TPipeTransform[]
)
	: ParameterDecorator {
	if(options) {
		options.nullable = true;
	}
	else {
		options = { nullable: true };
	}

	return (_: Object, __: string | symbol, ___: number) =>
	{
		if(pipes && pipes.length > 0) {
			if(property)
				return Args(property, ...pipes);
			if(options)
				return Args(options, ...pipes);
			else
				return Args(property, options, ...pipes);
		}
		else if(options) {
			if(property)
				return Args(property, options);
			else
				return Args(options);
		}
		else if(property)
			return Args(property);
		else
			return Args();
	};
}

export default NullableArgs;
