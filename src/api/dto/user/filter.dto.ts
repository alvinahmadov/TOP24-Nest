import { InputType }   from '@nestjs/graphql';
import { IUserFilter } from '@common/interfaces';

@InputType()
export default class UserFilter
	implements IUserFilter {}
