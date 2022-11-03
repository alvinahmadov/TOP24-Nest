import { InputType }   from '@nestjs/graphql';
import { IListFilter } from '@common/interfaces';

@InputType()
export default class ListFilter
	implements IListFilter {
	/**
	 * Start offset position of list.
	 * */
	from?: number = 0;

	/**
	 * Number of items to return starting from `from` member.
	 * */
	count?: number;

	/**
	 * If there any associated another modle related to
	 * current model include them also in result.
	 * */
	full?: boolean = false;
}
