import { RequestMethod, Type } from '@nestjs/common';
import {
	ApiResponseSchemaHost,
	getSchemaPath
}                              from '@nestjs/swagger';
import { ContentObject }       from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import env                     from '@config/env';
import {
	IApiRoute,
	TApiResponseSchemaOptions,
	TMediaType
}                              from '@common/interfaces';

/**@ignore*/
export const commonRoutes = <T = any, K extends keyof IApiRoute<T> = keyof IApiRoute<T>>
(classRef: Type<T>, omit: K[] = []): IApiRoute<T> =>
{
	let commonRouteConfig: IApiRoute<T> = {
		list:   {
			path:   '',
			method: RequestMethod.GET
		},
		filter: {
			path:   'filter',
			method: RequestMethod.POST
		},
		index:  {
			path:   ':id',
			method: RequestMethod.GET
		},
		create: {
			path:   '',
			method: RequestMethod.POST
		},
		update: {
			path:   ':id',
			method: RequestMethod.PUT
		},
		delete: {
			path:   ':id',
			method: RequestMethod.DELETE
		}
	};

	omit.forEach(
		(routeKey) =>
		{
			if(routeKey in commonRouteConfig) {
				commonRouteConfig = Object.fromEntries(
					Object.entries(commonRouteConfig)
					      .filter(([k, _]) => k !== routeKey)
				);
			}
		}
	);

	return commonRouteConfig;
};

/**@ignore*/
export function getApiResponseContent(
	mediaType: TMediaType,
	classRef?: Type,
	options?: TApiResponseSchemaOptions
): { content: ContentObject } {
	let value: { content: ContentObject } = { content: null };

	switch(mediaType) {
		case 'application/json':
			value.content = { 'application/json': getApiResponseSchema(classRef, options) };
			break;
		case 'application/xml':
			value.content = { 'application/xml': getApiResponseSchema(classRef, options) };
			break;
	}

	return value;
}

/**@ignore*/
export const getApiResponseContentOf = (
	mediaType: TMediaType,
	key: 'oneOf' | 'anyOf' | 'allOf',
	classRefs?: Type[],
	options?: TApiResponseSchemaOptions
): { content: ContentObject } =>
{
	let value: { content: ContentObject } = { content: null };

	switch(mediaType) {
		case 'application/json':
			value.content = { 'application/json': getApiResponseSchemaOf(key, classRefs, options) };
			break;
		case 'application/xml':
			value.content = { 'application/xml': getApiResponseSchemaOf(key, classRefs, options) };
			break;
	}

	return value;
};

/**@ignore*/
export const getApiResponseSchema = (
	classRef?: Type,
	options?: TApiResponseSchemaOptions
): ApiResponseSchemaHost =>
{
	return {
		schema: env.api.compatMode ? (
			(!!options?.isArray)
			? { type: 'array', items: { $ref: getSchemaPath(classRef) } }
			: { $ref: getSchemaPath(classRef) }
		) : {
			type:        'object',
			description: options?.description,
			properties:  !!classRef ? {
				statusCode: {
					type:     'number',
					nullable: false
				},
				data:       (!!options?.isArray)
				            ? { type: 'array', items: { $ref: getSchemaPath(classRef) } }
				            : { $ref: getSchemaPath(classRef) },
				message:    {
					type:     'string',
					nullable: true
				}
			} : {
				statusCode: {
					type:     'number',
					nullable: false
				},
				message:    {
					type:     'string',
					nullable: false
				}
			}
		}
	};
};

/**@ignore*/
const getItems = (key: 'oneOf' | 'anyOf' | 'allOf', classRefs: Type[]) =>
	({ [key]: classRefs.map(classRef => ({ $ref: getSchemaPath(classRef) })) });

/**@ignore*/
export const getApiResponseSchemaOf = (
	key: 'oneOf' | 'anyOf' | 'allOf',
	classRefs?: Type[],
	options?: TApiResponseSchemaOptions
): ApiResponseSchemaHost =>
{
	return {
		schema: env.api.compatMode ? (
			(!!options?.isArray)
			? { type: 'array', items: getItems(key, classRefs) }
			: getItems(key, classRefs)
		) : {
			type:        'object',
			description: options?.description,
			items:       { type: 'array', items: getItems(key, classRefs) },
			properties:  {
				statusCode: {
					type:     'number',
					nullable: false
				},
				data:       (!!options?.isArray)
				            ? { type: 'array', items: getItems(key, classRefs) }
				            : getItems(key, classRefs),
				message:    {
					type:     'string',
					nullable: true
				}
			}
		}
	};
};
