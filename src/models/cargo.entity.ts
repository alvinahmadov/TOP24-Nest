import {
	AllowNull,
	Default,
	HasMany,
	HasOne,
	IsEmail,
	IsUrl,
	Table,
	Unique
}                           from 'sequelize-typescript';
import { ApiProperty }      from '@nestjs/swagger';
import { ObjectType }       from '@nestjs/graphql';
import {
	CARGO,
	CRM
}                           from '@config/json';
import { convertBitrix }    from '@common/utils';
import {
	CompanyType,
	UserRole
}                           from '@common/enums';
import { TABLE_OPTIONS }    from '@common/constants';
import {
	ICargoCompany,
	BooleanColumn,
	DateColumn,
	ICRMEntity,
	IntColumn,
	StringArrayColumn,
	StringColumn,
	TCRMData,
	UrlColumn
}                           from '@common/interfaces';
import entityConfig         from '@common/properties';
import { ImageFileService } from '@api/services';
import EntityModel          from './entity-model';
import Driver               from './driver.entity';
import Image                from './image.entity';
import Order                from './order.entity';
import Payment              from './payment.entity';
import Transport            from './transport.entity';

const { company: prop } = entityConfig;

/**
 * Cargo company model.
 *
 * @class CargoInnCompany
 * @interface ICargoInnCompany
 * @extends EntityModel
 * */
@ObjectType()
@Table({ tableName: 'cargo_companies', ...TABLE_OPTIONS })
export default class CargoCompany
	extends EntityModel<ICargoCompany>
	implements ICargoCompany, ICRMEntity {
	@ApiProperty(prop.crmId)
	@IntColumn()
	crmId?: number;

	@ApiProperty(prop.name)
	@AllowNull(false)
	@StringColumn()
	name: string;

	@ApiProperty(prop.taxpayerNumber)
	@AllowNull(false)
	@StringColumn()
	taxpayerNumber: string;

	@ApiProperty(prop.shortName)
	@StringColumn()
	shortName: string;

	@ApiProperty(prop.email)
	@Unique
	@IsEmail
	@StringColumn()
	email: string;

	@ApiProperty(prop.type)
	@AllowNull(false)
	@IntColumn()
	type: CompanyType;

	@ApiProperty(prop.role)
	@Default(UserRole.CARGO)
	@IntColumn()
	role: UserRole;

	@ApiProperty(prop.phone)
	@Unique
	@AllowNull(false)
	@StringColumn()
	phone: string;

	@ApiProperty(prop.taxReasonCode)
	@AllowNull(false)
	@StringColumn()
	taxReasonCode: string;

	@ApiProperty(prop.registrationNumber)
	@AllowNull(false)
	@StringColumn()
	registrationNumber: string;

	@ApiProperty(prop.passportSerialNumber)
	@AllowNull(false)
	@StringColumn()
	passportSerialNumber: string;

	@ApiProperty(prop.passportSubdivisionCode)
	@AllowNull(false)
	@StringColumn()
	passportSubdivisionCode: string;

	@ApiProperty(prop.passportGivenDate)
	@AllowNull(false)
	@DateColumn()
	passportGivenDate: Date;

	@ApiProperty(prop.passportRegistrationAddress)
	@AllowNull(false)
	@StringColumn()
	passportRegistrationAddress: string;

	@ApiProperty(prop.passportIssuedBy)
	@AllowNull(false)
	@StringColumn()
	passportIssuedBy: string;

	@ApiProperty(prop.director)
	@StringColumn()
	director?: string;

	@ApiProperty(prop.directions)
	@Default([])
	@StringArrayColumn()
	directions?: string[];

	@ApiProperty(prop.paymentType)
	@StringColumn()
	paymentType?: string;

	@ApiProperty(prop.contactPhone)
	@StringColumn()
	contactPhone?: string;

	@ApiProperty(prop.legalAddress)
	@StringColumn()
	legalAddress?: string;

	@ApiProperty(prop.postalAddress)
	@StringColumn()
	postalAddress?: string;

	@ApiProperty(prop.contact)
	@StringColumn()
	contact?: string;

	@ApiProperty(prop.contactSecond)
	@StringColumn()
	contactSecond?: string;

	@ApiProperty(prop.contactThird)
	@StringColumn()
	contactThird?: string;

	@ApiProperty(prop.confirmed)
	@Default(false)
	@BooleanColumn()
	confirmed?: boolean;

	@ApiProperty(prop.verify)
	@Default('')
	@StringColumn()
	verify?: string;

	@ApiProperty(prop.status)
	@StringColumn()
	status?: string;

	@ApiProperty(prop.info)
	@StringColumn()
	info?: string;

	@ApiProperty(prop.avatarLink)
	@IsUrl
	@UrlColumn()
	avatarLink?: string;

	@ApiProperty(prop.certificatePhotoLink)
	@UrlColumn()
	certificatePhotoLink?: string;

	@ApiProperty(prop.passportPhotoLink)
	@UrlColumn()
	passportPhotoLink?: string;

	@ApiProperty(prop.directorOrderPhotoLink)
	@UrlColumn()
	directorOrderPhotoLink?: string;

	@ApiProperty(prop.attorneySignLink)
	@UrlColumn()
	attorneySignLink?: string;

	@ApiProperty(prop.drivers)
	@HasMany(() => Driver, 'cargoId')
	drivers?: Driver[];

	@ApiProperty(prop.images)
	@HasMany(() => Image, 'cargoId')
	images?: Image[];

	@ApiProperty(prop.orders)
	@HasMany(() => Order, 'cargoId')
	orders?: Order[];

	@ApiProperty(prop.payment)
	@HasOne(() => Payment, 'cargoId')
	payment?: Payment;

	@ApiProperty(prop.transports)
	@HasMany(() => Transport, 'cargoId')
	transports?: Transport[];

	public async deleteImages(): Promise<number> {
		const imageFileService = new ImageFileService();
		let count = 0;
		if(this.images) {
			count += await imageFileService.deleteImageList(this.images.map(i => i.url));
		}

		count += await imageFileService.deleteImageList(
			[
				this.avatarLink,
				this.attorneySignLink,
				this.passportPhotoLink,
				this.certificatePhotoLink,
				this.directorOrderPhotoLink
			]
		);

		return count;
	}

	public toCrm(): TCRMData {
		const data: TCRMData = { fields: {}, params: { 'REGISTER_SONET_EVENT': 'Y' } };
		data.fields[CARGO.SHORTNAME] = this.shortName ?? 'Company';
		data.fields[CARGO.DIRECTIONS] = this.directions?.join() ?? '';
		data.fields[CARGO.INN] = this.taxpayerNumber ?? '';
		data.fields[CARGO.NAME] = this.name ?? '';
		data.fields[CARGO.KPP] = this.taxReasonCode ?? '';
		data.fields[CARGO.OGRN] = this.registrationNumber ?? '';
		data.fields[CARGO.TYPE] = CRM.COMPANY.TYPES[this.type].ID;
		data.fields[CARGO.PASSPORT.SERIAL_NUMBER] = this.passportSerialNumber ?? '';
		data.fields[CARGO.PASSPORT.GIVEN_DATE] = this.passportGivenDate.toDateString() ?? '';
		data.fields[CARGO.PASSPORT.ISSUED_BY] = this.passportIssuedBy ?? '';
		data.fields[CARGO.PASSPORT.SUBDIVISION_CODE] = this.passportSubdivisionCode ?? '';
		data.fields[CARGO.PASSPORT.REGISTRATION_ADDRESS] = this.passportRegistrationAddress ?? '';
		data.fields[CARGO.PAYMENT_TYPE] = convertBitrix('paymentType', this.paymentType, false) ?? '';
		data.fields[CARGO.ADDRESS.LEGAL] = this.legalAddress ?? '';
		data.fields[CARGO.ADDRESS.POSTAL] = this.postalAddress ?? '';
		data.fields[CARGO.CEO] = this.director ?? '';
		data.fields[CARGO.PHONE] = this.phone ?? '';
		data.fields[CARGO.EMAIL] = this.email ?? '';
		data.fields[CARGO.LINK.AVATAR] = this.avatarLink ?? '';
		data.fields[CARGO.LINK.CERTIFICATE] = this.certificatePhotoLink ?? '';
		data.fields[CARGO.LINK.DIRECTOR_PASSPORT] = this.passportPhotoLink ?? '';
		data.fields[CARGO.LINK.APPOINTMENT_ORDER] = this.directorOrderPhotoLink ?? '';
		data.fields[CARGO.LINK.ATTORNEY_SIGN] = this.attorneySignLink ?? '';
		if(this.payment)
			this.payment.toCrm(data);
		if(this.images)
			data.fields[CARGO.LINK.IMAGE] = this.images.map(image => image.url ?? '');
		return data;
	}
}
