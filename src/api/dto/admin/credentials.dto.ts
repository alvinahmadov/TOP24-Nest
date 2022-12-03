import { ApiProperty }       from '@nestjs/swagger';
import { InputType }         from '@nestjs/graphql';
import { IAdminCredentials } from '@common/interfaces';
import { entityConfig }      from '@api/swagger/properties';

const { admin: prop } = entityConfig;

@InputType()
export default class AdminCredentials
	implements IAdminCredentials {
	@ApiProperty(prop.email)
	email: string;

	@ApiProperty({ description: 'Admin password' })
	password: string;
}
