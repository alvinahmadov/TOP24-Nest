import {
	AllowNull,
	BelongsTo,
	Default,
	HasMany,
	IsDate,
	IsUrl,
	IsUUID,
	Table
}                                from 'sequelize-typescript';
import { ApiProperty }           from '@nestjs/swagger';
import { Field, ObjectType }     from '@nestjs/graphql';
import { CRM, TRANSPORT }        from '@config/json';
import {
	loadingTypeToStr,
	LoadingType,
	TransportStatus
}                                from '@common/enums';
import { convertBitrix }         from '@common/utils';
import { Bucket, TABLE_OPTIONS } from '@common/constants';
import {
	BooleanColumn,
	DateColumn,
	FloatColumn,
	ICRMEntity,
	IntArrayColumn,
	IntColumn,
	ITransport,
	StringArrayColumn,
	StringColumn,
	TCRMData,
	UrlColumn,
	UuidColumn,
	VirtualColumn
}                                from '@common/interfaces';
import entityConfig              from '@common/properties';
import { UuidScalar }            from '@common/scalars';
import { ImageFileService }      from '@api/services';
import EntityModel               from './entity-model';
import CargoCompany              from './cargo.entity';
import CargoInnCompany           from './cargo-inn.entity';
import Driver                    from './driver.entity';
import Image                     from './image.entity';

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
	implements ITransport,
	           ICRMEntity {
	@ApiProperty(prop.cargoId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@AllowNull(true)
	@UuidColumn({ onDelete: 'SET NULL' })
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@AllowNull(true)
	@UuidColumn({ onDelete: 'SET NULL' })
	cargoinnId?: string;

	@ApiProperty(prop.driverId)
	@IsUUID('all')
	@Field(() => UuidScalar)
	@AllowNull(true)
	@UuidColumn()
	@UuidColumn({ onDelete: 'SET NULL' })
	driverId?: string;

	@ApiProperty(prop.crmId)
	@AllowNull(true)
	@IntColumn()
	crmId?: number;

	@ApiProperty(prop.status)
	@Default(TransportStatus.NONE)
	@IntColumn()
	status: TransportStatus;

	@ApiProperty(prop.comments)
	@StringColumn()
	comments?: string;

	@ApiProperty(prop.diagnosticsNumber)
	@AllowNull(false)
	@StringColumn()
	diagnosticsNumber: string;

	@ApiProperty(prop.diagnosticsDate)
	@IsDate
	@DateColumn()
	diagnosticsDate: Date;

	@ApiProperty(prop.diagnosticsPhotoLink)
	@IsUrl
	@UrlColumn()
	diagnosticsPhotoLink?: string;

	@ApiProperty(prop.weightExtra)
	@Default(0.0)
	@FloatColumn()
	weightExtra: number;

	@ApiProperty(prop.volumeExtra)
	@Default(0.0)
	@FloatColumn()
	volumeExtra: number;

	@ApiProperty(prop.weight)
	@AllowNull(false)
	@FloatColumn()
	weight: number;

	@ApiProperty(prop.volume)
	@AllowNull(false)
	@FloatColumn()
	volume: number;

	@ApiProperty(prop.length)
	@AllowNull(false)
	@FloatColumn()
	length: number;

	@ApiProperty(prop.width)
	@AllowNull(false)
	@FloatColumn()
	width: number;

	@ApiProperty(prop.height)
	@AllowNull(false)
	@FloatColumn()
	height: number;

	@ApiProperty(prop.loadingTypes)
	@Default([])
	@AllowNull(false)
	@IntArrayColumn()
	loadingTypes?: LoadingType[];

	@ApiProperty(prop.brand)
	@AllowNull(false)
	@StringColumn()
	brand: string;

	@ApiProperty(prop.model)
	@AllowNull(false)
	@StringColumn()
	model: string;

	@ApiProperty(prop.osagoNumber)
	@AllowNull(false)
	@StringColumn()
	osagoNumber: string;

	@ApiProperty(prop.osagoExpiryDate)
	@IsDate
	@AllowNull(false)
	@DateColumn()
	osagoExpiryDate: Date;

	@ApiProperty(prop.osagoPhotoLink)
	@IsUrl
	@UrlColumn()
	osagoPhotoLink: string;

	@ApiProperty(prop.payload)
	@StringColumn()
	payload: string;

	@ApiProperty(prop.payloadExtra)
	@Default(false)
	@BooleanColumn()
	payloadExtra?: boolean;

	@ApiProperty(prop.isTrailer)
	@Default(false)
	@BooleanColumn()
	isTrailer?: boolean;

	@ApiProperty(prop.isDedicated)
	@Default(false)
	@BooleanColumn()
	isDedicated?: boolean;

	@ApiProperty(prop.pallet)
	@Default(0)
	@IntColumn()
	pallet?: number;

	@ApiProperty(prop.prodYear)
	@IntColumn()
	prodYear: number;

	@ApiProperty(prop.registrationNumber)
	@AllowNull(false)
	@StringColumn()
	registrationNumber: string;

	@ApiProperty(prop.certificateNumber)
	@AllowNull(false)
	@StringColumn()
	certificateNumber: string;

	@ApiProperty(prop.riskClasses)
	@AllowNull(false)
	@Default([])
	@StringArrayColumn()
	riskClasses: string[];

	@ApiProperty(prop.type)
	@StringColumn()
	type: string;

	@ApiProperty(prop.fixtures)
	@Default([])
	@StringArrayColumn()
	fixtures?: string[];

	@ApiProperty(prop.info)
	@StringColumn()
	info?: string;

	@ApiProperty(prop.offerStatus)
	@VirtualColumn()
	offerStatus?: number;

	@ApiProperty(prop.cargo)
	@BelongsTo(() => CargoCompany, 'cargoId')
	cargo?: CargoCompany;

	@ApiProperty(prop.cargoinn)
	@BelongsTo(() => CargoInnCompany, 'cargoinnId')
	cargoinn?: CargoInnCompany;

	@ApiProperty(prop.driver)
	@BelongsTo(() => Driver, 'driverId')
	driver?: Driver;

	@ApiProperty(prop.trailer)
	@VirtualColumn()
	trailer?: Transport;

	@ApiProperty(prop.images)
	@HasMany(() => Image, 'transportId')
	images: Image[];

	public async deleteImages(): Promise<number> {
		if(this.images) {
			const imageFileService = new ImageFileService();
			const imageList = this.images.map(i => i.url);

			if(this.osagoPhotoLink)
				imageList.push(this.osagoPhotoLink);

			if(this.diagnosticsPhotoLink)
				imageList.push(this.diagnosticsPhotoLink);

			return imageFileService.deleteImageList(imageList, Bucket.DRIVER);
		}
		return 0;
	}

	public toCrm(): TCRMData {
		const data: TCRMData = { fields: {}, params: { 'REGISTER_SONET_EVENT': 'Y' } };
		if(this.crmId)
			data.fields[TRANSPORT.ID] = this.crmId;
		data.fields[TRANSPORT.TYPE] = [convertBitrix('paymentType', this.type, false)];
		data.fields[TRANSPORT.BRAND] = this.brand;
		data.fields[TRANSPORT.MODEL] = this.model;
		data.fields[TRANSPORT.REGISTR_NUMBER] = this.registrationNumber;
		data.fields[TRANSPORT.PROD_YEAR] = this.prodYear;
		data.fields[TRANSPORT.STS] = this.certificateNumber;
		data.fields[TRANSPORT.PAYLOAD.TYPE] = [convertBitrix('transportPayload', this.payload, false)];
		data.fields[TRANSPORT.PARAMS.WEIGHT] = this.weight;
		data.fields[TRANSPORT.PARAMS.VOLUME] = this.volume;
		data.fields[TRANSPORT.PARAMS.LENGTH] = this.length;
		data.fields[TRANSPORT.PARAMS.WIDTH] = this.width;
		data.fields[TRANSPORT.PARAMS.HEIGHT] = this.height;
		data.fields[TRANSPORT.PARAMS.PALLETS] = this.pallet;
		data.fields[TRANSPORT.LOADING_TYPES] = this.loadingTypes ? this.loadingTypes.map(
			lt => convertBitrix('loadingType', loadingTypeToStr(lt), false)
		) : [];
		if(this.isDedicated)
			data.fields[TRANSPORT.DEDICATED] = CRM.TRANSPORT.DEDICATED[0].ID;
		else if(this.payloadExtra)
			data.fields[TRANSPORT.DEDICATED] = CRM.TRANSPORT.DEDICATED[2].ID;
		else
			data.fields[TRANSPORT.DEDICATED] = CRM.TRANSPORT.DEDICATED[1].ID;
		data.fields[TRANSPORT.OSAGO.NUM] = this.osagoNumber;
		data.fields[TRANSPORT.OSAGO.EXP_DATE] = this.osagoExpiryDate?.toString();
		data.fields[TRANSPORT.OSAGO.LINK] = this.osagoPhotoLink;
		data.fields[TRANSPORT.DIAGNOSTIC.LINK] = this.diagnosticsPhotoLink;
		data.fields[TRANSPORT.COMMENTS] = this.comments;
		data.fields[TRANSPORT.EXTRA_PARTS] =
			this.fixtures && Array.isArray(this.fixtures)
			? this.fixtures.map(ef => convertBitrix('fixtures', ef, false)) : [];
		if(this.images)
			data.fields[TRANSPORT.IMAGE] = this.images.map(image => image.url);

		return data;
	}
}
