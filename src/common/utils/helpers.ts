import * as ex                  from 'express';
import {
	RANDOM_CODE_MAX,
	RANDOM_CODE_DIGITS
}                               from '@common/constants';
import { IApiResponse, IModel } from '@common/interfaces';
import Driver                   from '@models/driver.entity';
import Transport                from '@models/transport.entity';
import EntityModel              from '@models/entity-model';

const phoneRegex = RegExp(/[\s+()]+/gi);

export const formatPhone = (phoneNumber?: string): string | undefined =>
	phoneNumber ? phoneNumber.replace(phoneRegex, '') : undefined;

export const getRandomCode = (
	digits: number = RANDOM_CODE_DIGITS,
	max: number = RANDOM_CODE_MAX
): string => Math.round(digits + (max * Math.random())).toString();

export const isNumber = (value: any): boolean => !isNaN(Number(value));

export const min = (a: number, b: number): number => a > b ? b : a;

export const randomOf = <T>(...args: T[]): T => args[Math.floor(Math.random() * args?.length)];

export function transformTransportParameters(transport: Transport): Transport {
	if(transport.weightExtra > 0) transport.weight = transport.weightExtra;
	if(transport.volumeExtra > 0) transport.volume = transport.volumeExtra;
	return transport;
}

export function transformDriverTransports(driver: Driver): Driver {
	if(driver.transports !== undefined)
		driver.transports = driver.transports.map(transformTransportParameters);

	return driver;
}

export async function deleteEntityImages(list: any[])
	: Promise<number> {
	if(!list)
		return 0;

	return Promise.all(
		list.map(async(e) => await e.deleteImages())
	).then(
		res => res.reduce((p, c) => p + c, 0)
	);
}

export function expandApiResult<T = any>(result: IApiResponse<T>) {
	if(!result.data) {
		return {
			status:  result.statusCode,
			message: result.message
		};
	}

	const expandModel = <T extends IModel, M extends EntityModel<T>>(
		model: M,
		fromArray: boolean = false
	) => (fromArray ? {
			...(model.get({ clone: false, plain: true }) ?? {})
		}
	                : {
			status:  result.statusCode,
			message: result.message,
			...(model.get({ clone: false, plain: true }) ?? {})
		});

	if(Array.isArray(result.data)) {
		if(result.data.length > 0) {
			if(result.data[0] instanceof EntityModel)
				return result.data.map(d => expandModel(d, true));
			else
				return result.data;
		}

		return {
			status:  result.statusCode,
			message: result.message
		};
	}
	else if(result.data instanceof EntityModel)
		return expandModel(result.data);
	else
		return {
			status:  result.statusCode,
			message: result.message,
			...(result.data ?? {})
		};
}

export function sendResponse<T = any>(
	response: ex.Response,
	result: IApiResponse<T>
) {
	return response.status(result.statusCode)
	               .send(expandApiResult(result));
}
