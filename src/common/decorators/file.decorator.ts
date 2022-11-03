import { ApiBody } from '@nestjs/swagger';
import * as dto    from '@api/dto';

/**@ignore*/
export default (
	options: { required?: boolean } = { required: true }
) => ApiBody(
	{
		description: 'Image',
		type:        dto.FileUploadDto,
		required:    !!options.required
	}
);
