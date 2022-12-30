import {
	CreatedAt,
	IsUUID,
	Model,
	UpdatedAt
}                       from 'sequelize-typescript';
import { ApiProperty }  from '@nestjs/swagger';
import {
	Field,
	ObjectType
}                       from '@nestjs/graphql';
import {
	IdColumn,
	IModel,
	TCreationAttribute
}                       from '@common/interfaces';
import { UuidScalar }   from '@common/scalars';
import { entityConfig } from '@api/swagger/properties';

const { base: prop } = entityConfig;

@ObjectType({ isAbstract: true })
export default abstract class EntityModel<TModelAttributes extends IModel,
	TCreationAttributes extends TCreationAttribute<IModel> =
		TCreationAttribute<TModelAttributes>>
	extends Model<TModelAttributes, TCreationAttributes>
	implements IModel {
	@ApiProperty(prop.id)
	@Field(() => UuidScalar)
	@IsUUID('all')
	@IdColumn()
	override id: string;

	@ApiProperty(prop.createdAt)
	@CreatedAt
	override createdAt: Date;

	@ApiProperty(prop.updatedAt)
	@UpdatedAt
	override updatedAt: Date;
}
