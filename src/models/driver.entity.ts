import {
	BelongsTo,
	ForeignKey,
	HasMany,
	HasOne,
	Table
}                           from 'sequelize-typescript';
import {
	Field,
	InterfaceType,
	ObjectType
}                           from '@nestjs/graphql';
import { ApiProperty }      from '@nestjs/swagger';
import { CRM, DRIVER }      from '@config/json';
import {
	DestinationType,
	DriverStatus,
	UserRole
}                           from '@common/enums';
import { UuidScalar }       from '@common/scalars';
import { TABLE_OPTIONS }    from '@common/constants';
import {
	BooleanColumn,
	DateColumn,
	FloatColumn,
	ICRMEntity,
	IDriver,
	IDriverOperation,
	Index,
	IntColumn,
	JsonbColumn,
	StringColumn,
	TCRMData,
	UrlColumn,
	UuidColumn,
	VirtualColumn
}                           from '@common/interfaces';
import entityConfig         from '@common/properties';
import { ImageFileService } from '@api/services';
import EntityModel          from './entity-model';
import CargoCompany         from './cargo.entity';
import CargoInnCompany      from './cargo-inn.entity';
import Order                from './order.entity';
import Transport            from './transport.entity';

const { driver: prop } = entityConfig;

@InterfaceType()
export class DriverOperation
	implements IDriverOperation {
	type: DestinationType;
	unloaded?: boolean;
	loaded?: boolean;
}

/**
 * Cargo company driver model.
 *
 * @description Driver of cargo company with assigned transports.
 *
 * @class Driver
 * @implements IDriver
 * @extends EntityModel
 * */
@ObjectType()
@Table(TABLE_OPTIONS)
export default class Driver
	extends EntityModel<IDriver>
	implements IDriver, ICRMEntity {
	@ApiProperty(prop.cargoId)
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoCompany)
	@Index
	@UuidColumn()
	cargoId?: string;

	@ApiProperty(prop.cargoinnId)
	@Field(() => UuidScalar)
	@ForeignKey(() => CargoInnCompany)
	@Index
	@UuidColumn()
	cargoinnId?: string;

	@ApiProperty(prop.crmId)
	@Index
	@IntColumn({
		           unique:       true,
		           defaultValue: null
	           })
	crmId?: number;

	@ApiProperty(prop.name)
	@StringColumn()
	name: string;

	@ApiProperty(prop.patronymic)
	@StringColumn()
	patronymic?: string;

	@ApiProperty(prop.lastName)
	@StringColumn()
	lastName?: string;

	@ApiProperty(prop.email)
	@StringColumn({
		              unique:   true,
		              validate: { isEmail: true }
	              })
	email: string;

	@ApiProperty(prop.birthDate)
	@DateColumn()
	birthDate: Date;

	@ApiProperty(prop.isReady)
	@BooleanColumn({ defaultValue: false })
	isReady: boolean;

	@ApiProperty(prop.status)
	@IntColumn({
		           allowNull:    false,
		           defaultValue: DriverStatus.NONE
	           })
	status: DriverStatus;

	@ApiProperty(prop.passportSerialNumber)
	@StringColumn()
	passportSerialNumber: string;

	@ApiProperty(prop.passportDate)
	@DateColumn()
	passportDate: Date;

	@ApiProperty(prop.passportSubdivisionCode)
	@StringColumn()
	passportSubdivisionCode: string;

	@ApiProperty(prop.passportIssuedBy)
	@StringColumn()
	passportIssuedBy: string;

	@ApiProperty(prop.passportRegistrationAddress)
	@StringColumn()
	passportRegistrationAddress: string;

	@ApiProperty(prop.role)
	@IntColumn({ defaultValue: UserRole.NONE })
	role?: UserRole;

	@ApiProperty(prop.phone)
	@StringColumn()
	phone?: string;

	@ApiProperty(prop.taxpayerNumber)
	@StringColumn()
	taxpayerNumber?: string;

	@ApiProperty(prop.registrationAddress)
	@StringColumn()
	registrationAddress?: string;

	@ApiProperty(prop.licenseNumber)
	@StringColumn()
	licenseNumber: string;

	@ApiProperty(prop.licenseDate)
	@DateColumn()
	licenseDate: Date;

	@ApiProperty(prop.address)
	@StringColumn()
	address?: string;

	@ApiProperty(prop.phoneSecond)
	@StringColumn()
	phoneSecond?: string;

	@ApiProperty(prop.latitude)
	@FloatColumn()
	latitude?: number;

	@ApiProperty(prop.longitude)
	@FloatColumn()
	longitude?: number;

	@ApiProperty(prop.currentPoint)
	@StringColumn()
	currentPoint?: string;

	@ApiProperty(prop.currentAddress)
	@StringColumn()
	currentAddress?: string;

	@ApiProperty(prop.operation)
	@JsonbColumn()
	operation?: DriverOperation;

	@ApiProperty(prop.payloadCity)
	@StringColumn()
	payloadCity?: string;

	@ApiProperty(prop.payloadRegion)
	@StringColumn()
	payloadRegion?: string;

	@ApiProperty(prop.payloadDate)
	@DateColumn()
	payloadDate?: Date;

	@ApiProperty(prop.avatarLink)
	@UrlColumn()
	avatarLink?: string;

	@ApiProperty(prop.passportPhotoLink)
	@UrlColumn()
	passportPhotoLink: string;

	@ApiProperty(prop.passportSignLink)
	@UrlColumn()
	passportSignLink?: string;

	@ApiProperty(prop.passportSelfieLink)
	@UrlColumn()
	passportSelfieLink?: string;

	@ApiProperty(prop.licenseFrontLink)
	@UrlColumn()
	licenseFrontLink?: string;

	@ApiProperty(prop.licenseBackLink)
	@UrlColumn()
	licenseBackLink?: string;

	@ApiProperty(prop.info)
	@StringColumn()
	info?: string;

	@ApiProperty(prop.cargo)
	@BelongsTo(() => CargoCompany, 'cargoId')
	cargo?: CargoCompany;

	@ApiProperty(prop.cargoinn)
	@BelongsTo(() => CargoInnCompany, 'cargoinnId')
	cargoinn?: CargoInnCompany;

	@ApiProperty(prop.order)
	@HasOne(() => Order, 'driverId')
	order?: Order;

	@ApiProperty(prop.transports)
	@HasMany(() => Transport, 'driverId')
	transports?: Transport[];

	@ApiProperty(prop.hasSent)
	@BooleanColumn({ defaultValue: false })
	hasSent?: boolean;

	@ApiProperty(prop.fullName)
	@VirtualColumn()
	public get fullName(): string {
		const name = this.name ? ` ${this.name[0]}.` : '';
		const surname = this.lastName ? `${this.lastName}` : '';
		const middleName = this.patronymic ? ` ${this.patronymic[0]}.` : '';
		return `${surname}${middleName}${name}`;
	}

	@ApiProperty(prop.companyName)
	@VirtualColumn()
	public get companyName(): string {
		if(this.cargo) {
			return this.cargo.name;
		}
		else if(this.cargoinn) {
			const surname = this.cargoinn.lastName ? `${this.cargoinn.lastName}` : '';
			const name = this.cargoinn.name ? ` ${this.cargoinn.name[0]}.` : '';
			const middleName = this.cargoinn.patronymic ? ` ${this.cargoinn.patronymic[0]}.` : '';
			return `${surname}${middleName}${name}`;
		}
		else return this.fullName;
	}

	public async deleteImages(): Promise<number> {
		const imageFileService = new ImageFileService();
		return imageFileService.deleteImageList(
			[
				this.avatarLink,
				this.passportPhotoLink,
				this.passportSignLink,
				this.passportSelfieLink,
				this.licenseBackLink,
				this.licenseFrontLink
			]
		);
	}

	public toCrm(
		companyCrmId: number,
		directions: string[]
	): TCRMData {
		const data: TCRMData = { fields: {}, params: { 'REGISTER_SONET_EVENT': 'N' } };
		data.fields[DRIVER.COMPANY_ID] = companyCrmId;
		data.fields[DRIVER.USER_TYPE] = CRM.CONTACT_TYPES[1].ID;
		data.fields[DRIVER.NAME.FIRST] = this.name;
		data.fields[DRIVER.NAME.PATRONYMIC] = this.patronymic;
		data.fields[DRIVER.NAME.LAST] = this.lastName;
		data.fields[DRIVER.BIRTHDATE] = this.birthDate;
		data.fields[DRIVER.EMAIL] = this.email;
		data.fields[DRIVER.PHONE] = this.phone;
		data.fields[DRIVER.INN] = this.taxpayerNumber;
		data.fields[DRIVER.DIRECTIONS] = directions.join(', ');
		data.fields[DRIVER.ADDRESS] = this.address;
		data.fields[DRIVER.PASSPORT.GIVEN_DATE] = this.passportDate;
		data.fields[DRIVER.PASSPORT.ISSUED_BY] = this.passportIssuedBy;
		data.fields[DRIVER.PASSPORT.SERIAL_NUMBER] = this.passportSerialNumber;
		data.fields[DRIVER.PASSPORT.SUBDIVISION_CODE] = this.passportSubdivisionCode;
		data.fields[DRIVER.HAS_PHONE] = this.phone ? 'Y' : 'N';
		data.fields[DRIVER.HAS_EMAIL] = this.email ? 'Y' : 'N';
		data.fields[DRIVER.LICENSE.NUM] = this.licenseNumber;
		data.fields[DRIVER.LICENSE.EXP_DATE] = this.licenseDate;
		data.fields[DRIVER.LINK.AVATAR] = this.avatarLink;
		data.fields[DRIVER.LINK.PASSPORT] = this.passportPhotoLink;
		data.fields[DRIVER.LINK.LICENSE.FRONT] = this.licenseFrontLink ?? '';
		data.fields[DRIVER.LINK.LICENSE.BACK] = this.licenseBackLink ?? '';
		data.fields[DRIVER.DATE_CREATE] = this.createdAt;
		data.fields[DRIVER.DATE_UPDATE] = this.updatedAt;
		return data;
	};
}
