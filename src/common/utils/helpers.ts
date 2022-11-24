import md5                    from 'md5';
import path                   from 'path';
import * as ex                from 'express';
import env                    from '@config/env';
import {
	RANDOM_CODE_MAX,
	RANDOM_CODE_DIGITS
}                             from '@common/constants';
import {
	IApiResponse,
	TMulterFile
}                             from '@common/interfaces';
import { transformApiResult } from '@common/utils/compat';
import Driver                 from '@models/driver.entity';
import Transport              from '@models/transport.entity';

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

export function fileExt(file: { mimetype?: string }) {
	if(file.mimetype) {
		switch(file.mimetype) {
			case 'image/gif':
				return 'gif';
			case 'image/jpeg':
				return 'jpeg';
			case 'image/jpg':
				return 'jpg';
			case 'image/png':
				return 'png';
			case 'image/svg+xml':
				return 'svg';
			case 'image/webp':
				return 'webp';
		}
	}
	return 'jpeg';
}

export function renameMulterFiles(files: TMulterFile[], ...args: string[]) {
	return files.map(({ originalname: name, ...rest }) => ({
		originalname: path.join(...args, `${md5(rest.buffer)}.${fileExt({ mimetype: rest.mimetype })}`),
		...rest
	})) as TMulterFile[];
}

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

export function sendResponse<T = any>(
	response: ex.Response,
	result: IApiResponse<T>,
	transform: boolean = env.api.compatMode
) {
	return response.status(result?.statusCode ?? 400)
	               .send(
		               transform ? transformApiResult(result)
		                         : result
	               );
}
