import { join }            from 'path';
import { Module }          from '@nestjs/common';
import {
	ApolloDriver,
	ApolloDriverConfig
}                          from '@nestjs/apollo';
import {
	GraphQLModule,
	registerEnumType
}                          from '@nestjs/graphql';
import {
	CompanyType,
	DestinationType,
	DriverStatus,
	LoadingType,
	OfferStatus,
	OrderStage,
	OrderStatus,
	TransportStatus,
	UserRole
}                          from '@common/enums';
import {
	DateScalar,
	TupleScalar,
	UuidScalar
}                          from '@common/scalars';
import RESOLVERS           from '@api/resolvers';
import AuthModule          from './auth.module';
import NotificationsModule from './notification.module';
import ServicesModule      from './services.module';

registerEnumType(CompanyType, {
	name:        'CompanyType',
	description: 'Types of company',
	valuesMap:   {
		ORG: { description: 'Organisation type for company (ООО)' },
		IE:  { description: 'Individual Entrepreneur (ИП)' },
		PI:  { description: 'Private individual (ФЛ)' }
	}
});
registerEnumType(DestinationType, {
	name:      'DestinationType',
	valuesMap: {
		LOAD:     { description: 'Loading point' },
		UNLOAD:   { description: 'Unloading point' },
		COMBINED: { description: 'Loading/Unloading point' }
	}
});
registerEnumType(DriverStatus, { name: 'DriverStatus' });
registerEnumType(LoadingType, { name: 'LoadingType' });
registerEnumType(OfferStatus, {
	name:        'OfferStatus',
	description: 'The status of offer for order.',
	valuesMap:   {
		NONE:      { description: 'No offer was sent.' },
		SENT:      { description: 'Offer sent to driver, but not seen yet.' },
		SEEN:      { description: 'Sent offer is seen by driver.' },
		RESPONDED: { description: 'Driver responded to offer.' },
		DECLINED:  { description: 'Driver declined to offer.' },
		NO_MATCH:  { description: 'Selected drivers don\'t match for order requirements.' }
	}
});
registerEnumType(OrderStage, {
	name:      'OrderStage',
	valuesMap: {
		LOSE:             { description: 'Order has expired.' },
		NEW:              { description: 'The order is created recently.' },
		PREPARATION:      { description: 'Order is in preparation stage.' },
		AGREED_LOGIST:    { description: 'Price has been agreed with the Logist' },
		AGREED_OWNER:     { description: 'Price has been agreed with the cargo owner.' },
		SIGNED_DRIVER:    { description: 'The application with the driver has been signed.' },
		SIGNED_OWNER:     { description: 'The application with the cargo owner has been signed.' },
		CARRYING:         { description: 'Transportation agreed (Carried out).' },
		HAS_PROBLEM:      { description: 'Problem with transportation.' },
		CONTINUE:         { description: 'Transportation continues.' },
		DELIVERED:        { description: 'The cargo has been delivered (documents are in verification).' },
		DOCUMENT_SENT:    { description: 'The documents have been sent.' },
		PAYMENT_FORMED:   { description: 'The payment account has been formed.' },
		PAYMENT_RECEIVED: { description: 'Payment received.' },
		FINISHED:         { description: 'The deal is succeeded.' }
	}
});
registerEnumType(OrderStatus, {
	name:      'OrderStatus',
	valuesMap: {
		PENDING:          { description: 'Order is pending on completion.' },
		ACCEPTED:         { description: 'Order completion is accepted by driver.' },
		PROCESSING:       { description: 'Order is on processing/payment.' },
		CANCELLED:        { description: 'Driver cancelled offer/order.' },
		CANCELLED_BITRIX: { description: 'Order finished.' },
		FINISHED:         { description: 'Cargo owner cancelled order.' }
	}
});
registerEnumType(TransportStatus, { name: 'TransportStatus' });
registerEnumType(UserRole, {
	name:        'UserRole',
	description: 'The supported roles.',
	valuesMap:   {
		NONE:   { description: 'Undefined user type, e.g. driver' },
		LOGIST: { description: 'Logist user' },
		CARGO:  { description: 'Cargo user. Company/CompanyInn' },
		ADMIN:  { description: 'Host admin user' }
	}
});

@Module({
	        imports:   [
		        AuthModule,
		        NotificationsModule,
		        ServicesModule,
		        GraphQLModule.forRoot<ApolloDriverConfig>(
			        {
				        driver:         ApolloDriver,
				        path:           'graphql',
				        playground:     true,
				        debug:          true,
				        autoSchemaFile: join(process.cwd(), 'schema.gql'),
				        resolvers:      [
					        { UUID: UuidScalar }
				        ]
			        }
		        )
	        ],
	        providers: [
		        ...RESOLVERS,
		        DateScalar,
		        TupleScalar
	        ]
        })
export default class GQLModule {}
