import { ApiProperty } from '@nestjs/swagger';
import { TMulterFile } from '@common/interfaces';

export default class FileUploadDto {
	@ApiProperty({ type: 'string', format: 'binary' })
	image: TMulterFile;
}
