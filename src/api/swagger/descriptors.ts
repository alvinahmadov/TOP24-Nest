import { HttpStatus, RequestMethod } from '@nestjs/common';
import {
	ApiOperationOptions,
	ApiQueryOptions,
	ApiResponseOptions,
	getSchemaPath
}                                    from '@nestjs/swagger';
import {
	getResponseSchema,
	getApiResponseContent,
	getApiResponseContentOf,
	getApiResponseSchema,
	getApiResponseSchemaOf,
	getJsonApiResponseContent,
	getJsonApiResponseContentOf
}                                    from '@common/utils';
import { IApiSwaggerDescription }    from '@common/interfaces';
import env                           from '@config/env';
import * as mo                       from '@models/index';
import * as dto                      from '@api/dto';
import {
	ParameterObject,
	ReferenceObject,
	SchemaObject
}                                    from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

type TApiDescriptor = {
	[k: string]: IApiSwaggerDescription
};
type TParamKey = 'id' | 'crmId' | 'full'

const security: any = [{ bearerAuth: [] }];

const parameter: Record<TParamKey, ParameterObject | ReferenceObject> = {
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
	},
	full:  {
		name:            'full',
		in:              'query',
		required:        false,
		schema:          { default: true },
		allowEmptyValue: true
	}
};

const affectedCountSchema: SchemaObject | ReferenceObject = {
	type:       'object',
	properties: {
		affectedCount: {
			type: 'number'
		}
	}
};

const companyDeleteSchema: SchemaObject | ReferenceObject = {
	type:       'object',
	properties: {
		affectedCount:     {
			type:        'number',
			description: 'Количество удаленных компаний, обычно 1.'
		},
		paymentDataImages: {
			type:        'number',
			description: 'Количество удаленных банковских реквизитов.'
		},
		companyImages:     {
			type:        'number',
			description: 'Количество удаленных фото компании.'
		},
		transportImages:   {
			type:        'number',
			description: 'Количество удаленных фото транспортов принадлежащих к компании.'
		},
		driverImages:      {
			type:        'number',
			description: 'Количество удаленных фото водителей.'
		}
	}
};

const accessTokenSchema: SchemaObject | ReferenceObject = {
	type:       'object',
	properties: {
		accessToken: {
			type: 'string'
		}
	}
};

const hostLoginSchema: SchemaObject | ReferenceObject = {
	type:       'object',
	properties: {
		user: { $ref: getSchemaPath(mo.Admin) },
		code: {
			type:     'number',
			nullable: true
		}
	}
};

const transformSchema = (schema: SchemaObject | ReferenceObject) =>
	env.api.compatMode
	? schema
	: {
			type:       'object',
			properties: {
				statusCode: {
					type: 'number'
				},
				data:       schema,
				message:    {
					type: 'string'
				}
			}
		};

export namespace NApiDescriptors {
	export const admin: TApiDescriptor = {
		list:      {
			operation: { summary: 'Получить список админов/логистов', security },
			responses: {
				200: {
					status:      200,
					description: 'Список админов/логистов.',
					content:     getJsonApiResponseContent(
						mo.Admin,
						{ isArray: true, description: 'Список пользователей' }
					)
				}
			}
		},
		filter:    {
			operation: {
				summary: 'Фильтр пользователей.',
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'Список отфильтрованных админов/пользователей.',
					content:     getJsonApiResponseContent(mo.Admin, { isArray: true })
				}
			}
		},
		index:     {
			operation: {
				summary: 'Найти админа/логиста через `id`',
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'Пользователь найден',
					content:     getJsonApiResponseContent(
						mo.Admin,
						{
							isArray:     false,
							description: 'Admin found by id'
						}
					)
				},
				404: {
					status:      404,
					description: 'Пользователь не найден.',
					content:     getJsonApiResponseContent()
				}
			}
		},
		create:    {
			operation: { summary: 'Создать пользователя', security },
			responses: {
				201: {
					status:      201,
					description: 'Admin entity created!',
					content:     getJsonApiResponseContent(
						mo.Admin,
						{ description: 'Created admin entity' }
					)
				},
				400: {
					status:      400,
					description: 'Не удалось создать пользователя.',
					content:     getJsonApiResponseContent()
				}
			}
		},
		update:    {
			operation: { summary: 'Обновить данные админа/логиста.', security },
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
		},
		delete:    {
			operation: {
				summary:     'Удаление админа/логиста.',
				description: 'Безвозвратно удаляет пользователя',
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'Пользователь успешно удален.',
					content:     { 'application/json': { schema: transformSchema(affectedCountSchema) } }
				}
			}
		},
		refresh:   {
			operation: { summary: 'Обновить токен авторизации', security },
			responses: {
				200: {
					status:      200,
					description: '',
					content:     { 'application/json': { schema: transformSchema(accessTokenSchema) } }
				}
			}
		},
		hostLogin: {
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
					schema:      transformSchema(hostLoginSchema)
				}
			}
		},
		signIn:    {
			operation: {
				summary:     'Авторизация в приложение',
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
	};

	export const bitrix: TApiDescriptor = {
		updateCargo: {
			operation: {
				summary:    'Update company data in bitrix.',
				parameters: [parameter.crmId]
			}
		},
		updateOrder: {
			operation: {
				summary:    'Update order data in bitrix.',
				parameters: [parameter.crmId]
			}
		},
		deleteOrder: {
			operation: {
				summary:    'Delete order',
				parameters: [parameter.crmId]
			}
		},
		orders:      {
			operation: { summary: 'Get order list from bitrix' }
		},
		sync:        {
			operation: {
				summary: 'Update orders data from bitrix.'
			}
		},
		webhook:     {
			operation: {
				summary:     'Webhook to update orders.',
				description: 'On change, create and delete of order in bitrix '
				             + 'receives an event, which synchronizes operation '
				             + 'in service'
			}
		}
	};

	export const company: TApiDescriptor = {
		list:           {
			operation: {
				summary:     'Получить список компаний.',
				description: 'Возвращает список всех компаний различного типа. '
				             + 'В список входят компании юрлица, ип и физлица.',
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'List of cargo company items.',
					content:     {
						'application/json': getApiResponseSchemaOf(
							'allOf',
							[mo.CargoCompany, mo.CargoCompanyInn],
							{
								isArray:     true,
								description: 'List of admin entities'
							}
						)
					}
				}
			}
		},
		filter:         {
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
					description: 'Список отфильтрованных компаний.',
					content:     {
						'application/json': getApiResponseSchemaOf(
							'allOf',
							[mo.CargoCompany, mo.CargoCompanyInn],
							{ isArray: true }
						)
					}
				}
			}
		},
		index:          {
			operation: {
				summary:     'Get cargo company',
				description: 'Gets single cargo company specified by `id`',
				parameters:  [parameter['full']],
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'Получить компанию по `id`.',
					content:     getJsonApiResponseContentOf(
						'oneOf',
						[mo.CargoCompany, mo.CargoCompanyInn]
					)
				},
				404: {
					status:      404,
					description: 'Компания не найдена.',
					content:     getJsonApiResponseContent()
				}
			}
		},
		create:         {
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
					status:      HttpStatus.CREATED,
					description: 'Компания успешно создана.',
					content:     getJsonApiResponseContentOf(
						'oneOf',
						[dto.CompanyCreateDto, dto.CompanyInnCreateDto]
					)
				},
				400: {
					status:      HttpStatus.BAD_REQUEST,
					description: 'Не удалось создать компанию.',
					content:     getJsonApiResponseContent()
				}
			}
		},
		update:         {
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
					status:      HttpStatus.OK,
					description: 'Данные компании успешно обновлены.',
					content:     getJsonApiResponseContentOf(
						'oneOf',
						[dto.CompanyCreateDto, dto.CompanyInnCreateDto]
					)
				},
				404: {
					status:      HttpStatus.NOT_FOUND,
					description: 'Компания не найдена.',
					content:     getJsonApiResponseContent()
				}
			}
		},
		delete:         {
			operation: {
				summary:     'Delete cargo company',
				description: 'Deletes single cargo company specified by `id`',
				security
			},
			responses: {
				200: {
					status:      HttpStatus.OK,
					description: 'Компания успешно удалена!',
					content:     { 'application/json': { schema: transformSchema(companyDeleteSchema) } }
				}
			}
		},
		transports:     {
			operation: {
				summary:     'Получает транспорты компаний, соответствующие фильтру.',
				description: 'Компании, а также водители и транспорты этих компаний проходят фильтрацию',
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'Транспорты компаний, соответствующие фильтрам получены.',
					content:     getJsonApiResponseContent(mo.Transport, { isArray: true })
				}
			}
		},
		refresh:        {
			operation: {
				summary: 'Обновить токен авторизации',
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'Токен обновлен.',
					schema:      transformSchema(accessTokenSchema)
				}
			}
		},
		control:        {},
		login:          {
			operation: {
				summary:     'Login to company account.',
				description: 'Try to login to the account if code is supplied.\n'
				             + 'Otherwise request login code'
			},
			responses: {
				// 200: {
				// 	status:      200,
				// 	description: 'Login as company user.',
				// 	content:     getJsonApiResponseContentOf(
				// 		'oneOf',
				// 		[mo.CargoCompany, mo.CargoInnCompany],
				// 		{ isArray: true }
				// 	)
				// },
				200: getResponseSchema(
					200,
					() => getJsonApiResponseContentOf(
						'oneOf',
						[mo.CargoCompany, mo.CargoCompanyInn],
						{ isArray: true }
					),
					{ description: 'Login as company user.' }
				),
				404: {
					status:      404,
					description: 'Company entity not found.',
					content:     getJsonApiResponseContent()
				}
			}
		},
		send:           {
			operation: {
				summary:     'Send company info into Bitrix CRM service.',
				description: 'Updates and sends cargo company data with all related '
				             + 'data (transports, drivers) into the Bitrix CRM '
				             + 'service and updates cargo crm_id from result.',
				security
			}
		},
		activate:       {
			operation: {
				summary:     'Сделать выбранную компанию по умолчанию.',
				description: 'Выбранная компания становится по умолчанию, а другие '
				             + 'компании пользователя автоматически становятся неактивными'
			},
			responses: {
				200: {
					status:      200,
					description: 'Компания выбрана по умолчанию.',
					...getApiResponseContentOf(
						'application/json',
						'oneOf',
						[dto.CompanyCreateDto, dto.CompanyInnCreateDto]
					)
				},
				404: {
					status:      404,
					description: 'Компания не найдена.',
					...getApiResponseContent('application/json')
				}
			}
		},
		user:           {
			operation: {},
			responses: {
				200: {
					status:      200,
					description: 'Пользователь найден.',
					...getApiResponseContent(
						'application/json',
						mo.User
					)
				},
				404: {
					status:      404,
					description: 'Компания не найдена.',
					...getApiResponseContent('application/json')
				}
			}
		},
		avatar:         {
			operation: {
				summary: 'Upload company avatar.',
				security
			}
		},
		certificate:    {
			operation: {
				summary: 'Upload certificate scan.',
				security
			}
		},
		passport:       {
			operation: {
				summary:     'Upload passport scan for registration.',
				description: 'Updates passport scan file and sets up link '
				             + 'to the updated file',
				parameters:  [parameter.id],
				security
			}
		},
		order:          {
			operation: {
				summary:     'Upload order scan for registration.',
				description: 'Updates order document scan file and sets up link '
				             + 'to the updated file',
				security
			}
		},
		attorney:       {
			operation: {
				summary:     'Upload attorney sign scan for registration.',
				description: 'Updates attorney sign document scan file and sets up '
				             + 'link to the updated file',
				security
			}
		},
		passportSelfie: {
			operation: {
				summary:     'Upload passport selfie scan for registration.',
				description: 'Updates passport selfie scan file and sets up link '
				             + 'to the updated file',
				parameters:  [parameter.id],
				security
			}
		},
		passportSign:   {
			operation: {
				summary:     'Upload passport sign scan for registration.',
				description: 'Updates passport sign scan file and sets up link '
				             + 'to the updated file',
				parameters:  [parameter.id],
				security
			}
		},
		ogrnip:         {
			operation: {
				summary:     'Upload ogrnip scan for payment.',
				description: 'Updates ogrnip scan file and sets up link to the '
				             + 'updated file',
				security
			}
		}
	};

	export const driver: TApiDescriptor = {
		list:   {
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
		},
		filter: {
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
		},
		index:  {
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
		},
		create: {
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
		},
		update: {
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
		},
		delete: {
			operation: {
				summary:     'Delete driver',
				description: 'Deletes driver specified by `id`',
				security
			}
		},
		avatar: {
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
		},
		front:  {
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
		},
		back:   {
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
	};

	export const event: TApiDescriptor = {
		list:   {
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
		},
		filter: {
			operation: {
				summary:     'Filter events.',
				description: 'Filter list of data by provided body',
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'List of filtered events.',
					...getApiResponseContent('application/json', mo.GatewayEvent, { isArray: true })
				}
			}
		},
		index:  {
			operation: {
				summary:     'Get event',
				description: 'Gets single event specified by `id`',
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'Found event',
					...getApiResponseContent('application/json', mo.GatewayEvent)
				},
				404: {
					status:      404,
					description: 'Event entity not found.',
					...getApiResponseContent('application/json')
				}
			}
		},
		create: {
			operation: {
				summary: 'Create a new event.',
				security
			},
			responses: {
				201: {
					status:      201,
					description: 'Event entity created!',
					...getApiResponseContent(
						'application/json',
						mo.GatewayEvent,
						{ description: 'Created event entity' }
					)
				},
				404: {
					status:      400,
					description: 'Event was not created.',
					...getApiResponseContent('application/json')
				}
			}
		},
		update: {
			operation: {
				summary:     'Update event',
				description: 'Updates single event specified by `id`',
				requestBody: { $ref: getSchemaPath(dto.GatewayEventUpdateDto) },
				security
			},
			responses: {
				200: {
					status:      200,
					description: 'Updated event entity',
					...getApiResponseContent('application/json', mo.GatewayEvent)
				}
			}
		},
		delete: {
			operation: {
				summary:     'Delete event',
				description: 'Deletes event specified by `id`',
				security
			}
		}
	};

	export const generator: TApiDescriptor = {
		company: {
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
		},
		order:   {
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
	};

	export const image: TApiDescriptor = {
		list:   {
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
		},
		filter: {
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
		},
		index:  {
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
		},
		create: {
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
		},
		update: {
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
		},
		delete: {
			operation: {
				summary:     'Delete image',
				description: 'Deletes image specified by `id`',
				security
			}
		}
	};

	export const offer: TApiDescriptor = {
		list:      {
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
		},
		filter:    {
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
		},
		index:     {
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
		},
		update:    {
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
		},
		send:      {},
		upd:       {},
		sendList:  {
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
		},
		accept:    {
			operation: {
				summary:     'Accept offer.',
				description: 'Accept driver\'s response for order offer.',
				security
			}
		},
		decline:   {
			operation: {
				summary:     'Decline offer.',
				description: 'Decline driver\'s response for order offer.',
				security
			}
		},
		order:     {
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
		},
		driver:    {
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
		},
		driverUpd: {},
		transport: {}
	};

	export const order: TApiDescriptor = {
		list:
			{
				operation:
					{
						summary: 'Get list of orders',
						security
					},
				responses:
					{
						200: {
							status:      200,
							description: 'List of orders.',
							...getApiResponseContent('application/json', mo.Order, { isArray: true })
						}
					}
			},
		filter:
			{
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
			},
		index:
			{
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
			},
		create:
			{
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
			},
		update:
			{
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
			},
		delete:
			{
				operation: {
					summary:     'Delete order',
					description: 'Deletes order specified by `id`',
					security
				}
			},
		cargos:
			{
				operation: {
					summary:     'Get list of orders of cargo company.',
					description: 'Get orders related to specific cargo company by `id`.'
				}
			},
		driver:
			{
				operation: {
					summary:     'Get list of orders of driver.',
					description: 'Get orders related to specific driver by `id`.'
				}
			},
		send:
			{
				operation: {
					summary:     'Update order in bitrix.',
					description: 'Update fields of order in bitrix from database '
					             + 'actions.\nIt must be called every time when order '
					             + 'updated locally in database.'
				}
			},
		shipping:
			{
				operation: {
					summary:     'Загрузить отгрузочные документы.',
					description: 'Загрузить файлы отгрузочных документов когда водитель '
					             + 'завершает разгрузку груза в точке `pt`.'
					             + ' Поддерживается загрузка как одиночных, так и множественных файлов.'
					             + ' После этого можно перейти к выполнению след. после `pt` точки.'
				}
			},
		shippingDelete:
			{
				operation: {
					summary:     'Удалить фото отгрузочных документов.',
					description: 'Удаляет фото отгрузчных документов, в точке `pt` с индексом `index`.'
					             + ' При указании индекса файла в загруженных файла'
					             + ' отгрузочных документов удаляется фото на указанном индекса.'
					             + ' При отсутствии такогого индекса удаляются все файлы.'
				}
			},
		payment:
			{
				operation: {
					summary:     'Send payment document.',
					description: 'Upload document scans of cargo company driver with'
					             + ' related order. Sent scan is stored in Yandex '
					             + 'Storage Object which returns link to the '
					             + 'uploaded file.'
				}
			},
		paymentDelete:
			{
				operation: {
					summary:     'Delete payment document.',
					description: 'Delete uploaded document scans of cargo company driver with'
					             + ' related order. Sent scan is stored in Yandex '
					             + 'Storage Object which returns link to the '
					             + 'uploaded file.'
				}
			},
		contract:
			{
				operation: {
					summary:     'Send contract document.',
					description: 'Upload document scans of cargo company driver with'
					             + ' related order. Sent scan is stored in Yandex '
					             + 'Storage Object which returns link to the '
					             + 'uploaded file.'
				}
			},
		contractDelete:
			{
				operation: {
					summary:     'Delete contract document.',
					description: 'Delete uploaded document scans of cargo company '
					             + 'driver with related order.'
				}
			},
		receipt:
			{
				operation: {
					summary:     'Send receipt document.',
					description: 'Upload document scans of cargo company driver with'
					             + ' related order. Sent scan is stored in Yandex '
					             + 'Storage Object which returns link to the '
					             + 'uploaded file.'
				}
			},
		receiptDelete:
			{
				operation: {
					summary:     'Delete receipt document.',
					description: 'Delete uploaded document scans of cargo company driver with'
					             + ' related order. Sent scan is stored in Yandex '
					             + 'Storage Object which returns link to the '
					             + 'uploaded file.'
				}
			}
	};

	export const payment: TApiDescriptor = {
		list:
			{
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
			},
		filter:
			{
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
			},
		index:
			{
				operation: {
					summary:     'Get payment.',
					description: 'Gets single payment specified by `id`',
					security
				},
				responses: {
					200: {
						status:      200,
						description: 'Found payment',
						...getApiResponseContent('application/json', mo.Payment)
					},
					404: {
						status:      404,
						description: 'Payment entity not found.',
						...getApiResponseContent('application/json')
					}
				}
			},
		create:
			{
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
			},
		update:
			{
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
			},
		delete:
			{
				operation: {
					summary:     'Delete payment',
					description: 'Deletes payment specified by `id`',
					security
				}
			}
	};

	export const reference: TApiDescriptor = {
		address:
			{
				operation: { summary: 'Get address specified by `id`' }
			},
		addresses:
			{
				operation: { summary: 'Get list of addresses.' }
			},
		filter:
			{
				operation: { summary: 'Get list of filtered addresses.' }
			},
		fixtures:
			{
				operation: { summary: 'Get list of transport additional fixtures.' }
			},
		loadingTypes:
			{
				operation: { summary: 'Get list of transport loading types.' }
			},
		payloads:
			{
				operation: { summary: 'Get list of transport payloads.' }
			},
		paymentTypes:
			{
				operation: { summary: 'Get list of company payment types.' }
			},
		riskClasses:
			{
				operation: { summary: 'Get list of transport risk classes.' }
			},
		transportTypes:
			{
				operation: { summary: 'Get list of transport types.' }
			},
		transportBrands:
			{},
		transportModels:
			{}
	};

	export const transport: TApiDescriptor = {
		list:
			{
				operation: {
					summary: 'Получить все транспорты',
					security
				},
				responses: {
					200: {
						status:      200,
						description: 'Список транспортов.',
						...getApiResponseContent('application/json', mo.Transport, { isArray: true })
					}
				}
			},
		filter:
			{
				operation: {
					summary:     'Фильтрация транспортов',
					description: 'Фильтрует траснпорты по определенным значениям объекта фильтра',
					security
				},
				responses: {
					200: {
						status:      200,
						description: 'Список подходящих под фильтры транспортов.',
						...getApiResponseContent('application/json', mo.Transport, { isArray: true })
					}
				}
			},
		index:
			{
				operation: {
					summary:     'Получить транспорт.',
					description: 'Возвращает объек транспорта со значением `id` или возвращает `undefined`',
					security
				},
				responses: {
					200: {
						status:      200,
						description: 'Найден транспорт',
						...getApiResponseContent('application/json', mo.Transport)
					},
					404: {
						status:      404,
						description: 'Payment entity not found.',
						...getApiResponseContent('application/json')
					}
				}
			},
		create:
			{
				operation: {
					summary:     'Создать новый транспорт',
					description: 'При созздании транспорта необходимо указать `id` компании '
					             + '(либо ЮЛ - `cargoId`, либо ИП/ФЛ - `cargoinnId`) и `id` водителя этой компании.',
					security
				},
				responses: {
					201: {
						status:      201,
						description: 'Транспорт создан!',
						...getApiResponseContent(
							'application/json',
							mo.Transport,
							{ description: 'Вновь созданный объект транспорта' }
						)
					},
					404: {
						status:      400,
						description: 'Не удалось создать транспорт.',
						...getApiResponseContent('application/json')
					}
				}
			},
		update:
			{
				operation: {
					summary:     'Обновить данные транспота.',
					description: 'Обновляет значения полей транспорта с `id` и возвращает обновленный транспорт',
					security
				},
				responses: {
					200: {
						status:      200,
						description: 'Обновленный транспорт.',
						...getApiResponseContent('application/json', mo.Transport)
					},
					400: {
						status:      400,
						description: 'Не удалось обновить данные транспорта.',
						...getApiResponseContent('application/json')
					},
					404: {
						status:      404,
						description: 'Транспорт не найден.',
						...getApiResponseContent('application/json')
					}
				}
			},
		delete:
			{
				operation: {
					summary:     'Удалить транспорт по `id`.',
					description: 'При удалении транспорта удаляются также фото '
					             + 'как с сетевого хранилища, так и с БД.',
					security
				}
			},
		activate:
			{
				operation: {
					summary:     'Делает выбранный транспорт активным/по умолчанию.',
					description: 'При этом остальные транспорты кроме выбранного становятся неактивными. '
					             + 'Если транспорт не прицеп то неактивными становятся только транспорты не прицепы и наоборот.'
				},
				responses: {
					200: {
						status:      200,
						description: 'Обновленный транспорт.',
						...getApiResponseContent('application/json', mo.Transport)
					},
					400: {
						status:      400,
						description: 'Не удалось активировать транспорт.',
						...getApiResponseContent('application/json')
					}
				}
			},
		driver:
			{
				operation: {
					summary: 'Возвращает транспорты принадлежащие указанному водителю.'
				},
				responses: {
					200: {
						status:      200,
						description: 'Список транспортов.',
						content:     getJsonApiResponseContent(mo.Transport, { isArray: true })
					}
				}
			},
		image:
			{
				operation: {
					summary:     'Загружает фото транспорта',
					description: 'При загрузке фото имя файла меняется на строку полученную от функции md5.'
				},
				responses: {
					200: {
						status:      200,
						description: 'Фото загружена!',
						content:     getJsonApiResponseContent(mo.Image)
					},
					400: {
						status:      400,
						description: 'Не удалось удалить файл.',
						content:     getJsonApiResponseContent()
					},
					404: {
						status:      404,
						description: 'Транспорт не найден!',
						content:     getJsonApiResponseContent()
					}
				}
			},
		imageDel:
			{
				operation: {
					summary:     'Удалить фото транспорта',
					description: 'Безвозвратно удаляет загруженный фото транспорта.'
				},
				responses: {
					200: {
						status:      200,
						description: 'Фото удалена!',
						content:     { 'application/json': { schema: transformSchema(affectedCountSchema) } }
					},
					400: {
						status:      400,
						description: 'Не удалось удалить файл.',
						content:     getJsonApiResponseContent()
					},
					404: {
						status:      404,
						description: 'Транспорт не найден!',
						content:     getJsonApiResponseContent()
					}
				}
			},
		diag:
			{
				operation: {
					summary:     'Загружает фото диагностической карты транспорта.',
					description: 'При загрузке фото имя файла меняется на строку полученную от функции md5. '
					             + 'Если есть загруженный заранее файл то новая перезаписывает старую.'
				},
				responses: {
					200: {
						status:      200,
						description: 'Обновленный транспорт.',
						content:     getJsonApiResponseContent(mo.Transport)
					},
					400: {
						status:      200,
						description: 'Не удалось обновить данные транспорта.',
						content:     getJsonApiResponseContent()
					},
					404: {
						status:      200,
						description: 'Транспорт не найден.',
						content:     getJsonApiResponseContent()
					}
				}
			},
		osago:
			{
				operation: {
					summary:     'Загружает фото ОСАГО транспорта.',
					description: 'При загрузке фото имя файла меняется на строку полученную от функции md5. '
					             + 'Если есть загруженный заранее файл то новая перезаписывает старую.'
				},
				responses: {
					200: {
						status:      200,
						description: 'Обновленный транспорт.',
						content:     getJsonApiResponseContent(mo.Transport)
					},
					400: {
						status:      400,
						description: 'Не удалось обновить данные транспорта.',
						content:     getJsonApiResponseContent()
					},
					404: {
						status:      404,
						description: 'Транспорт не найден.',
						content:     getJsonApiResponseContent()
					}
				}
			}
	};
}
