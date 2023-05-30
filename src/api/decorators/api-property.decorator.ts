import { ApiProperty }          from '@nestjs/swagger';
import { TApiProperty, IModel } from '@common/interfaces';
import { ApiPropertyOptions }   from '@nestjs/swagger/dist/decorators/api-property.decorator';

//TODO: Fix 'is not function' error
// noinspection JSUnusedGlobalSymbols
export default <T extends IModel>(property: TApiProperty<T> | ApiPropertyOptions): PropertyDecorator =>
{
	return (
		target: Object,
		propertyKey: string | symbol
	) =>
	{
		if(propertyKey in property) {
			ApiProperty((property as any)[propertyKey])(target, propertyKey);
		}
		else {
			console.info(`No property ${propertyKey as string}`);
			ApiProperty(property as ApiPropertyOptions)(target, propertyKey);
		}
	};
}
