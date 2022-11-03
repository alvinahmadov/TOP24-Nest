import {
	AllowNull,
	Default,
	HasMany,
	HasOne,
	IsDate,
	IsEmail,
	IsUrl,
	Table,
	Unique
}                           from 'sequelize-typescript';
import { ApiProperty }      from '@nestjs/swagger';
import { ObjectType }       from '@nestjs/graphql';
import {
	CARGOINN,
	CRM
}                           from '@config/json';
import {
	CompanyType,
	UserRole
}                           from '@common/enums';
import { TABLE_OPTIONS }    from '@common/constants';
import {
	BooleanColumn,
	DateColumn,
	ICargoInnCompany,
	ICRMEntity,
	IntColumn,
	StringArrayColumn,
	StringColumn,
	TCRMData,
	UrlColumn
}                           from '@common/interfaces';
import entityConfig         from '@common/properties';
import { convertBitrix }    from '@common/utils';
import { ImageFileService } from '@api/services';
import EntityModel          from './entity-model';
import Driver               from './driver.entity';
import Image                from './image.entity';
import Order                from './order.entity';
import Payment              from './payment.entity';
import Transport            from './transport.entity';

const { companyinn: prop } = entityConfig;

/**
 * Cargo company model.
 *
 * @description Cargo company by individual entrepreneur
 *
 * @class CargoInnCompany
 * @interface ICargoInnCompany
 * @extends EntityModel
 * */
@ObjectType()
@Table({ tableName: 'cargoinn_companies', ...TABLE_OPTIONS })
export default class CargoInnCompany
	extends EntityModel<ICargoInnCompany>
	implements ICargoInnCompany, ICRMEntity {
	@ApiProperty(prop.crmId)
	@IntColumn()
	crmId?: number;

	@ApiProperty(prop.name)
	@AllowNull(false)
	@StringColumn()
	name: string;

	@ApiProperty(prop.patronymic)
	@StringColumn()
	patronymic: string;

	@ApiProperty(prop.lastName)
	@StringColumn()
	lastName: string;

	@ApiProperty(prop.type)
	@AllowNull(false)
	@IntColumn()
	type: CompanyType;

	@ApiProperty(prop.role)
	@AllowNull(false)
	@Default(UserRole.CARGO)
	@IntColumn()
	role: UserRole;

	@ApiProperty(prop.taxpayerNumber)
	@AllowNull(false)
	@StringColumn()
	taxpayerNumber: string;

	@ApiProperty(prop.phone)
	@Unique
	@AllowNull(false)
	@StringColumn()
	phone: string;

	@ApiProperty(prop.email)
	@IsEmail
	@Unique
	@StringColumn()
	email: string;

	@ApiProperty(prop.birthDate)
	@IsDate
	@DateColumn()
	birthDate: Date;

	@ApiProperty(prop.passportSerialNumber)
	@StringColumn()
	passportSerialNumber: string;

	@ApiProperty(prop.passportSubdivisionCode)
	@StringColumn()
	passportSubdivisionCode: string;

	@ApiProperty(prop.passportGivenDate)
	@IsDate
	@AllowNull(false)
	@DateColumn()
	passportGivenDate: Date;

	@ApiProperty(prop.passportIssuedBy)
	@AllowNull(false)
	@StringColumn()
	passportIssuedBy: string;

	@ApiProperty(prop.passportRegistrationAddress)
	@AllowNull(false)
	@StringColumn()
	passportRegistrationAddress: string;

	@ApiProperty(prop.paymentType)
	@StringColumn()
	paymentType?: string;

	@ApiProperty(prop.directions)
	@StringArrayColumn()
	directions?: string[];

	@ApiProperty(prop.status)
	@StringColumn()
	status?: string;

	@ApiProperty(prop.confirmed)
	@Default(false)
	@BooleanColumn()
	confirmed?: boolean;

	@ApiProperty(prop.verify)
	@Default('')
	@StringColumn()
	verify?: string;

	@ApiProperty(prop.address)
	@StringColumn()
	address?: string;

	@ApiProperty(prop.postalAddress)
	@StringColumn()
	postalAddress?: string;

	@ApiProperty(prop.actualAddress)
	@StringColumn()
	actualAddress?: string;

	@ApiProperty(prop.personalPhone)
	@StringColumn()
	personalPhone?: string;

	@ApiProperty(prop.contactPhone)
	@StringColumn()
	contactPhone?: string;

	@ApiProperty(prop.info)
	@StringColumn()
	info?: string;

	@ApiProperty(prop.avatarLink)
	@IsUrl
	@UrlColumn()
	avatarLink?: string;

	@ApiProperty(prop.passportPhotoLink)
	@IsUrl
	@UrlColumn()
	passportPhotoLink?: string;

	@ApiProperty(prop.passportSignLink)
	@IsUrl
	@UrlColumn()
	passportSignLink?: string;

	@ApiProperty(prop.passportSelfieLink)
	@IsUrl
	@UrlColumn()
	passportSelfieLink?: string;

	@ApiProperty(prop.drivers)
	@HasMany(() => Driver, 'cargoinnId')
	drivers?: Driver[];

	@ApiProperty(prop.images)
	@HasMany(() => Image, 'cargoinnId')
	images?: Image[];

	@ApiProperty(prop.orders)
	@HasMany(() => Order, 'cargoinnId')
	orders?: Order[];

	@ApiProperty(prop.payment)
	@HasOne(() => Payment, 'cargoinnId')
	payment?: Payment;

	@ApiProperty(prop.transports)
	@HasMany(() => Transport, 'cargoinnId')
	transports?: Transport[];

	public toCrm(): TCRMData {
		const data: TCRMData = { fields: {}, params: { 'REGISTER_SONET_EVENT': 'Y' } };
		data.fields[CARGOINN.NAME.FIRST] = this.name || 'Company';
		data.fields[CARGOINN.NAME.PATRONYMIC] = this.patronymic || '';
		data.fields[CARGOINN.NAME.LAST] = this.lastName || '';
		data.fields[CARGOINN.TYPE] = CRM.COMPANY.TYPES[this.type].ID;
		data.fields[CARGOINN.BIRTH_DATE] = this.birthDate?.toDateString() || '';
		data.fields[CARGOINN.DIRECTIONS] = this.directions?.join() || '';
		data.fields[CARGOINN.INN] = this.taxpayerNumber || '';
		data.fields[CARGOINN.PASSPORT.SERIAL_NUMBER] = this.passportSerialNumber || '';
		data.fields[CARGOINN.PASSPORT.GIVEN_DATE] = this.passportGivenDate.toDateString() || '';
		data.fields[CARGOINN.PASSPORT.SUBDIVISION_CODE] = this.passportSubdivisionCode || '';
		data.fields[CARGOINN.PASSPORT.ISSUED_BY] = this.passportIssuedBy || '';
		data.fields[CARGOINN.PASSPORT.REGISTRATION_ADDRESS] = this.passportRegistrationAddress || '';
		data.fields[CARGOINN.PAYMENT.TYPE] = convertBitrix('paymentType', this.paymentType, false) || '';
		data.fields[CARGOINN.ADDRESS.LEGAL] = this.address || '';
		data.fields[CARGOINN.ADDRESS.POSTAL] = this.postalAddress || '';
		data.fields[CARGOINN.ADDRESS.ACTUAL] = this.actualAddress || '';
		data.fields[CARGOINN.PHONE] = this.phone || '';
		data.fields[CARGOINN.EMAIL] = this.email || '';
		data.fields[CARGOINN.LINK.AVATAR] = this.avatarLink || '';
		data.fields[CARGOINN.LINK.PASSPORT_PHOTO] = this.passportPhotoLink || '';
		data.fields[CARGOINN.LINK.PASSPORT_SIGN] = this.passportSignLink || '';
		data.fields[CARGOINN.LINK.PASSPORT_SELFIE] = this.passportSelfieLink || '';
		if(this.payment)
			this.payment.toCrm(data);
		if(this.images)
			data.fields[CARGOINN.LINK.IMAGE] = this.images.map(image => image.url || '');
		return data;
	}

	public async deleteImages(): Promise<number> {
		const imageFileService = new ImageFileService();
		let count = 0;

		if(this.images) {
			count += await imageFileService.deleteImageList(this.images.map(i => i.url));
		}

		count += await imageFileService.deleteImageList(
			[
				this.avatarLink,
				this.passportSignLink,
				this.passportPhotoLink,
				this.passportSelfieLink
			]
		);

		return count;
	}
}
