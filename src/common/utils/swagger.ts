import { Type }          from '@nestjs/common';
import {
	ApiResponseOptions,
	ApiResponseSchemaHost,
	getSchemaPath
}                        from '@nestjs/swagger';
import { ContentObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import env               from '@config/env';
import {
	TApiResponseSchemaOptions,
	TMediaType
}                        from '@common/interfaces';

/**@ignore*/
export function getApiResponseContent(
	mediaType: TMediaType,
	classRef?: Type,
	options?: TApiResponseSchemaOptions
): Record<string, ApiResponseSchemaHost> {
	switch(mediaType) {
		case 'application/json':
			return { 'application/json': getApiResponseSchema(classRef, options) };
		case 'application/xml':
			return { 'application/xml': getApiResponseSchema(classRef, options) };
		default:
			throw new Error(`Wrong media type ${mediaType}`);
	}
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
export function getJsonApiResponseContent(
	classRef?: Type,
	options?: TApiResponseSchemaOptions
): Record<string, ApiResponseSchemaHost> {
	return { 'application/json': getApiResponseSchema(classRef, options) };
}

/**@ignore*/
export function getJsonApiResponseContentOf(
	key: 'oneOf' | 'anyOf' | 'allOf',
	classRefs?: Type[],
	options?: TApiResponseSchemaOptions
): Record<string, ApiResponseSchemaHost> {
	return { 'application/json': getApiResponseSchemaOf(key, classRefs, options) };
}

export function getResponseSchema(
	httpCode: number,
	contentFn: () => Record<string, ApiResponseSchemaHost>,
	options: Omit<ApiResponseOptions, 'content' | 'status'> = {}
): ApiResponseOptions {

	return {
		status:  httpCode,
		content: contentFn(),
		...options
	};
}

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
