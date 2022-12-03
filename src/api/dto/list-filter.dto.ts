import { InputType }   from '@nestjs/graphql';
import { IListFilter } from '@common/interfaces';
import { ApiProperty } from '@nestjs/swagger';

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
}
