import { ApiBody } from '@nestjs/swagger';
import * as dto    from '@api/dto';

/**@ignore*/
export default (
	options: { required?: boolean, multi?: boolean } = { required: true }
) => ApiBody(
	{
		description: 'Image',
		type:        !!options.multi ? dto.FilesUploadDto
		                             : dto.FileUploadDto,
		required:    !!options.required
	}
);
