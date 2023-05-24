import { FindOptions }   from 'sequelize';
import {
	BelongsTo,
	DefaultScope,
	ForeignKey,
	HasMany,
	HasOne,
	IsUUID,
	Table
}                        from 'sequelize-typescript';
import { ApiProperty }   from '@nestjs/swagger';
import { ObjectType }    from '@nestjs/graphql';
import {
	CARGO,
	CRM,
	PAYMENT
}                        from '@config/json';
import { convertBitrix } from '@common/utils';
import {
	CompanyType,
	UserRole
}                        from '@common/enums';
import { TABLE_OPTIONS } from '@common/constants';
import {
	BooleanColumn,
	DateColumn,
	ICargoCompany,
	ICRMEntity,
	Index,
	IntColumn,
	StringArrayColumn,
	StringColumn,
	TCRMData,
	UrlColumn,
	UuidColumn,
	VirtualColumn
}                        from '@common/interfaces';
import { entityConfig }  from '@api/swagger/properties';
import EntityModel       from './entity-model';
import Driver            from './driver.entity';
import Order             from './order.entity';
import Payment           from './payment.entity';
import Transport         from './transport.entity';
import User              from './user.entity';

const { company: prop } = entityConfig;

const scopeOptions: FindOptions = {
	include: [{ model: User }]
};

/**
 * Cargo company model.
 *
 * @class CargoCompany
 * @interface ICargoCompany
 * @extends EntityModel
 * */
@ObjectType()
@DefaultScope(() => scopeOptions)
@Table({ tableName: 'companies', ...TABLE_OPTIONS })
export default class CargoCompany
	extends EntityModel<ICargoCompany>
	implements ICargoCompany, ICRMEntity {
	@ApiProperty(prop.userId)
	@IsUUID('all')
	@ForeignKey(() => User)
	@Index
	@UuidColumn({
		            allowNull: false,
		            onDelete:  'CASCADE'
	            })
	userId: string;

	@ApiProperty(prop.crmId)
	@Index
	@IntColumn({
		           unique:       true,
		           defaultValue: null
	           })
	crmId?: number;

	@ApiProperty(prop.name)
	@StringColumn({ allowNull: false })
	name: string;

	@ApiProperty(prop.taxpayerNumber)
	@StringColumn({ allowNull: false })
	taxpayerNumber: string;

	@ApiProperty(prop.legalName)
	@StringColumn()
	legalName: string;

	@ApiProperty(prop.type)
	@IntColumn({ allowNull: false })
	type: CompanyType;

	@ApiProperty(prop.email)
	@StringColumn({
		              unique:   true,
		              validate: { isEmail: true }
	              })
	email: string;

	@ApiProperty(prop.phone)
	@StringColumn()
	phone: string;

	@ApiProperty(prop.isDefault)
	@BooleanColumn({ defaultValue: false })
	isDefault?: boolean;

	@ApiProperty(prop.taxReasonCode)
	@StringColumn({ allowNull: false })
	taxReasonCode: string;

	@ApiProperty(prop.registrationNumber)
	@StringColumn({ allowNull: false })
	registrationNumber: string;

	@ApiProperty(prop.passportSerialNumber)
	@StringColumn({ allowNull: false })
	passportSerialNumber: string;

	@ApiProperty(prop.passportSubdivisionCode)
	@StringColumn({ allowNull: false })
	passportSubdivisionCode: string;

	@ApiProperty(prop.passportGivenDate)
	@DateColumn({ allowNull: false })
	passportGivenDate: Date;

	@ApiProperty(prop.passportRegistrationAddress)
	@StringColumn({ allowNull: false })
	passportRegistrationAddress: string;

	@ApiProperty(prop.passportIssuedBy)
	@StringColumn({ allowNull: false })
	passportIssuedBy: string;

	@ApiProperty(prop.director)
	@StringColumn()
	director?: string;

	@ApiProperty(prop.directions)
	@StringArrayColumn({ defaultValue: [] })
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
	@BooleanColumn({ defaultValue: false })
	confirmed?: boolean;

	@ApiProperty(prop.status)
	@StringColumn()
	status?: string;

	@ApiProperty(prop.info)
	@StringColumn()
	info?: string;

	@ApiProperty(prop.avatarLink)
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

	@BooleanColumn({ defaultValue: false })
	hasSent?: boolean;

	@BooleanColumn({ defaultValue: false })
	isAutogenerated?: boolean;

	@ApiProperty(prop.drivers)
	@HasMany(() => Driver, 'cargoId')
	drivers?: Driver[];

	@ApiProperty(prop.orders)
	@HasMany(() => Order, 'cargoId')
	orders?: Order[];

	@ApiProperty(prop.payment)
	@HasOne(() => Payment, 'cargoId')
	payment?: Payment;

	@ApiProperty(prop.transports)
	@HasMany(() => Transport, 'cargoId')
	transports?: Transport[];

	@ApiProperty(prop.user)
	@BelongsTo(() => User, 'userId')
	user: User;

	@VirtualColumn()
	public get role(): UserRole {
		return this.user?.role;
	}

	@VirtualColumn()
	public get userPhone(): string {
		return this.user?.phone;
	}

	@ApiProperty(prop.fullName)
	@VirtualColumn()
	public get fullName(): string {
		return this.legalName ?? this.name;
	}

	public readonly toCrm = (): TCRMData =>
	{
		const data: TCRMData = { fields: {}, params: { 'REGISTER_SONET_EVENT': 'Y' } };
		data.fields[CARGO.LEGAL_NAME] = this.legalName ?? 'Company';
		data.fields[CARGO.DIRECTIONS] = this.directions?.join();
		data.fields[CARGO.INN] = this.taxpayerNumber;
		data.fields[CARGO.NAME] = this.name;
		data.fields[CARGO.KPP] = this.taxReasonCode;
		data.fields[CARGO.OGRN] = this.registrationNumber;
		data.fields[CARGO.TYPE] = CRM.COMPANY.TYPES[this.type].ID;
		data.fields[CARGO.PASSPORT.SERIAL_NUMBER] = this.passportSerialNumber;
		data.fields[CARGO.PASSPORT.GIVEN_DATE] = this.passportGivenDate;
		data.fields[CARGO.PASSPORT.ISSUED_BY] = this.passportIssuedBy;
		data.fields[CARGO.PASSPORT.SUBDIVISION_CODE] = this.passportSubdivisionCode;
		data.fields[CARGO.PASSPORT.REGISTRATION_ADDRESS] = this.passportRegistrationAddress;
		data.fields[CARGO.PAYMENT_TYPE] = convertBitrix('paymentType', this.paymentType, false);
		data.fields[CARGO.ADDRESS.LEGAL] = this.legalAddress;
		data.fields[CARGO.ADDRESS.POSTAL] = this.postalAddress;
		data.fields[CARGO.CEO] = this.director;
		data.fields[CARGO.PHONE] = this.phone;
		data.fields[CARGO.EMAIL] = this.email;
		data.fields[CARGO.LINK.AVATAR] = this.avatarLink;
		data.fields[CARGO.LINK.CERTIFICATE] = this.certificatePhotoLink;
		data.fields[CARGO.LINK.DIRECTOR_PASSPORT] = this.passportPhotoLink;
		data.fields[CARGO.LINK.APPOINTMENT_ORDER] = this.directorOrderPhotoLink;
		data.fields[CARGO.LINK.ATTORNEY_SIGN] = this.attorneySignLink;
		if(this.payment) {
			data.fields[PAYMENT.BANK_NAME] = this.payment.bankName;
			data.fields[PAYMENT.BANK_ID_CODE] = this.payment.bankBic;
			data.fields[PAYMENT.CORRESPONDENT_ACCOUNT] = this.payment.correspondentAccount;
			data.fields[PAYMENT.CURRENT_ACCOUNT] = this.payment.currentAccount;
			data.fields[PAYMENT.OGRNIP] = this.payment.ogrnip;
			data.fields[PAYMENT.OGRNIP_LINK] = this.payment.ogrnipPhotoLink;
		}
		data.fields[CARGO.DATE_CREATE] = this.createdAt;
		data.fields[CARGO.DATE_UPDATE] = this.updatedAt;
		return data;
	};
}
