import { RequestMethod }   from '@nestjs/common';
import { IApiRouteConfig } from '@common/interfaces';
import * as mo             from '@models/index';
import { NApiDescriptors } from '@api/swagger/descriptors';

export type TApiRouteList = {
	admin: IApiRouteConfig<mo.Admin>;
	bitrix: IApiRouteConfig;
	company: IApiRouteConfig<mo.CargoCompany | mo.CargoCompanyInn>;
	driver: IApiRouteConfig<mo.Driver>;
	event: IApiRouteConfig<mo.GatewayEvent>;
	generator?: IApiRouteConfig;
	image: IApiRouteConfig<mo.Image>;
	offer: IApiRouteConfig<mo.Offer>;
	order: IApiRouteConfig<mo.Order>;
	payment: IApiRouteConfig<mo.Payment>;
	reference: IApiRouteConfig;
	transport: IApiRouteConfig<mo.Transport>;
}

export const routeConfig: TApiRouteList = {
	admin:
		{
			path:        'admin',
			description: 'Admin related operations.',
			routes:      {
				list:      {
					path:   '',
					method: RequestMethod.GET,
					api:    NApiDescriptors.admin.list
				},
				filter:    {
					path:   'filter',
					method: RequestMethod.POST,
					api:    NApiDescriptors.admin.filter
				},
				index:     {
					path:   ':id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.admin.index
				},
				create:    {
					path:   '',
					method: RequestMethod.POST,
					api:    NApiDescriptors.admin.create
				},
				update:    {
					path:   ':id',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.admin.update
				},
				delete:    {
					path:   ':id',
					method: RequestMethod.DELETE,
					api:    NApiDescriptors.admin.delete
				},
				refresh:   {
					path:   'refresh',
					method: RequestMethod.PATCH,
					api:    NApiDescriptors.admin.refresh
				},
				hostLogin: {
					path:   'hostlogin',
					method: RequestMethod.POST,
					api:    NApiDescriptors.admin.hostLogin
				},
				signIn:    {
					path:   'signin',
					method: RequestMethod.POST,
					api:    NApiDescriptors.admin.signIn
				}
			}
		},
	bitrix:
		{
			path:        'bitrix',
			description: 'Bitrix related operations.',
			routes:      {
				updateCargo: {
					path:   'cargo/:crmId',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.bitrix.updateCargo
				},
				updateOrder: {
					path:   'order/:crmId',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.bitrix.updateOrder
				},
				deleteOrder: {
					path:   'order/:crmId',
					method: RequestMethod.DELETE,
					api:    NApiDescriptors.bitrix.deleteOrder
				},
				orders:      {
					path:   'orders',
					method: RequestMethod.GET,
					api:    NApiDescriptors.bitrix.orders
				},
				sync:        {
					path:   'orders',
					method: RequestMethod.PATCH,
					api:    NApiDescriptors.bitrix.sync
				},
				webhook:     {
					path:   'webhook',
					method: RequestMethod.POST,
					api:    NApiDescriptors.bitrix.webhook
				}
			}
		},
	company:
		{
			path:        [
				'company',
				'cargo',
				'cargoinn'
			],
			description: 'Cargo company related operations.',
			routes:      {
				list:           {
					path:   '',
					method: RequestMethod.GET,
					api:    NApiDescriptors.company.list
				},
				filter:         {
					path:   'filter',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.filter
				},
				index:          {
					path:   ':id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.company.index
				},
				create:         {
					path:   '',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.create
				},
				update:         {
					path:   ':id',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.company.update
				},
				delete:         {
					path:   ':id',
					method: RequestMethod.DELETE,
					api:    NApiDescriptors.company.delete
				},
				transports:     {
					path:   '/transports/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.transports
				},
				refresh:        {
					path:   'refresh',
					method: RequestMethod.PATCH,
					api:    NApiDescriptors.company.refresh
				},
				control:        {
					path:   'control',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.control
				},
				login:          {
					path:   'login',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.login
				},
				send:           {
					path:   'send/:id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.company.send
				},
				activate:       {
					path:   'activate/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.activate
				},
				user:           {
					path:   'user/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.user
				},
				avatar:         {
					path:   'avatar/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.avatar
				},
				certificate:    {
					path:   'certificate/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.certificate
				},
				passport:       {
					path:   'passport/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.passport
				},
				order:          {
					path:   'order/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.order
				},
				attorney:       {
					path:   'attorney/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.attorney
				},
				passportSelfie: {
					path:   'passport_selfie/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.passportSelfie
				},
				passportSign:   {
					path:   'passport_sign/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.passportSign
				},
				ogrnip:         {
					path:   'ogrnip/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.company.ogrnip
				}
			}
		},
	driver:
		{
			path:        'driver',
			description: 'Сargo company driver related operations.',
			routes:      {
				list:   {
					path:   '',
					method: RequestMethod.GET,
					api:    NApiDescriptors.driver.list
				},
				filter: {
					path:   'filter',
					method: RequestMethod.POST,
					api:    NApiDescriptors.driver.filter
				},
				index:  {
					path:   ':id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.driver.index
				},
				create: {
					path:   '',
					method: RequestMethod.POST,
					api:    NApiDescriptors.driver.create
				},
				update: {
					path:   ':id',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.driver.update
				},
				delete: {
					path:   ':id',
					method: RequestMethod.DELETE,
					api:    NApiDescriptors.driver.delete
				},
				avatar: {
					path:   'avatar/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.driver.avatar
				},
				front:  {
					path:   'front/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.driver.front
				},
				back:   {
					path:   'back/:id',
					method: RequestMethod.POST,
					api:    NApiDescriptors.driver.back
				}
			}
		},
	event:
		{
			path:        'event',
			description: 'Сargo company driver related operations.',
			routes:      {
				list:   {
					path:   '',
					method: RequestMethod.GET,
					api:    NApiDescriptors.event.list
				},
				filter: {
					path:   'filter',
					method: RequestMethod.POST,
					api:    NApiDescriptors.event.filter
				},
				index:  {
					path:   ':id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.event.index
				},
				create: {
					path:   '',
					method: RequestMethod.POST,
					api:    NApiDescriptors.event.create
				},
				update: {
					path:   ':id',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.event.update
				},
				delete: {
					path:   ':id',
					method: RequestMethod.DELETE,
					api:    NApiDescriptors.event.delete
				}
			}
		},
	generator:
		{
			path:        'generator',
			description: 'Generate random data for database.',
			routes:      {
				company: {
					path:   'companies',
					method: RequestMethod.POST,
					api:    NApiDescriptors.generator.company
				},
				order:   {
					path:   'orders',
					method: RequestMethod.POST,
					api:    NApiDescriptors.generator.order
				}
			}
		},
	image:
		{
			path:        'image',
			description: 'Image related operations.',
			routes:      {
				list:   {
					path:   '',
					method: RequestMethod.GET,
					api:    NApiDescriptors.image.list
				},
				filter: {
					path:   'filter',
					method: RequestMethod.POST,
					api:    NApiDescriptors.image.filter
				},
				index:  {
					path:   ':id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.image.index
				},
				create: {
					path:   '',
					method: RequestMethod.POST,
					api:    NApiDescriptors.image.create
				},
				update: {
					path:   ':id',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.image.update
				},
				delete: {
					path:   ':id',
					method: RequestMethod.DELETE,
					api:    NApiDescriptors.image.delete
				}
			}
		},
	offer:
		{
			path:        [
				'offer',
				'order_association'
			],
			description: 'Offer operations between order and driver.'
			             + '',
			routes:      {
				list:      {
					path:   '',
					method: RequestMethod.GET,
					api:    NApiDescriptors.offer.list
				},
				filter:    {
					path:   'filter',
					method: RequestMethod.POST,
					api:    NApiDescriptors.offer.filter
				},
				index:     {
					path:   ':id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.offer.index
				},
				update:    {
					path:   ':orderId/:driverId',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.offer.update
				},
				send:      {
					path:   ':orderId/:driverId',
					method: RequestMethod.POST,
					api:    NApiDescriptors.offer.send
				},
				upd:       {
					path:   ':orderId/:driverId',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.offer.upd
				},
				sendList:  {
					path:   'drivers/:orderId',
					method: RequestMethod.POST,
					api:    NApiDescriptors.offer.sendList
				},
				accept:    {
					path:   'accept/:orderId/:driverId',
					method: RequestMethod.PATCH,
					api:    NApiDescriptors.offer.accept
				},
				decline:   {
					path:   'decline/:orderId/:driverId',
					method: RequestMethod.PATCH,
					api:    NApiDescriptors.offer.decline
				},
				order:     {
					path:   'order/:orderId',
					method: RequestMethod.POST,
					api:    NApiDescriptors.offer.order
				},
				driver:    {
					path:   'driver/:driverId',
					method: RequestMethod.POST,
					api:    NApiDescriptors.offer.driver
				},
				driverUpd: {
					path:   'driver/:driverId',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.offer.driverUpd
				},
				transport: {
					path:   'transport/:orderId',
					method: RequestMethod.POST,
					api:    NApiDescriptors.offer.transport
				}
			}
		},
	order:
		{
			path:        'order',
			description: 'Order related operations. '
			             + 'Order data fetched from bitrix server to backend.',
			routes:      {
				list:
					{
						path:   '',
						method: RequestMethod.GET,
						api:    NApiDescriptors.order.list
					},
				filter:
					{
						path:   'filter',
						method: RequestMethod.POST,
						api:    NApiDescriptors.order.filter
					},
				index:
					{
						path:   ':id',
						method: RequestMethod.GET,
						api:    NApiDescriptors.order.index
					},
				create:
					{
						path:   '',
						method: RequestMethod.POST,
						api:    NApiDescriptors.order.create
					},
				update:
					{
						path:   ':id',
						method: RequestMethod.PUT,
						api:    NApiDescriptors.order.update
					},
				delete:
					{
						path:   ':id',
						method: RequestMethod.DELETE,
						api:    NApiDescriptors.order.delete
					},
				cargos:
					{
						path:   'cargolist/:cargoId',
						method: RequestMethod.GET,
						api:    NApiDescriptors.order.cargos
					},
				driver:
					{
						path:   'driver/:driverId',
						method: RequestMethod.GET,
						api:    NApiDescriptors.order.driver
					},
				send:
					{
						path:   'send/:id',
						method: RequestMethod.GET,
						api:    NApiDescriptors.order.send
					},
				shipping:
					{
						path:   'shipping/:id',
						method: RequestMethod.POST,
						api:    NApiDescriptors.order.shipping
					},
				shippingDelete:
					{
						path:   'shipping/:id',
						method: RequestMethod.DELETE,
						api:    NApiDescriptors.order.shippingDelete
					},
				payment:
					{
						path:   'payment/:id',
						method: RequestMethod.POST,
						api:    NApiDescriptors.order.payment
					},
				paymentDelete:
					{
						path:   'payment/:id',
						method: RequestMethod.DELETE,
						api:    NApiDescriptors.order.paymentDelete
					},
				contract:
					{
						path:   'contract/:id',
						method: RequestMethod.POST,
						api:    NApiDescriptors.order.contract
					},
				contractDelete:
					{
						path:   'contract/:id',
						method: RequestMethod.DELETE,
						api:    NApiDescriptors.order.contractDelete
					},
				receipt:
					{
						path:   'receipt/:id',
						method: RequestMethod.POST,
						api:    NApiDescriptors.order.receipt
					},
				receiptDelete:
					{
						path:   'receipt/:id',
						method: RequestMethod.DELETE,
						api:    NApiDescriptors.order.receiptDelete
					}
			}
		},
	payment:
		{
			path:        'payment',
			description: 'Сargo company payment details related operations.',
			routes:      {
				list:   {
					path:   '',
					method: RequestMethod.GET,
					api:    NApiDescriptors.payment.list
				},
				filter: {
					path:   'filter',
					method: RequestMethod.POST,
					api:    NApiDescriptors.payment.filter
				},
				index:  {
					path:   ':id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.payment.index
				},
				create: {
					path:   '',
					method: RequestMethod.POST,
					api:    NApiDescriptors.payment.create
				},
				update: {
					path:   ':id',
					method: RequestMethod.PUT,
					api:    NApiDescriptors.payment.update
				},
				delete: {
					path:   ':id',
					method: RequestMethod.DELETE,
					api:    NApiDescriptors.payment.delete
				}
			}
		},
	reference:
		{
			path:        'reference',
			description: 'Reference operations.',
			routes:      {
				address:         {
					path:   'address/:id',
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.address
				},
				addresses:       {
					path:   'address',
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.addresses
				},
				addressLocation: {
					path:   'address/location',
					method: RequestMethod.POST
				},
				filter:          {
					path:   'address',
					method: RequestMethod.POST,
					api:    NApiDescriptors.reference.filter
				},
				fixtures:        {
					path:   'fixtures',
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.fixtures
				},
				loadingTypes:    {
					path:   'loading_types',
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.loadingTypes
				},
				payloads:        {
					path:   'payloads',
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.payloads
				},
				paymentTypes:    {
					path:   'payment_types',
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.paymentTypes
				},
				riskClasses:     {
					path:   'risk_classes',
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.riskClasses
				},
				transportTypes:  {
					path:   [
						'transport_types',
						'auto_types'
					],
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.transportTypes
				},
				transportBrands: {
					path:   'brands',
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.transportBrands
				},
				transportModels: {
					path:   [
						'models',
						'models/:brandId'
					],
					method: RequestMethod.GET,
					api:    NApiDescriptors.reference.transportModels
				}
			}
		},
	transport:
		{
			path:        'transport',
			description: 'Сargo company transport related operations',
			routes:      {
				list:
					{
						path:   '',
						method: RequestMethod.GET,
						api:    NApiDescriptors.transport.list
					},
				filter:
					{
						path:   'filter',
						method: RequestMethod.POST,
						api:    NApiDescriptors.transport.filter
					},
				index:
					{
						path:   ':id',
						method: RequestMethod.GET,
						api:    NApiDescriptors.transport.index
					},
				create:
					{
						path:   '',
						method: RequestMethod.POST,
						api:    NApiDescriptors.transport.create
					},
				update:
					{
						path:   ':id',
						method: RequestMethod.PUT,
						api:    NApiDescriptors.transport.update
					},
				delete:
					{
						path:   ':id',
						method: RequestMethod.DELETE,
						api:    NApiDescriptors.transport.delete
					},
				activate:
					{
						path:   'activate/:id',
						method: RequestMethod.POST,
						api:    NApiDescriptors.transport.activate
					},
				driver:
					{
						path:   'driver/:driverId',
						method: RequestMethod.POST,
						api:    NApiDescriptors.transport.driver
					},
				image:
					{
						path:   'image/:id',
						method: RequestMethod.POST,
						api:    NApiDescriptors.transport.image
					},
				imageDel:
					{
						path:   'image/:transportId/:id',
						method: RequestMethod.DELETE,
						api:    NApiDescriptors.transport.image
					},
				diag:
					{
						path:   'diag/:id',
						method: RequestMethod.POST
					},
				osago:
					{
						path:   'osago/:id',
						method: RequestMethod.POST
					}
			}
		}
};

export function getRouteConfig(key: keyof TApiRouteList)
	: IApiRouteConfig & { tag: string } {
	const path = routeConfig[key].path;
	const tag = path[0].toUpperCase() + path.slice(1);
	const routes = routeConfig[key].routes;
	return { path, tag, routes };
}
