import {
	BelongsTo,
	HasMany,
	IsUUID,
	Table
}                            from 'sequelize-typescript';
import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty }       from '@nestjs/swagger';
import { 
	CRM,
	TRANSPORT,
	VALIDATION
}                            from '@config/json';
import { TABLE_OPTIONS }     from '@common/constants';
import {
	loadingTypeToStr,
	LoadingType,
	TransportStatus
}                            from '@common/enums';
import {
	BooleanColumn,
	DateColumn,
	FloatColumn,
	ICRMValidationData,
	Index,
	IntArrayColumn,
	IntColumn,
	ITransport,
	JsonbColumn,
	StringArrayColumn,
	StringColumn,
	TCRMData,
	TCRMFields,
	UrlColumn,
	UuidColumn,
	VirtualColumn
}                            from '@common/interfaces';
import { UuidScalar }        from '@common/scalars';
import {
	checkCrmIssues,
	convertBitrix,
	validateCrmEntity,
}                            from '@common/utils';
import { entityConfig }      from '@api/swagger/properties';
import EntityModel           from './entity-model';
import CargoCompany          from './cargo.entity';
import CargoCompanyInn       from './cargo-inn.entity';
import Driver                from './driver.entity';
import Image                 from './image.entity';

const { transport: prop } = entityConfig;

/**
 * Transport model
 *
 * @description Transport model of the cargo company
 * that assigned to specific driver.
 *
 * @class Transport
 * @interface ITransport
 * @extends EntityModel
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Transport
	extends EntityModel<ITransport>
	implements ITransport {
	@ApiProperty(prop.cargoId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@Index
	@UuidColumn({
		            allowNull: true,
		            onDelete:  'CASCADE'
	            })
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@Index
	@UuidColumn({
		            allowNull: true,
		            onDelete:  'CASCADE'
	            })
	cargoinnId?: string;

	@ApiProperty(prop.driverId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@Index
	@UuidColumn({
		            allowNull: true,
		            onDelete:  'CASCADE'
	            })
	driverId?: string;

	@ApiProperty(prop.crmId)
	@Index
	@IntColumn({
		           unique:       true,
		           defaultValue: null
	           })
	crmId?: number;

	@ApiProperty(prop.confirmed)
	@BooleanColumn({
		               allowNull:    true,
		               defaultValue: false
	               })
	confirmed?: boolean;

	@ApiProperty(prop.status)
	@IntColumn({ allowNull: false })
	status: TransportStatus;

	@ApiProperty(prop.comments)
	@StringColumn()
	comments?: string;

	@ApiProperty(prop.diagnosticsNumber)
	@StringColumn({ allowNull: false })
	diagnosticsNumber: string;

	@ApiProperty(prop.diagnosticsExpiryDate)
	@DateColumn()
	diagnosticsExpiryDate: Date;

	@ApiProperty(prop.diagnosticsPhotoLink)
	@UrlColumn()
	diagnosticsPhotoLink?: string;

	@ApiProperty(prop.weightExtra)
	@FloatColumn({ defaultValue: 0.0 })
	weightExtra: number;

	@ApiProperty(prop.volumeExtra)
	@FloatColumn({ defaultValue: 0.0 })
	volumeExtra: number;

	@ApiProperty(prop.weight)
	@FloatColumn({ allowNull: false })
	weight: number;

	@ApiProperty(prop.volume)
	@FloatColumn({ allowNull: false })
	volume: number;

	@ApiProperty(prop.length)
	@FloatColumn({ allowNull: false })
	length: number;

	@ApiProperty(prop.width)
	@FloatColumn({ allowNull: false })
	width: number;

	@ApiProperty(prop.height)
	@FloatColumn({ allowNull: false })
	height: number;

	@ApiProperty(prop.loadingTypes)
	@IntArrayColumn({
		                allowNull:    false,
		                defaultValue: []
	                })
	loadingTypes?: LoadingType[];

	@ApiProperty(prop.brand)
	@StringColumn({ allowNull: false })
	brand: string;

	@ApiProperty(prop.model)
	@StringColumn({ allowNull: false })
	model: string;

	@ApiProperty(prop.osagoNumber)
	@StringColumn({ allowNull: false })
	osagoNumber: string;

	@ApiProperty(prop.osagoExpiryDate)
	@DateColumn({ allowNull: false })
	osagoExpiryDate: Date;

	@ApiProperty(prop.osagoPhotoLink)
	@UrlColumn()
	osagoPhotoLink: string;

	@ApiProperty(prop.certificateNumber)
	@StringColumn({ allowNull: false })
	certificateNumber: string;
	
	@ApiProperty(prop.certificatePhotoLinkFront)
	@UrlColumn()
	certificatePhotoLinkFront?: string;

	@ApiProperty(prop.certificatePhotoLinkBack)
	@UrlColumn()
	certificatePhotoLinkBack?: string;

	@ApiProperty(prop.payloads)
	@StringArrayColumn()
	payloads: string[];

	@ApiProperty(prop.payloadExtra)
	@BooleanColumn({ defaultValue: false })
	payloadExtra?: boolean;

	@ApiProperty(prop.isTrailer)
	@BooleanColumn({ defaultValue: false })
	isTrailer?: boolean;

	@ApiProperty(prop.isDedicated)
	@BooleanColumn({ defaultValue: false })
	isDedicated?: boolean;

	@ApiProperty(prop.pallets)
	@IntColumn({ defaultValue: 0 })
	pallets?: number;

	@ApiProperty(prop.prodYear)
	@IntColumn()
	prodYear: number;

	@ApiProperty(prop.registrationNumber)
	@StringColumn({ allowNull: false })
	registrationNumber: string;

	@ApiProperty(prop.riskClasses)
	@StringArrayColumn({
		                   allowNull:    false,
		                   defaultValue: []
	                   })
	riskClasses: string[];

	@ApiProperty(prop.type)
	@StringColumn()
	type: string;

	@ApiProperty(prop.fixtures)
	@StringArrayColumn({ defaultValue: [] })
	fixtures?: string[];

	@ApiProperty(prop.info)
	@StringColumn()
	info?: string;

	@ApiProperty(prop.offerStatus)
	@VirtualColumn()
	offerStatus?: number;
	
	@ApiProperty(prop.crmData)
	@JsonbColumn({ defaultValue: {} })
	crmData?: ICRMValidationData<ITransport>;

	@BooleanColumn({ defaultValue: false })
	isAutogenerated?: boolean;

	@ApiProperty(prop.cargo)
	@BelongsTo(() => CargoCompany, 'cargoId')
	cargo?: CargoCompany;

	@ApiProperty(prop.cargoinn)
	@BelongsTo(() => CargoCompanyInn, 'cargoinnId')
	cargoinn?: CargoCompanyInn;

	@ApiProperty(prop.driver)
	@BelongsTo(() => Driver, 'driverId')
	driver?: Driver;

	@ApiProperty(prop.images)
	@HasMany(() => Image, 'transportId')
	images: Image[];

	@ApiProperty(prop.trailer)
	@VirtualColumn()
	trailer?: Transport;

	public toCrm(): TCRMData {
		const data: TCRMData = { fields: {}, params: { 'REGISTER_SONET_EVENT': 'N' } };
		if(this.crmId)
			data.fields[TRANSPORT.ID] = this.crmId;
		data.fields[TRANSPORT.TYPE] = [convertBitrix('transportType', this.type, false)];
		data.fields[TRANSPORT.BRAND] = convertBitrix('transportBrand', this.brand, false);
		data.fields[TRANSPORT.MODEL] = this.model;
		data.fields[TRANSPORT.REGISTR_NUMBER] = this.registrationNumber;
		data.fields[TRANSPORT.PROD_YEAR] = this.prodYear;
		data.fields[TRANSPORT.CERTIFICATE.NUMBER] = this.certificateNumber;
		data.fields[TRANSPORT.CERTIFICATE.LINK.FRONT] = this.certificatePhotoLinkFront;
		data.fields[TRANSPORT.CERTIFICATE.LINK.BACK] = this.certificatePhotoLinkBack;
		data.fields[TRANSPORT.PAYLOAD.TYPE] = this.payloads
		                                          .map(
			                                          payload => convertBitrix<string, string>('transportPayload', payload, false)
		                                          ).join(', ');
		data.fields[TRANSPORT.RISK_CLASS] = this.riskClasses
		                                        .map(
			                                        rc => convertBitrix<string, string>('transportRiskClass', rc, false)
		                                        );
		data.fields[TRANSPORT.PARAMS.WEIGHT] = this.weight;
		data.fields[TRANSPORT.PARAMS.VOLUME] = this.volume;
		data.fields[TRANSPORT.PARAMS.LENGTH] = this.length;
		data.fields[TRANSPORT.PARAMS.WIDTH] = this.width;
		data.fields[TRANSPORT.PARAMS.HEIGHT] = this.height;
		data.fields[TRANSPORT.PARAMS.PALLETS] = this.pallets;
		data.fields[TRANSPORT.LOADING_TYPES] = this.loadingTypes
		                                           ?.map(
			                                           lt => convertBitrix('transportLoading', loadingTypeToStr(lt), false)
		                                           );
		if(this.isDedicated)
			data.fields[TRANSPORT.DEDICATED] = CRM.TRANSPORT.DEDICATED[0].ID;
		else if(this.payloadExtra)
			data.fields[TRANSPORT.DEDICATED] = CRM.TRANSPORT.DEDICATED[2].ID;
		else
			data.fields[TRANSPORT.DEDICATED] = CRM.TRANSPORT.DEDICATED[1].ID;
		data.fields[TRANSPORT.OSAGO.NUMBER] = this.osagoNumber;
		data.fields[TRANSPORT.OSAGO.EXP_DATE] = this.osagoExpiryDate;
		data.fields[TRANSPORT.OSAGO.LINK] = this.osagoPhotoLink;
		data.fields[TRANSPORT.DIAGNOSTIC.NUMBER] = this.diagnosticsNumber;
		data.fields[TRANSPORT.DIAGNOSTIC.EXP_DATE] = this.diagnosticsExpiryDate;
		data.fields[TRANSPORT.DIAGNOSTIC.LINK] = this.diagnosticsPhotoLink;
		data.fields[TRANSPORT.COMMENTS] = this.comments;
		data.fields[TRANSPORT.FIXTURES] =
			this.fixtures && Array.isArray(this.fixtures)
			? this.fixtures.map(ef => convertBitrix('transportFixtures', ef, false)) : [];
		if(this.images)
			data.fields[TRANSPORT.IMAGE] = this.images.map(image => image.url);

		return data;
	};

	public validateCrm = (crm: TCRMFields, reference: TCRMFields): boolean => {
		const validationRequired = validateCrmEntity(
			this, crm, reference, VALIDATION.KEYS.CONTACT, true
		);
		return checkCrmIssues(this.crmData) && validationRequired;
	}
}
