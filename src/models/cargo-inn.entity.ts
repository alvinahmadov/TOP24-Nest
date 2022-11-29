import {
	BelongsTo,
	ForeignKey,
	HasMany,
	HasOne,
	IsUUID,
	Table
}                           from 'sequelize-typescript';
import { ApiProperty }      from '@nestjs/swagger';
import { ObjectType }       from '@nestjs/graphql';
import {
	CARGOINN,
	CRM,
	PAYMENT
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
	Index,
	IntColumn,
	StringArrayColumn,
	StringColumn,
	TCRMData,
	UrlColumn,
	UuidColumn,
	VirtualColumn
}                           from '@common/interfaces';
import entityConfig         from '@common/properties';
import { convertBitrix }    from '@common/utils';
import { ImageFileService } from '@api/services';
import EntityModel          from './entity-model';
import Driver               from './driver.entity';
import Order                from './order.entity';
import Payment              from './payment.entity';
import Transport            from './transport.entity';
import User                 from './user.entity';

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
@Table({ tableName: 'companies_inn', ...TABLE_OPTIONS })
export default class CargoInnCompany
	extends EntityModel<ICargoInnCompany>
	implements ICargoInnCompany {
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

	@ApiProperty(prop.patronymic)
	@StringColumn()
	patronymic: string;

	@ApiProperty(prop.lastName)
	@StringColumn()
	lastName: string;

	@ApiProperty(prop.taxpayerNumber)
	@StringColumn({ allowNull: false })
	taxpayerNumber: string;

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
	isDefault: boolean;

	@ApiProperty(prop.birthDate)
	@DateColumn()
	birthDate: Date;

	@ApiProperty(prop.passportSerialNumber)
	@StringColumn()
	passportSerialNumber: string;

	@ApiProperty(prop.passportSubdivisionCode)
	@StringColumn()
	passportSubdivisionCode: string;

	@ApiProperty(prop.passportGivenDate)
	@DateColumn({ allowNull: false })
	passportGivenDate: Date;

	@ApiProperty(prop.passportIssuedBy)
	@StringColumn({ allowNull: false })
	passportIssuedBy: string;

	@ApiProperty(prop.passportRegistrationAddress)
	@StringColumn({ allowNull: false })
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
	@BooleanColumn({ defaultValue: false })
	confirmed?: boolean;

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
	@UrlColumn()
	avatarLink?: string;

	@ApiProperty(prop.passportPhotoLink)
	@UrlColumn()
	passportPhotoLink?: string;

	@ApiProperty(prop.passportSignLink)
	@UrlColumn()
	passportSignLink?: string;

	@ApiProperty(prop.passportSelfieLink)
	@UrlColumn()
	passportSelfieLink?: string;

	@BooleanColumn({ defaultValue: false })
	hasSent?: boolean;

	@ApiProperty(prop.drivers)
	@HasMany(() => Driver, 'cargoinnId')
	drivers?: Driver[];

	@ApiProperty(prop.orders)
	@HasMany(() => Order, 'cargoinnId')
	orders?: Order[];

	@ApiProperty(prop.payment)
	@HasOne(() => Payment, 'cargoinnId')
	payment?: Payment;

	@ApiProperty(prop.transports)
	@HasMany(() => Transport, 'cargoinnId')
	transports?: Transport[];

	@ApiProperty(prop.user)
	@BelongsTo(() => User, 'userId')
	user: User;

	@VirtualColumn()
	public get role(): UserRole {
		return this.user?.role ?? UserRole.CARGO;
	}

	@VirtualColumn()
	public get userPhone(): string {
		return this.user?.phone;
	}

	public toCrm = (): TCRMData =>
	{
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
		if(this.payment) {
			data.fields[PAYMENT.BANK_NAME] = this.payment.bankName ?? '';
			data.fields[PAYMENT.BANK_ID_CODE] = this.payment.bankBic ?? '';
			data.fields[PAYMENT.CORRESPONDENT_ACCOUNT] = this.payment.correspondentAccount ?? '';
			data.fields[PAYMENT.CURRENT_ACCOUNT] = this.payment.currentAccount ?? '';
			data.fields[PAYMENT.OGRNIP] = this.payment.ogrnip;
			data.fields[PAYMENT.OGRNIP_LINK] = this.payment.ogrnipPhotoLink ?? '';
		}
		return data;
	};

	public async deleteImages(): Promise<number> {
		const imageFileService = new ImageFileService();
		return imageFileService.deleteImageList(
			[
				this.avatarLink,
				this.passportSignLink,
				this.passportPhotoLink,
				this.passportSelfieLink
			]
		);
	}
}
