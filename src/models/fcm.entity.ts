import { Table }         from 'sequelize-typescript';
import { ObjectType }    from '@nestjs/graphql';
import { TABLE_OPTIONS } from '@common/constants';
import {
	BooleanColumn,
	IEntityFCM,
	StringColumn,
	UuidColumn
}                        from '@common/interfaces';
import EntityModel       from './entity-model';

@ObjectType()
@Table({ tableName: 'entity_fcms', ...TABLE_OPTIONS })
export default class EntityFCM
	extends EntityModel<IEntityFCM>
	implements IEntityFCM {
	@UuidColumn({ unique: true })
	entityId: string;

	@StringColumn()
	token: string;

	@BooleanColumn({ defaultValue: false, field: 'passed_24h' })
	passed24H?: boolean;

	@BooleanColumn({ defaultValue: false, field: 'passed_6h' })
	passed6H?: boolean;

	@BooleanColumn({ defaultValue: false, field: 'passed_1h' })
	passed1H?: boolean;

	@BooleanColumn({ defaultValue: false })
	passedDistance?: boolean;
}
