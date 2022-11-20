import { RequestMethod }   from '@nestjs/common';
import {
	ApiQueryOptions,
	getSchemaPath
}                          from '@nestjs/swagger';
import { IApiRouteConfig } from '@common/interfaces';
import {
	commonRoutes,
	getApiResponseContent,
	getApiResponseContentOf,
	getApiResponseSchema,
	getApiResponseSchemaOf
}                          from '@common/utils';
import * as mo             from '@models/index';
import * as dto            from '@api/dto';

export type TApiRouteList = {
	admin: IApiRouteConfig<mo.Admin>;
	bitrix: IApiRouteConfig;
	company: IApiRouteConfig<mo.CargoCompany | mo.CargoInnCompany>;
	driver: IApiRouteConfig<mo.Driver>;
	generator?: IApiRouteConfig;
	image: IApiRouteConfig<mo.Image>;
	offer: IApiRouteConfig<mo.Offer>;
	order: IApiRouteConfig<mo.Order>;
	payment: IApiRouteConfig<mo.Payment>;
	reference: IApiRouteConfig;
	transport: IApiRouteConfig<mo.Transport>;
}

const parameter: Record<string, any> = {
	id:    {
		in:       'path',
		name:     'id',
		required: true,
		schema:   { type: 'string' }
	},
	crmId: {
		in:       'path',
		name:     'crmId',
		required: true,
		schema:   { type: 'number' }
	}
};

const queryOptions: { [key: string]: ApiQueryOptions } = {
	full:  {
		name:        'full',
		description: 'Return with child entities.',
		required:    false,
		schema:      { default: false }
	},
	by:    {
		description: 'Used method for signin',
		enum:        ['email', 'phone'],
		required:    true,
		schema:      {
			default: 'email'
		}
	},
	pt:    {
		description: 'Destination point label',
		enum:        [
			'A', 'B', 'C',
			'D', 'E', 'F',
			'G', 'H', 'I',
			'J', 'K', 'L',
			'M', 'N', 'O',
			'P', 'Q', 'R',
			'S', 'T', 'U',
			'V', 'W', 'X',
			'Y', 'Z'
		]
	},
	index: {
		description: 'Index of file',
		type:        'number'
	}
};

const security: any = [{ bearerAuth: [] }];

export const routeConfig: TApiRouteList = {
	admin:     {
		path:        'admin',
		description: 'Admin related operations.',
		routes:      {
			list:       {
				path:   '',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get list of admins/users', security },
					responses: {
						200: {
							status:      200,
							description: 'List of admin items.',
							content:     {
								'application/json': getApiResponseSchema(
									mo.Admin,
									{
										isArray:     true,
										description: 'List of admin entities'
									}
								)
							}
						}
					}
				}
			},
			filter:     {
				path:   'filter',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary: 'Filter admin entites.',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of filtered admin items.',
							content:     {
								'application/json': getApiResponseSchema(
									mo.Admin,
									{
										isArray:     true,
										description: 'List of filtered admin entities'
									}
								)
							}
						}
					}
				}
			},
			index:      {
				path:   ':id',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Get admin by ID',
						description: 'Get specified by id admin.',
						parameters:  [parameter.full],
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Found admin entity',
							...getApiResponseContent(
								'application/json',
								mo.Admin,
								{
									isArray:     false,
									description: 'Admin found by id'
								}
							)
						},
						404: {
							status:      404,
							description: 'Admin entity not found.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			create:     {
				path:   '',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Create admin/user record',
						requestBody: { $ref: getSchemaPath(dto.AdminCreateDto), required: false },
						security
					},
					responses: {
						201: {
							status:      201,
							description: 'Admin entity created!',
							...getApiResponseContent(
								'application/json',
								mo.Admin,
								{ description: 'Created admin entity' }
							)
						},
						400: {
							status:      400,
							description: 'Admin was not created.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			update:     {
				path:   ':id',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:     'Update admin/user record',
						parameters:  [parameter.id],
						requestBody: { $ref: getSchemaPath(dto.AdminUpdateDto) },
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Admin entity updated!',
							...getApiResponseContent(
								'application/json',
								mo.Admin,
								{ description: 'Updated admin entity' }
							)
						},
						404: {
							status:      404,
							description: 'Admin was not created.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			delete:     {
				path:   ':id',
				method: RequestMethod.DELETE,
				api:    {
					operation: {
						summary:    'Delete admin/user record',
						parameters: [parameter.id],
						security
					}
				}
			},
			refresh:    {
				path:   'refresh',
				method: RequestMethod.PATCH,
				api:    {
					operation: { summary: 'Refresh user authentication token', security }
				}
			},
			host_login: {
				path:   'hostlogin',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Login to service host as super admin.',
						requestBody: {
							content: {
								'application/json': {
									schema: {
										$ref: getSchemaPath(dto.AdminCredentials)
									}
								}
							}
						}
					},
					responses: {
						200: {
							status:      200,
							description: 'Success',
							schema:      {
								type:        'object',
								description: 'Admin login response',
								properties:  {
									status:  {
										type:     'number',
										nullable: false
									},
									data:    {
										type:       'object',
										properties: {
											user: { $ref: getSchemaPath(mo.Admin) },
											code: {
												type:     'number',
												nullable: true
											}
										}
									},
									message: {
										type:     'string',
										nullable: true
									}
								}
							}
						}
					}
				}
			},
			signin:     {
				path:   'signin',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Sign in to admin page for user.',
						parameters:  [parameter.by],
						requestBody: {
							content: {
								'application/json': {
									schema: {
										oneOf: [
											{ $ref: getSchemaPath(dto.SignInEmailDto) },
											{ $ref: getSchemaPath(dto.SignInPhoneDto) }
										]
									}
								}
							}
						}
					},
					responses: {
						200: {
							status:      200,
							description: 'User successfuly signed in.',
							schema:      {
								type:        'object',
								description: 'Admin login response',
								properties:  {
									status:  {
										type:     'number',
										nullable: false
									},
									data:    {
										type:        'object',
										description: '',
										properties:  {
											user: { $ref: getSchemaPath(mo.Admin) },
											code: {
												type:     'number',
												nullable: true
											}
										}
									},
									message: {
										type:     'string',
										nullable: true
									}
								}
							}
						}
					}
				}
			}
		}
	},
	bitrix:    {
		path:        'bitrix',
		description: 'Bitrix related operations.',
		routes:      {
			updateCargo: {
				path:   'cargo/:crmId',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:    'Update company data in bitrix.',
						parameters: [parameter.crmId]
					}
				}
			},
			updateOrder: {
				path:   'order/:crmId',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:    'Update order data in bitrix.',
						parameters: [parameter.crmId]
					}
				}
			},
			deleteOrder: {
				path:   'order/:crmId',
				method: RequestMethod.DELETE,
				api:    {
					operation: {
						summary:    'Delete order',
						parameters: [parameter.crmId]
					}
				}
			},
			orders:      {
				path:   'orders',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get order list from bitrix' }
				}
			},
			sync:        {
				path:   'orders',
				method: RequestMethod.PATCH,
				api:    {
					operation: {
						summary: 'Update orders data from bitrix.'
					}
				}
			},
			webhook:     {
				path:   'webhook',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Webhook to update orders.',
						description: 'On change, create and delete of order in bitrix '
						             + 'receives an event, which synchronizes operation '
						             + 'in service'
					}
				}
			}
		}
	},
	company:   {
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
				api:    {
					operation: {
						summary: 'Get list of companies',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of cargo company items.',
							content:     {
								'application/json': getApiResponseSchemaOf(
									'allOf',
									[mo.CargoCompany, mo.CargoInnCompany],
									{
										isArray:     true,
										description: 'List of admin entities'
									}
								)
							}
						}
					}
				}
			},
			filter:         {
				path:   'filter',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Filter cargo companies.',
						description: 'Filter list of data by provided body',
						requestBody: {
							content: {
								'application/json': {
									schema: {
										oneOf: [
											{ $ref: getSchemaPath(dto.CompanyFilter) },
											{ $ref: getSchemaPath(dto.CompanyInnFilter) }
										]
									}
								}
							}
						},
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of filtered cargo company items.',
							content:     {
								'application/json': {
									schema: {
										type:  'array',
										allOf: [
											{ $ref: getSchemaPath(mo.CargoCompany) },
											{ $ref: getSchemaPath(mo.CargoInnCompany) }
										]
									}
								}
								// 'application/json': getApiResponseSchemaOf(
								// 	'allOf',
								// 	[mo.CargoCompany, mo.CargoInnCompany],
								// 	{
								// 		isArray:     true,
								// 		description: 'List of filtered cargo company entities'
								// 	}
								// )
							}
						}
					}
				}
			},
			index:          {
				path:   ':id',
				method: RequestMethod.GET,
				api:    {
					operation:    {
						summary:     'Get cargo company',
						description: 'Gets single cargo company specified by `id`',
						parameters:  parameter.id,
						security
					},
					queryOptions: queryOptions.full,
					responses:    {
						200: {
							status:      200,
							description: 'Retreive single company item.',
							...getApiResponseContentOf(
								'application/json',
								'oneOf',
								[dto.CompanyCreateDto, dto.CompanyInnCreateDto]
							)
						},
						404: {
							status:      404,
							description: 'Company entity not found.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			create:         {
				path:   '',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Create a new cargo company.',
						requestBody: {
							content: {
								'application/json': {
									schema: {
										oneOf: [
											{ $ref: getSchemaPath(dto.CompanyCreateDto) },
											{ $ref: getSchemaPath(dto.CompanyInnCreateDto) }
										]
									}
								}
							}
						},
						security
					},
					responses: {
						201: {
							status:      201,
							description: 'Created company item.',
							content:     {
								'application/json': getApiResponseSchemaOf(
									'oneOf',
									[mo.CargoCompany, mo.CargoInnCompany],
									{ description: 'List of filtered cargo company entities' }
								)
							}
						},
						400: {
							status:      400,
							description: 'Company was not created.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			update:         {
				path:   ':id',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:     'Update cargo company',
						description: 'Updates single cargo company specified by `id`',
						requestBody: {
							content: {
								'application/json': {
									schema: {
										oneOf: [
											{ $ref: getSchemaPath(dto.CompanyUpdateDto) },
											{ $ref: getSchemaPath(dto.CompanyInnUpdateDto) }
										]
									}
								}
							}
						},
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of filtered cargo company items.',
							content:     {
								'application/json': getApiResponseSchemaOf(
									'oneOf',
									[mo.CargoCompany, mo.CargoInnCompany],
									{ description: 'List of filtered cargo company entities' }
								)
							}
						}
					}
				}
			},
			delete:         {
				path:   ':id',
				method: RequestMethod.DELETE,
				api:    {
					operation: {
						summary:     'Delete cargo company',
						description: 'Deletes single cargo company specified by `id`',
						security
					}
				}
			},
			transports:     {
				path:   '/transports/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Filter cargo company transports',
						description: 'Get matching transports by parameter filters by order details',
						security
					}
				}
			},
			refresh:        {
				path:   'refresh',
				method: RequestMethod.PATCH,
				api:    {
					operation: {
						summary: 'Refresh access token',
						security
					}
				}
			},
			control:        {
				path:   'control',
				method: RequestMethod.POST
			},
			login:          {
				path:   'login',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Login to company account.',
						description: 'Try to login to the account if code is supplied.\n'
						             + 'Otherwise request login code'
					},
					responses: {
						200: {
							status:      200,
							description: 'Login as company user.',
							...getApiResponseContentOf(
								'application/json',
								'oneOf',
								[mo.CargoCompany, mo.CargoInnCompany],
								{ isArray: true }
							)
						},
						404: {
							status:      404,
							description: 'Company entity not found.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			send:           {
				path:   'send/:id',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Send company info into Bitrix CRM service.',
						description: 'Updates and sends cargo company data with all related '
						             + 'data (transports, drivers) into the Bitrix CRM '
						             + 'service and updates cargo crm_id from result.',
						security
					}
				}
			},
			avatar:         {
				path:   'avatar/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary: 'Upload company avatar.',
						security
					}
				}
			},
			certificate:    {
				path:   'certificate/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary: 'Upload certificate scan.',
						security
					}
				}
			},
			passport:       {
				path:   'passport/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload passport scan for registration.',
						description: 'Updates passport scan file and sets up link '
						             + 'to the updated file',
						parameters:  [parameter.id],
						security
					}
				}
			},
			order:          {
				path:   'order/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload order scan for registration.',
						description: 'Updates order document scan file and sets up link '
						             + 'to the updated file',
						security
					}
				}
			},
			attorney:       {
				path:   'attorney/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload attorney sign scan for registration.',
						description: 'Updates attorney sign document scan file and sets up '
						             + 'link to the updated file',
						security
					}
				}
			},
			passportSelfie: {
				path:   'passport_selfie/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload passport selfie scan for registration.',
						description: 'Updates passport selfie scan file and sets up link '
						             + 'to the updated file',
						parameters:  [parameter.id],
						security
					}
				}
			},
			passportSign:   {
				path:   'passport_sign/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload passport sign scan for registration.',
						description: 'Updates passport sign scan file and sets up link '
						             + 'to the updated file',
						parameters:  [parameter.id],
						security
					}
				}
			},
			ogrnip:         {
				path:   'ogrnip/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload ogrnip scan for payment.',
						description: 'Updates ogrnip scan file and sets up link to the '
						             + 'updated file',
						security
					}
				}
			}
		}
	},
	driver:    {
		path:        'driver',
		description: 'Сargo company driver related operations.',
		routes:      {
			list:   {
				path:   '',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary: 'Get list of drivers',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of drivers.',
							...getApiResponseContent('application/json', mo.Driver, { isArray: true })
						}
					}
				}
			},
			filter: {
				path:   'filter',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Filter drivers.',
						description: 'Filter list of data by provided body',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of filtered drivers.',
							...getApiResponseContent('application/json', mo.Driver, { isArray: true })
						}
					}
				}
			},
			index:  {
				path:   ':id',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Get driver',
						description: 'Gets single cargo company driver specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Found driver',
							...getApiResponseContent('application/json', mo.Driver)
						},
						404: {
							status:      404,
							description: 'Driver entity not found.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			create: {
				path:   '',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary: 'Create a new cargo company.',
						security
					},
					responses: {
						201: {
							status:      201,
							description: 'Driver entity created!',
							...getApiResponseContent(
								'application/json',
								mo.Driver,
								{ description: 'Created driver entity' }
							)
						},
						404: {
							status:      400,
							description: 'Driver was not created.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			update: {
				path:   ':id',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:     'Update driver',
						description: 'Updates single driver specified by `id`',
						requestBody: { $ref: getSchemaPath(dto.DriverUpdateDto) },
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Updated driver entity',
							...getApiResponseContent('application/json', mo.Driver)
						}
					}
				}
			},
			delete: {
				path:   ':id',
				method: RequestMethod.DELETE,
				api:    {
					operation: {
						summary:     'Delete driver',
						description: 'Deletes driver specified by `id`',
						security
					}
				}
			},
			avatar: {
				path:   'avatar/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload avatar image.',
						description: 'Uploads to Yandex Storage avatar of driver.',
						security
					},
					responses: {
						200: {
							status: 200,
							...getApiResponseContent('application/json', mo.Driver)
						}
					}
				}
			},
			front:  {
				path:   'front/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload license scan.',
						description: 'Uploads to Yandex Storage front scan of driver license.',
						security
					},
					responses: {
						200: {
							status: 200,
							...getApiResponseContent('application/json', mo.Driver)
						}
					}
				}
			},
			back:   {
				path:   'back/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Upload license scan.',
						description: 'Uploads to Yandex Storage back scan of driver license.',
						security
					},
					responses: {
						200: {
							status: 200,
							...getApiResponseContent('application/json', mo.Driver)
						}
					}
				}
			}
		}
	},
	generator: {
		path:        'generator',
		description: 'Generate random data for database.',
		routes:      {
			company: {
				path:   'companies',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     '',
						requestBody: {
							content: {
								'application/json': {
									schema: {
										type:       'object',
										properties: {
											count: {
												type:        'number',
												description: 'Number of companies to create.'
											},
											type:  {
												type:        'number',
												description: 'Type of company to create.'
											}
										}
									}
								}
							}
						}
					}
				}
			},
			order:   {
				path:   'orders',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     '',
						requestBody: {
							content: {
								'application/json': {
									schema: {
										type:       'object',
										properties: {
											count: {
												type:        'number',
												description: 'Number of order to create.'
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	},
	image:     {
		path:        'image',
		description: 'Image related operations.',
		routes:      {
			list:   {
				path:   '',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary: 'Get list of images',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of images.',
							...getApiResponseContent('application/json', mo.Image, { isArray: true })
						}
					}
				}
			},
			filter: {
				path:   'filter',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Filter images.',
						description: 'Filter list of data by provided body',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of filtered images.',
							...getApiResponseContent('application/json', mo.Image, { isArray: true })
						}
					}
				}
			},
			index:  {
				path:   ':id',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Get image',
						description: 'Gets single image specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Found image',
							...getApiResponseContent('application/json', mo.Image)
						},
						404: {
							status:      404,
							description: 'Image entity not found.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			create: {
				path:   '',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary: 'Create a new image.',
						security
					},
					responses: {
						201: {
							status:      201,
							description: 'Image entity created!',
							...getApiResponseContent(
								'application/json',
								mo.Image,
								{ description: 'Created image entity' }
							)
						},
						404: {
							status:      400,
							description: 'Image was not created.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			update: {
				path:   ':id',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:     'Update image',
						description: 'Updates single image specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Updated image entity',
							...getApiResponseContent('application/json', mo.Image)
						},
						400: {
							status:      400,
							description: 'Bad request.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			delete: {
				path:   ':id',
				method: RequestMethod.DELETE,
				api:    {
					operation: {
						summary:     'Delete image',
						description: 'Deletes image specified by `id`',
						security
					}
				}
			}
		}
	},
	offer:     {
		path:        [
			'offer',
			'order_association'
		],
		description: 'Offer operations between order and driver.',
		routes:      {
			list:      {
				path:   '',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary: 'Get list of offers',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of offers.',
							...getApiResponseContent('application/json', mo.Offer, { isArray: true })
						}
					}
				}
			},
			filter:    {
				path:   'filter',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Filter offers.',
						description: 'Filter list of data by provided body',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of filtered offers.',
							...getApiResponseContent('application/json', mo.Order, { isArray: true })
						}
					}
				}
			},
			index:     {
				path:   ':id',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Get offer.',
						description: 'Gets single offer specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Found offer',
							...getApiResponseContent('application/json', mo.Offer)
						},
						404: {
							status:      404,
							description: 'Offer entity not found.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			update:    {
				path:   ':orderId/:driverId',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:     'Update offer',
						description: 'Updates single offer specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Updated offer entity',
							...getApiResponseContent('application/json', mo.Offer)
						},
						400: {
							status:      400,
							description: 'Bad request.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			send:      {
				path:   ':orderId/:driverId',
				method: RequestMethod.POST
			},
			upd:       {
				path:   ':orderId/:driverId',
				method: RequestMethod.PUT
			},
			sendList:  {
				path:   'drivers/:orderId',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Create new offers or update existing ones.',
						description: 'Creates offers to send to drivers in relation to order.',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of offers.',
							...getApiResponseContent('application/json', mo.Offer, { isArray: true })
						}
					}
				}
			},
			accept:    {
				path:   'accept/:orderId/:driverId',
				method: RequestMethod.PATCH,
				api:    {
					operation: {
						summary:     'Accept offer.',
						description: 'Accept driver\'s response for order offer.',
						security
					}
				}
			},
			decline:   {
				path:   'decline/:orderId/:driverId',
				method: RequestMethod.PATCH,
				api:    {
					operation: {
						summary:     'Decline offer.',
						description: 'Decline driver\'s response for order offer.',
						security
					}
				}
			},
			order:     {
				path:   'order/:orderId',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Get associated drivers.',
						description: 'Retrieve list of drivers associated with order'
						             + 'with specific `orderId`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Found drivers.',
							...getApiResponseContent('application/json', mo.Order, { isArray: true })
						}
					}
				}
			},
			driver:    {
				path:   'driver/:driverId',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Get associated orders.',
						description: 'Retrieve list of orders associated with driver '
						             + 'with specific `driverId`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Found orders.',
							...getApiResponseContent('application/json', mo.Order, { isArray: true })
						}
					}
				}
			},
			driverUpd: {
				path:   'driver/:driverId',
				method: RequestMethod.PUT
			},
			transport: {
				path:   'transport/:orderId',
				method: RequestMethod.POST
			}
		}
	},
	order:     {
		path:        'order',
		description: 'Order related operations. '
		             + 'Order data fetched from bitrix server to backend.',
		routes:      {
			list:     {
				path:   '',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary: 'Get list of orders',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of orders.',
							...getApiResponseContent('application/json', mo.Order, { isArray: true })
						}
					}
				}
			},
			filter:   {
				path:   'filter',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Filter orders.',
						description: 'Filter list of data by provided body',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of filtered orders.',
							...getApiResponseContent('application/json', mo.Order, { isArray: true })
						}
					}
				}
			},
			index:    {
				path:   ':id',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Get order.',
						description: 'Gets single order specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Found order',
							...getApiResponseContent('application/json', mo.Order)
						},
						404: {
							status:      404,
							description: 'Order entity not found.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			create:   {
				path:   '',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary: 'Create a new order.',
						security
					},
					responses: {
						201: {
							status:      201,
							description: 'Order entity created!',
							...getApiResponseContent(
								'application/json',
								mo.Order,
								{ description: 'Created order entity' }
							)
						},
						404: {
							status:      400,
							description: 'Unable to create order.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			update:   {
				path:   ':id',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:     'Update order',
						description: 'Updates single order specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Updated order entity',
							...getApiResponseContent('application/json', mo.Order)
						},
						400: {
							status:      400,
							description: 'Bad request.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			delete:   {
				path:   ':id',
				method: RequestMethod.DELETE,
				api:    {
					operation: {
						summary:     'Delete order',
						description: 'Deletes order specified by `id`',
						security
					}
				}
			},
			cargos:   {
				path:   'cargolist/:cargoId',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Get list of orders of cargo company.',
						description: 'Get orders related to specific cargo company by `id`.'
					}
				}
			},
			driver:   {
				path:   'driver/:driverId',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Get list of orders of driver.',
						description: 'Get orders related to specific driver by `id`.'
					}
				}
			},
			send:     {
				path:   'send/:id',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Update order in bitrix.',
						description: 'Update fields of order in bitrix from database '
						             + 'actions.\nIt must be called every time when order '
						             + 'updated locally in database.'
					}
				}
			},
			shipping: {
				path:   'shipping/:id',
				method: RequestMethod.POST,
				api:    {
					operation:    {
						summary:     'Send shipping document.',
						description: 'Upload document scans of cargo company driver with'
						             + ' related order. Sent scan is stored in Yandex '
						             + 'Storage Object which returns link to the '
						             + 'uploaded file.'
					},
					queryOptions: [queryOptions.pt, queryOptions.index]
				}
			},
			shippingDelete:
			          {
				          path:   'shipping/:id',
				          method: RequestMethod.DELETE,
				          api:    {
					          operation:    {
						          summary:     'Send shipping document.',
						          description: 'Upload document scans of cargo company driver with'
						                       + ' related order. Sent scan is stored in Yandex '
						                       + 'Storage Object which returns link to the '
						                       + 'uploaded file.'
					          },
					          queryOptions: [queryOptions.pt, queryOptions.index]
				          }
			          },
			payment:  {
				path:   'payment/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Send payment document.',
						description: 'Upload document scans of cargo company driver with'
						             + ' related order. Sent scan is stored in Yandex '
						             + 'Storage Object which returns link to the '
						             + 'uploaded file.'
					}
				}
			},
			paymentDelete:
			          {
				          path:   'payment/:id',
				          method: RequestMethod.DELETE,
				          api:    {
					          operation: {
						          summary:     'Delete payment document.',
						          description: 'Delete uploaded document scans of cargo company driver with'
						                       + ' related order. Sent scan is stored in Yandex '
						                       + 'Storage Object which returns link to the '
						                       + 'uploaded file.'
					          }
				          }
			          },
			contract: {
				path:   'contract/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Send contract document.',
						description: 'Upload document scans of cargo company driver with'
						             + ' related order. Sent scan is stored in Yandex '
						             + 'Storage Object which returns link to the '
						             + 'uploaded file.'
					}
				}
			},
			contractDelete:
			          {
				          path:   'contract/:id',
				          method: RequestMethod.DELETE,
				          api:    {
					          operation: {
						          summary:     'Delete contract document.',
						          description: 'Delete uploaded document scans of cargo company '
						                       + 'driver with related order.'
					          }
				          }
			          },
			receipt:  {
				path:   'receipt/:id',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Send receipt document.',
						description: 'Upload document scans of cargo company driver with'
						             + ' related order. Sent scan is stored in Yandex '
						             + 'Storage Object which returns link to the '
						             + 'uploaded file.'
					}
				}
			},
			receiptDelete:
			          {
				          path:   'receipt/:id',
				          method: RequestMethod.DELETE,
				          api:    {
					          operation: {
						          summary:     'Delete receipt document.',
						          description: 'Delete uploaded document scans of cargo company driver with'
						                       + ' related order. Sent scan is stored in Yandex '
						                       + 'Storage Object which returns link to the '
						                       + 'uploaded file.'
					          }
				          }
			          }
		}
	},
	payment:   {
		path:        'payment',
		description: 'Сargo company payment details related operations.',
		routes:      {
			list:   {
				path:   '',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary: 'Get list of payments',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of payments.',
							...getApiResponseContent('application/json', mo.Payment, { isArray: true })
						}
					}
				}
			},
			filter: {
				path:   'filter',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary:     'Filter payments.',
						description: 'Filter list of data by provided body',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'List of filtered payments.',
							...getApiResponseContent('application/json', mo.Payment, { isArray: true })
						}
					}
				}
			},
			index:  {
				path:   ':id',
				method: RequestMethod.GET,
				api:    {
					operation: {
						summary:     'Get payment.',
						description: 'Gets single payment specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Found payment',
							...getApiResponseContent('application/json', mo.Order)
						},
						404: {
							status:      404,
							description: 'Payment entity not found.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			create: {
				path:   '',
				method: RequestMethod.POST,
				api:    {
					operation: {
						summary: 'Create a new payment.',
						security
					},
					responses: {
						201: {
							status:      201,
							description: 'Payment entity created!',
							...getApiResponseContent(
								'application/json',
								mo.Payment,
								{ description: 'Created payment entity' }
							)
						},
						404: {
							status:      400,
							description: 'Unable to create payment.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			update: {
				path:   ':id',
				method: RequestMethod.PUT,
				api:    {
					operation: {
						summary:     'Update payment',
						description: 'Updates single payment specified by `id`',
						security
					},
					responses: {
						200: {
							status:      200,
							description: 'Updated payment entity',
							...getApiResponseContent('application/json', mo.Payment)
						},
						400: {
							status:      400,
							description: 'Bad request.',
							...getApiResponseContent('application/json')
						}
					}
				}
			},
			delete: {
				path:   ':id',
				method: RequestMethod.DELETE,
				api:    {
					operation: {
						summary:     'Delete payment',
						description: 'Deletes payment specified by `id`',
						security
					}
				}
			}
		}
	},
	reference: {
		path:        'reference',
		description: 'Reference operations.',
		routes:      {
			address:        {
				path:   'address/:id',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get address specified by `id`' }
				}
			},
			addresses:      {
				path:   'address',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get list of addresses.' }
				}
			},
			filter:         {
				path:   'address',
				method: RequestMethod.POST,
				api:    {
					operation: { summary: 'Get list of filtered addresses.' }
				}
			},
			fixtures:       {
				path:   'fixtures',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get list of transport additional fixtures.' }
				}
			},
			loadingTypes:   {
				path:   'loading_types',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get list of transport loading types.' }
				}
			},
			payloads:       {
				path:   'payloads',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get list of transport payloads.' }
				}
			},
			paymentTypes:   {
				path:   'payment_types',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get list of company payment types.' }
				}
			},
			riskClasses:    {
				path:   'risk_classes',
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get list of transport risk classes.' }
				}
			},
			transportTypes: {
				path:   [
					'transport_types',
					'auto_types'
				],
				method: RequestMethod.GET,
				api:    {
					operation: { summary: 'Get list of transport types.' }
				}
			}
		}
	},
	transport: {
		path:        'transport',
		description: 'Сargo company transport related operations',
		routes:      {
			...commonRoutes(mo.Transport),
			driver: {
				path:   'driver/:driverId',
				method: RequestMethod.POST
			},
			image:  {
				path:   'image/:id',
				method: RequestMethod.POST
			},
			diag:   {
				path:   'diag/:id',
				method: RequestMethod.POST
			},
			osago:  {
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
