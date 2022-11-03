import {
	Type,
	RequestMethod
}                        from '@nestjs/common';
import {
	getSchemaPath,
	ApiResponseSchemaHost
}                        from '@nestjs/swagger';
import { ContentObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import {
	IApiRoute,
	TApiResponseSchemaOptions,
	TMediaType
}                        from '@common/interfaces';

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
		schema: {
			type:        'object',
			description: options?.description,
			properties:  !!classRef ? {
				status:  {
					type:     'number',
					nullable: false
				},
				data:    (!!options?.isArray)
				         ? { type: 'array', items: { $ref: getSchemaPath(classRef) } }
				         : { $ref: getSchemaPath(classRef) },
				message: {
					type:     'string',
					nullable: true
				}
			} : {
				status:  {
					type:     'number',
					nullable: false
				},
				message: {
					type:     'string',
					nullable: false
				}
			}
		}
	};
};

/**@ignore*/
export const getApiResponseSchemaOf = (
	key: 'oneOf' | 'anyOf' | 'allOf',
	classRefs?: Type[],
	options?: TApiResponseSchemaOptions
): ApiResponseSchemaHost =>
{
	const items = { [key]: classRefs.map(classRef => ({ $ref: getSchemaPath(classRef) })) };

	return {
		schema: {
			type:        'object',
			description: options?.description,
			properties:  {
				status:  {
					type:     'number',
					nullable: false
				},
				data:    (!!options?.isArray)
				         ? { type: 'array', items }
				         : items,
				message: {
					type:     'string',
					nullable: true
				}
			}
		}
	};
};
