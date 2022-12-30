import { ApiProperty } from '@nestjs/swagger';
import { TMulterFile } from '@common/interfaces';

export class FileUploadDto {
	@ApiProperty({ type: 'string', format: 'binary' })
	image: TMulterFile;
}

export class FilesUploadDto {
	@ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
	image: Array<TMulterFile>;
}
