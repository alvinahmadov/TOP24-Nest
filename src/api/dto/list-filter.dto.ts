import { InputType }   from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IListFilter } from '@common/interfaces';
import env             from '@config/env';

@InputType()
export default class ListFilter
	implements IListFilter {
	@ApiProperty({
		             description: 'Номер начала списка.',
		             required:    false
	             })
	from?: number = 0;

	@ApiProperty({
		             description: 'Максимальное количество объектов.',
		             required:    false
	             })
	count?: number;

	@ApiProperty({
		             description: 'Получить другие связанные объекты.',
		             required:    false,
		             default:     false
	             })
	full?: boolean = false;

	@ApiProperty({
		             description: 'Enabled/disable compat mode in return resul',
		             required:    false,
		             default:     1
	             })
	compat?: number = Number(env.api.compatMode);
}
